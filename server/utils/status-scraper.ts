// Status page scraper for Databricks (Azure/AWS) and Azure Status pages
// Stores raw HTML/JSON to Databricks Volumes, then parses to Delta table

import { executeSQLQuery } from './databricks-sql';

// Validate catalog/schema/table identifiers to prevent SQL injection
function validateIdentifier(identifier: string): boolean {
  // Only allow alphanumeric, underscores, and periods (for catalog.schema.table)
  const validPattern = /^[a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)*$/;
  return validPattern.test(identifier);
}

function validateAndEscapeIdentifier(identifier: string, name: string): string {
  if (!validateIdentifier(identifier)) {
    throw new Error(`Invalid ${name}: must contain only alphanumeric characters, underscores, and periods`);
  }
  return identifier;
}

// SQL escape helper for string values
function escapeSQLString(value: string): string {
  return value.replace(/'/g, "''");
}

// Validate and escape ISO timestamp for SQL TIMESTAMP literals
function validateAndEscapeTimestamp(timestamp: string): string {
  // Validate ISO 8601 format to prevent SQL injection
  const isoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/;
  if (!isoPattern.test(timestamp)) {
    throw new Error(`Invalid timestamp format: ${timestamp}`);
  }
  // Even though validated, still escape for defense in depth
  return escapeSQLString(timestamp);
}

// Generate stable incident ID from content (prevents duplicates in MERGE)
function generateIncidentId(source: string, title: string, startTime: string): string {
  // Create a stable hash-like ID from source + title + start time
  // In production, use actual incident ID from status page API/HTML if available
  const normalized = `${source}_${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${startTime}`;
  return normalized.substring(0, 255); // Limit length for database
}

export interface StatusPageConfig {
  workspaceUrl: string;
  warehouseId: string;
  token: string;
  volumePath: string; // e.g., "uc_dev_edap_platform_01.edap_monitoring_de.edap_status_monitoring_vol"
  catalogSchema: string; // e.g., "uc_dev_edap_platform_01.edap_monitoring_de"
}

export interface ScrapedData {
  source: 'databricks_azure' | 'databricks_aws' | 'azure_status';
  url: string;
  timestamp: string;
  rawContent: string; // HTML or JSON
  contentType: 'html' | 'json';
}

export interface ParsedIncident {
  incident_id: string;
  source_system: string;
  incident_type: 'outage' | 'degraded_performance' | 'planned_maintenance' | 'informational';
  severity: 'critical' | 'major' | 'minor' | 'none';
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved' | 'scheduled' | 'in_progress' | 'completed';
  title: string;
  description: string;
  affected_services: string[];
  affected_regions: string[];
  start_time: string;
  end_time?: string;
  last_update_time: string;
  updates: Array<{
    timestamp: string;
    status: string;
    message: string;
  }>;
  source_url: string;
  raw_data_path: string;
}

// Scrape Databricks status page (HTML)
export async function scrapeDatabricksStatus(
  platform: 'azure' | 'aws'
): Promise<ScrapedData> {
  const urls = {
    azure: 'https://status.azuredatabricks.net/',
    aws: 'https://status.databricks.com/'
  };

  const url = urls[platform];
  console.log(`Scraping Databricks ${platform.toUpperCase()} status page: ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }

    const html = await response.text();
    const timestamp = new Date().toISOString();

    return {
      source: platform === 'azure' ? 'databricks_azure' : 'databricks_aws',
      url,
      timestamp,
      rawContent: html,
      contentType: 'html',
    };
  } catch (error) {
    console.error(`Error scraping Databricks ${platform} status:`, error);
    throw error;
  }
}

// Scrape Azure public status page (HTML)
export async function scrapeAzureStatus(): Promise<ScrapedData> {
  const url = 'https://azure.status.microsoft/';
  console.log(`Scraping Azure status page: ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }

    const html = await response.text();
    const timestamp = new Date().toISOString();

    return {
      source: 'azure_status',
      url,
      timestamp,
      rawContent: html,
      contentType: 'html',
    };
  } catch (error) {
    console.error('Error scraping Azure status:', error);
    throw error;
  }
}

