// Databricks SQL Warehouse connection using REST API
// Uses SQL Statement Execution API: https://docs.databricks.com/api/workspace/statementexecution

interface SQLConfig {
  workspaceUrl: string;
  warehouseId: string;
  token: string;
}

interface StatementResponse {
  statement_id: string;
  status: {
    state: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELED' | 'CLOSED';
    error?: {
      message: string;
      error_code: string;
    };
  };
  manifest?: {
    schema: { columns: Array<{ name: string; type_text: string }> };
    truncated: boolean;
  };
  result?: {
    data_array?: any[][];
    row_count?: number;
    chunk_index?: number;
    next_chunk_internal_link?: string;
    next_chunk_index?: number;
  };
}

// SQL escape helper to prevent injection
function escapeSQLString(value: string): string {
  // Replace single quotes with two single quotes (SQL standard escaping)
  return value.replace(/'/g, "''");
}

async function waitForStatement(
  statementId: string,
  config: SQLConfig,
  maxWaitMs: number = 60000
): Promise<StatementResponse> {
  const startTime = Date.now();
  const pollInterval = 1000; // Poll every second

  while (Date.now() - startTime < maxWaitMs) {
    const response = await fetch(
      `${config.workspaceUrl}/api/2.0/sql/statements/${statementId}`,
      {
        headers: {
          'Authorization': `Bearer ${config.token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get statement status: ${response.status} ${errorText}`);
    }

    const data: StatementResponse = await response.json();

    if (data.status.state === 'SUCCEEDED') {
      return data;
    }

    if (data.status.state === 'FAILED' || data.status.state === 'CANCELED') {
      throw new Error(
        `Statement ${data.status.state}: ${data.status.error?.message || 'Unknown error'}`
      );
    }

    // Still running, wait before polling again
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  throw new Error('Statement execution timed out');
}

// Fetch additional chunks if result is paginated
async function fetchAllChunks(
  initialData: StatementResponse,
  config: SQLConfig
): Promise<any[]> {
  // Format initial results with the original manifest schema
  const schema = initialData.manifest?.schema;
  if (!schema) {
    return [];
  }
  
  let allResults = formatResultsWithSchema(initialData.result?.data_array || [], schema);
  let nextChunkLink = initialData.result?.next_chunk_internal_link;

  while (nextChunkLink) {
    // Databricks returns relative paths, so prefix with workspace URL
    const absoluteUrl = nextChunkLink.startsWith('http') 
      ? nextChunkLink 
      : `${config.workspaceUrl}${nextChunkLink}`;
    
    const response = await fetch(absoluteUrl, {
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn('Failed to fetch next chunk, returning partial results');
      break;
    }

    const chunkData: StatementResponse = await response.json();
    // Reuse the original schema for subsequent chunks
    const chunkResults = formatResultsWithSchema(chunkData.result?.data_array || [], schema);
    allResults = allResults.concat(chunkResults);
    
    nextChunkLink = chunkData.result?.next_chunk_internal_link;
  }

  return allResults;
}

function formatResultsWithSchema(rows: any[][], schema: { columns: Array<{ name: string; type_text: string }> }): any[] {
  const columns = schema.columns.map(col => col.name);
  
  return rows.map(row => {
    const obj: any = {};
    columns.forEach((col, index) => {
      obj[col] = row[index];
    });
    return obj;
  });
}

export async function executeSQLQuery(
  query: string,
  config: SQLConfig
): Promise<any[]> {
  try {
    console.log(`Executing SQL query on warehouse ${config.warehouseId}`);

    // Submit the statement
    const response = await fetch(
      `${config.workspaceUrl}/api/2.0/sql/statements`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          warehouse_id: config.warehouseId,
          statement: query,
          wait_timeout: '50s',
          on_wait_timeout: 'CONTINUE',
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to execute SQL: ${response.status} ${errorText}`);
    }

    const initialData: StatementResponse = await response.json();

    // If statement is already succeeded, fetch all chunks
    if (initialData.status.state === 'SUCCEEDED') {
      return await fetchAllChunks(initialData, config);
    }

    // Otherwise wait for completion then fetch all chunks
    const finalData = await waitForStatement(initialData.statement_id, config);
    return await fetchAllChunks(finalData, config);
  } catch (error) {
    console.error('SQL execution error:', error);
    if (error instanceof Error) {
      throw new Error(`Databricks SQL Error: ${error.message}`);
    }
    throw new Error('Failed to execute SQL query');
  }
}

// Legacy function for backward compatibility (not used in pagination flow)
function formatResults(data: StatementResponse): any[] {
  if (!data.result?.data_array || !data.manifest?.schema) {
    return [];
  }

  return formatResultsWithSchema(data.result.data_array, data.manifest.schema);
}

// Query System Tables for job failures
export async function getFailedJobs(
  config: SQLConfig,
  limitDays: number = 7
): Promise<any[]> {
  const query = `
    SELECT 
      job_id,
      run_id,
      run_name,
      period_start_time,
      period_end_time,
      result_state,
      termination_code,
      trigger_type,
      compute_ids
    FROM system.lakeflow.job_run_timeline
    WHERE result_state = 'FAILED'
      AND period_start_time >= CURRENT_TIMESTAMP() - INTERVAL ${parseInt(String(limitDays))} DAYS
    ORDER BY period_start_time DESC
    LIMIT 100
  `;

  return await executeSQLQuery(query, config);
}

// Query cluster configuration history
export async function getClusterInfo(
  config: SQLConfig,
  clusterId?: string,
  limitDays: number = 7
): Promise<any[]> {
  let query = `
    SELECT 
      cluster_id,
      cluster_name,
      owned_by,
      creator_user_name,
      cluster_source,
      change_time
    FROM system.compute.clusters
    WHERE change_time >= CURRENT_TIMESTAMP() - INTERVAL ${parseInt(String(limitDays))} DAYS
  `;

  if (clusterId) {
    // Use parameterized escaping to prevent SQL injection
    query += ` AND cluster_id = '${escapeSQLString(clusterId)}'`;
  }

  query += ` ORDER BY change_time DESC LIMIT 500`;

  return await executeSQLQuery(query, config);
}

// Query audit logs for permission issues and errors
export async function getAuditLogs(
  config: SQLConfig,
  limitDays: number = 7
): Promise<any[]> {
  const query = `
    SELECT 
      event_time,
      user_identity.email as user_email,
      service_name,
      action_name,
      request_id,
      response.status_code as status_code,
      response.error_message as error_message,
      source_ip_address,
      user_agent
    FROM system.access.audit
    WHERE event_time >= CURRENT_TIMESTAMP() - INTERVAL ${parseInt(String(limitDays))} DAYS
      AND response.status_code >= 400
    ORDER BY event_time DESC
    LIMIT 500
  `;

  return await executeSQLQuery(query, config);
}

// Get detailed job run logs (all timeline entries for a run)
export async function getJobRunDetails(
  config: SQLConfig,
  runId: string
): Promise<any> {
  // Use parameterized escaping to prevent SQL injection
  const escapedRunId = escapeSQLString(runId);
  
  const query = `
    SELECT 
      job_id,
      run_id,
      run_name,
      period_start_time,
      period_end_time,
      result_state,
      termination_code,
      trigger_type,
      run_type,
      compute_ids,
      job_parameters
    FROM system.lakeflow.job_run_timeline
    WHERE run_id = '${escapedRunId}'
    ORDER BY period_start_time ASC
  `;

  const results = await executeSQLQuery(query, config);
  
  // Return the first row or all rows aggregated
  if (results.length === 0) return null;
  
  // If job ran < 1 hour, return single row
  if (results.length === 1) return results[0];
  
  // For long-running jobs, aggregate timeline
  return {
    ...results[0], // Use first row for metadata
    timeline_entries: results.length,
    total_duration_seconds: results.reduce((acc: number, row: any) => {
      const start = new Date(row.period_start_time).getTime();
      const end = new Date(row.period_end_time).getTime();
      return acc + (end - start) / 1000;
    }, 0)
  };
}

// Get task run timeline with event details (contains Spark errors)
export async function getTaskRunLogs(
  config: SQLConfig,
  runId: string
): Promise<any[]> {
  const escapedRunId = escapeSQLString(runId);
  
  const query = `
    SELECT 
      task_run_id,
      task_key,
      period_start_time,
      period_end_time,
      result_state,
      termination_code,
      event_details
    FROM system.lakeflow.job_task_run_timeline
    WHERE run_id = '${escapedRunId}'
      AND result_state = 'FAILED'
    ORDER BY period_start_time DESC
    LIMIT 50
  `;

  return await executeSQLQuery(query, config);
}

// Test connection
export async function testSQLConnection(config: SQLConfig): Promise<boolean> {
  try {
    const query = 'SELECT 1 as test';
    await executeSQLQuery(query, config);
    return true;
  } catch (error) {
    console.error('SQL connection test failed:', error);
    return false;
  }
}