// Write raw data to Databricks Volume using Files API
export async function writeToVolume(
  data: ScrapedData,
  config: StatusPageConfig
): Promise<string> {
  const timestamp = data.timestamp.replace(/[:.]/g, '-');
  const fileName = `${data.source}_${timestamp}.${data.contentType}`;
  
  // Convert volume path to Files API path format
  // Volume path: "uc_dev_edap_platform_01.edap_monitoring_de.edap_status_monitoring_vol"
  // Files API path: "/Volumes/uc_dev_edap_platform_01/edap_monitoring_de/edap_status_monitoring_vol/filename"
  const pathParts = config.volumePath.split('.');
  const filesApiPath = `/Volumes/${pathParts.join('/')}/${fileName}`;

  console.log(`Writing to volume: ${filesApiPath}`);

  try {
    // Use Databricks Files API: https://docs.databricks.com/api/workspace/files/upload
    const url = `${config.workspaceUrl}/api/2.0/fs/files${filesApiPath}`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/octet-stream',
      },
      body: data.rawContent,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Files API error: ${response.status} ${errorText}`);
    }

    console.log(`Successfully wrote ${fileName} to volume`);
    return filesApiPath;
  } catch (error) {
    console.error('Error writing to volume:', error);
    throw new Error(`Failed to write to volume: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Parse HTML to extract incidents
export function parseStatusPageHTML(data: ScrapedData): ParsedIncident[] {
  const incidents: ParsedIncident[] = [];
  const html = data.rawContent;

  // This is a simplified parser - real implementation would need robust HTML parsing
  // For production, use a library like 'cheerio' or 'jsdom'
  
  try {
    // Extract incident blocks using regex patterns
    // Status pages typically use specific class names like 'incident', 'component-status', etc.
    
    // Example pattern for Databricks/StatusPage.io format:
    const incidentPattern = /<div[^>]*class="[^"]*incident[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
    const matches = Array.from(html.matchAll(incidentPattern));

    for (const match of matches) {
      const incidentHTML = match[1];
      
      // Extract incident details (simplified - real parser would be more robust)
      const titleMatch = incidentHTML.match(/<h[1-6][^>]*>([^<]+)<\/h/i);
      const statusMatch = incidentHTML.match(/status[^>]*>([^<]+)</i);
      const timeMatch = incidentHTML.match(/datetime="([^"]+)"/i);
      
      if (titleMatch) {
        const title = titleMatch[1].trim();
        const startTime = timeMatch?.[1] || data.timestamp;
        
        incidents.push({
          incident_id: generateIncidentId(data.source, title, startTime),
          source_system: data.source,
          incident_type: inferIncidentType(incidentHTML),
          severity: inferSeverity(incidentHTML),
          status: inferStatus(statusMatch?.[1] || ''),
          title,
          description: extractDescription(incidentHTML),
          affected_services: extractAffectedServices(incidentHTML),
          affected_regions: extractAffectedRegions(incidentHTML),
          start_time: startTime,
          last_update_time: data.timestamp,
          updates: extractUpdates(incidentHTML),
          source_url: data.url,
          raw_data_path: '', // Will be set by caller with actual volume path
        });
      }
    }

    console.log(`Parsed ${incidents.length} incidents from ${data.source}`);
    return incidents;
  } catch (error) {
    console.error('Error parsing HTML:', error);
    return [];
  }
}

// Helper functions for parsing
function inferIncidentType(html: string): ParsedIncident['incident_type'] {
  const lower = html.toLowerCase();
  if (lower.includes('maintenance') || lower.includes('scheduled')) return 'planned_maintenance';
  if (lower.includes('outage') || lower.includes('down')) return 'outage';
  if (lower.includes('degraded') || lower.includes('partial')) return 'degraded_performance';
  return 'informational';
}

function inferSeverity(html: string): ParsedIncident['severity'] {
  const lower = html.toLowerCase();
  if (lower.includes('critical') || lower.includes('major outage')) return 'critical';
  if (lower.includes('major') || lower.includes('down')) return 'major';
  if (lower.includes('minor') || lower.includes('degraded')) return 'minor';
  return 'none';
}

function inferStatus(statusText: string): ParsedIncident['status'] {
  const lower = statusText.toLowerCase();
  if (lower.includes('investigating')) return 'investigating';
  if (lower.includes('identified')) return 'identified';
  if (lower.includes('monitoring')) return 'monitoring';
  if (lower.includes('resolved') || lower.includes('completed')) return 'resolved';
  if (lower.includes('scheduled')) return 'scheduled';
  if (lower.includes('progress')) return 'in_progress';
  return 'investigating';
}

function extractDescription(html: string): string {
  const descMatch = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  return descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim() : '';
}

function extractAffectedServices(html: string): string[] {
  const services: string[] = [];
  const componentPattern = /component[^>]*>([^<]+)/gi;
  const matches = Array.from(html.matchAll(componentPattern));
  
  for (const match of matches) {
    const service = match[1].trim();
    if (service && !services.includes(service)) {
      services.push(service);
    }
  }
  
  return services.length > 0 ? services : ['Unknown'];
}

function extractAffectedRegions(html: string): string[] {
  const regions: string[] = [];
  const regionPattern = /region[^>]*>([^<]+)|location[^>]*>([^<]+)/gi;
  const matches = Array.from(html.matchAll(regionPattern));
  
  for (const match of matches) {
    const region = (match[1] || match[2])?.trim();
    if (region && !regions.includes(region)) {
      regions.push(region);
    }
  }
  
  return regions.length > 0 ? regions : ['Global'];
}

function extractUpdates(html: string): Array<{ timestamp: string; status: string; message: string }> {
  const updates: Array<{ timestamp: string; status: string; message: string }> = [];
  
  // Extract update blocks
  const updatePattern = /<div[^>]*class="[^"]*update[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
  const matches = Array.from(html.matchAll(updatePattern));
  
  for (const match of matches) {
    const updateHTML = match[1];
    const timeMatch = updateHTML.match(/datetime="([^"]+)"/i);
    const statusMatch = updateHTML.match(/status[^>]*>([^<]+)/i);
    const messageMatch = updateHTML.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    
    if (messageMatch) {
      updates.push({
        timestamp: timeMatch?.[1] || new Date().toISOString(),
        status: statusMatch?.[1] || 'update',
        message: messageMatch[1].replace(/<[^>]+>/g, '').trim(),
      });
    }
  }
  
  return updates;
}

// Upsert parsed incidents to Delta table
export async function upsertToDeltaTable(
  incidents: ParsedIncident[],
  config: StatusPageConfig
): Promise<void> {
  if (incidents.length === 0) {
    console.log('No incidents to upsert');
    return;
  }

  // Validate catalog schema to prevent SQL injection
  const validatedSchema = validateAndEscapeIdentifier(config.catalogSchema, 'catalogSchema');
  const tableName = `${validatedSchema}.platform_status_events`;
  console.log(`Upserting ${incidents.length} incidents to ${tableName}`);

  try {
    for (const incident of incidents) {
      // Escape all string values to prevent SQL injection
      const escapedTitle = escapeSQLString(incident.title);
      const escapedDescription = escapeSQLString(incident.description);
      const escapedSourceUrl = escapeSQLString(incident.source_url);
      const escapedRawDataPath = escapeSQLString(incident.raw_data_path);
      const escapedUpdatesJson = escapeSQLString(JSON.stringify(incident.updates));
      
      // Validate and escape timestamps
      const escapedStartTime = validateAndEscapeTimestamp(incident.start_time);
      const escapedEndTime = incident.end_time ? validateAndEscapeTimestamp(incident.end_time) : null;
      const escapedLastUpdateTime = validateAndEscapeTimestamp(incident.last_update_time);
      
      // Build arrays with at least one element to avoid ARRAY() syntax error
      const services = incident.affected_services.length > 0 
        ? incident.affected_services 
        : ['Unknown'];
      const regions = incident.affected_regions.length > 0 
        ? incident.affected_regions 
        : ['Global'];
      const escapedServices = services.map(s => `'${escapeSQLString(s)}'`).join(',');
      const escapedRegions = regions.map(r => `'${escapeSQLString(r)}'`).join(',');
      
      // Use MERGE for upsert operation
      const query = `
        MERGE INTO ${tableName} AS target
        USING (
          SELECT
            '${escapeSQLString(incident.incident_id)}' AS incident_id,
            '${incident.source_system}' AS source_system,
            '${incident.incident_type}' AS incident_type,
            '${incident.severity}' AS severity,
            '${incident.status}' AS status,
            '${escapedTitle}' AS title,
            '${escapedDescription}' AS description,
            ARRAY(${escapedServices}) AS affected_services,
            ARRAY(${escapedRegions}) AS affected_regions,
            TIMESTAMP '${escapedStartTime}' AS start_time,
            ${escapedEndTime ? `TIMESTAMP '${escapedEndTime}'` : 'NULL'} AS end_time,
            TIMESTAMP '${escapedLastUpdateTime}' AS last_update_time,
            '${escapedUpdatesJson}' AS updates_json,
            '${escapedSourceUrl}' AS source_url,
            '${escapedRawDataPath}' AS raw_data_path,
            CURRENT_TIMESTAMP() AS ingestion_timestamp
        ) AS source
        ON target.incident_id = source.incident_id
        WHEN MATCHED THEN
          UPDATE SET
            status = source.status,
            description = source.description,
            end_time = source.end_time,
            last_update_time = source.last_update_time,
            updates_json = source.updates_json,
            ingestion_timestamp = source.ingestion_timestamp
        WHEN NOT MATCHED THEN
          INSERT (
            incident_id, source_system, incident_type, severity, status,
            title, description, affected_services, affected_regions,
            start_time, end_time, last_update_time, updates_json,
            source_url, raw_data_path, ingestion_timestamp
          )
          VALUES (
            source.incident_id, source.source_system, source.incident_type,
            source.severity, source.status, source.title, source.description,
            source.affected_services, source.affected_regions, source.start_time,
            source.end_time, source.last_update_time, source.updates_json,
            source.source_url, source.raw_data_path, source.ingestion_timestamp
          )
      `;

      await executeSQLQuery(query, {
        workspaceUrl: config.workspaceUrl,
        warehouseId: config.warehouseId,
        token: config.token,
      });
    }

    console.log(`Successfully upserted ${incidents.length} incidents`);
  } catch (error) {
    console.error('Error upserting to Delta table:', error);
    throw error;
  }
}

// Main scraping workflow
export async function runStatusScraper(config: StatusPageConfig): Promise<{
  databricks_azure: number;
  databricks_aws: number;
  azure_status: number;
}> {
  console.log('Starting status page scraping workflow...');
  
  const results = {
    databricks_azure: 0,
    databricks_aws: 0,
    azure_status: 0,
  };

  try {
    // Scrape all sources in parallel
    const [databricksAzureData, databricksAwsData, azureData] = await Promise.all([
      scrapeDatabricksStatus('azure'),
      scrapeDatabricksStatus('aws'),
      scrapeAzureStatus(),
    ]);

    // Write to volumes in parallel and get file paths
    const [azureVolumePath, awsVolumePath, azureStatusVolumePath] = await Promise.all([
      writeToVolume(databricksAzureData, config),
      writeToVolume(databricksAwsData, config),
      writeToVolume(azureData, config),
    ]);

    // Parse HTML and set actual volume paths
    const azureIncidents = parseStatusPageHTML(databricksAzureData);
    azureIncidents.forEach(i => i.raw_data_path = azureVolumePath);
    
    const awsIncidents = parseStatusPageHTML(databricksAwsData);
    awsIncidents.forEach(i => i.raw_data_path = awsVolumePath);
    
    const azureStatusIncidents = parseStatusPageHTML(azureData);
    azureStatusIncidents.forEach(i => i.raw_data_path = azureStatusVolumePath);
    
    const allIncidents = [...azureIncidents, ...awsIncidents, ...azureStatusIncidents];

    results.databricks_azure = azureIncidents.length;
    results.databricks_aws = awsIncidents.length;
    results.azure_status = azureStatusIncidents.length;

    // Upsert to Delta table
    await upsertToDeltaTable(allIncidents, config);

    console.log('Status scraping workflow completed successfully');
    return results;
  } catch (error) {
    console.error('Error in status scraping workflow:', error);
    throw error;
  }
}
