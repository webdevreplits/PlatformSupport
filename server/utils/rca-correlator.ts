// Root Cause Analysis (RCA) Correlation Engine
// Matches Databricks job failures with platform status incidents

import { executeSQLQuery } from './databricks-sql';

interface SQLConfig {
  workspaceUrl: string;
  warehouseId: string;
  token: string;
}

export interface JobFailure {
  job_id: string;
  run_id: string;
  run_name: string;
  period_start_time: string;
  period_end_time: string;
  result_state: string;
  termination_code: string;
  trigger_type: string;
  compute_ids: string[];
}

export interface PlatformIncident {
  incident_id: string;
  source_system: string;
  incident_type: string;
  severity: string;
  status: string;
  title: string;
  description: string;
  affected_services: string[];
  affected_regions: string[];
  start_time: string;
  end_time?: string;
  last_update_time: string;
  source_url: string;
}

export interface CorrelationResult {
  incident: PlatformIncident;
  correlation_score: number;
  correlation_reasons: string[];
  time_overlap: boolean;
  region_match: boolean;
  service_match: boolean;
}

export interface RCAReport {
  job_failure: JobFailure;
  correlated_incidents: CorrelationResult[];
  cluster_info?: any;
  audit_logs?: any[];
  likely_root_cause: string;
  confidence: 'high' | 'medium' | 'low' | 'none';
}

// Correlate a job failure with platform incidents
export async function correlateJobFailure(
  runId: string,
  catalogSchema: string,
  config: SQLConfig
): Promise<RCAReport> {
  console.log(`Starting RCA correlation for job run ${runId}...`);

  // 1. Get job failure details
  const jobQuery = `
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
    WHERE run_id = '${runId.replace(/'/g, "''")}'
      AND result_state = 'FAILED'
    LIMIT 1
  `;

  const jobResults = await executeSQLQuery(jobQuery, config);
  
  if (jobResults.length === 0) {
    throw new Error(`Job run ${runId} not found or did not fail`);
  }

  const jobFailure: JobFailure = jobResults[0];
  console.log(`Found failed job: ${jobFailure.job_id} - ${jobFailure.run_name}`);

  // 2. Get platform incidents that overlap with job failure time
  const incidentsQuery = `
    SELECT 
      incident_id,
      source_system,
      incident_type,
      severity,
      status,
      title,
      description,
      affected_services,
      affected_regions,
      start_time,
      end_time,
      last_update_time,
      source_url
    FROM ${catalogSchema}.platform_status_events
    WHERE 
      -- Incident was active during job failure
      (
        (start_time <= TIMESTAMP '${jobFailure.period_end_time}' 
         AND (end_time IS NULL OR end_time >= TIMESTAMP '${jobFailure.period_start_time}'))
        OR
        -- Or started shortly before/after (within 1 hour window)
        (start_time >= TIMESTAMP '${jobFailure.period_start_time}' - INTERVAL 1 HOUR
         AND start_time <= TIMESTAMP '${jobFailure.period_end_time}' + INTERVAL 1 HOUR)
      )
      -- Focus on outages and degraded performance
      AND (incident_type IN ('outage', 'degraded_performance')
           OR severity IN ('critical', 'major'))
    ORDER BY start_time DESC
  `;

  const incidents = await executeSQLQuery(incidentsQuery, config);
  console.log(`Found ${incidents.length} potentially related incidents`);

  // 3. Calculate correlation scores for each incident
  const correlations: CorrelationResult[] = [];
  
  for (const incident of incidents) {
    const correlation = calculateCorrelation(jobFailure, incident);
    if (correlation.correlation_score > 0) {
      correlations.push(correlation);
    }
  }

  // Sort by correlation score
  correlations.sort((a, b) => b.correlation_score - a.correlation_score);

  // 4. Get cluster information for additional context
  let clusterInfo = null;
  if (jobFailure.compute_ids && jobFailure.compute_ids.length > 0) {
    const clusterQuery = `
      SELECT 
        cluster_id,
        cluster_name,
        state,
        owned_by,
        change_time,
        driver_node_type_id,
        node_type_id,
        num_workers
      FROM system.compute.clusters
      WHERE cluster_id = '${jobFailure.compute_ids[0].replace(/'/g, "''")}'
      ORDER BY change_time DESC
      LIMIT 1
    `;
    const clusterResults = await executeSQLQuery(clusterQuery, config);
    clusterInfo = clusterResults[0] || null;
  }

  // 5. Get audit logs for permission/access issues
  const auditQuery = `
    SELECT 
      event_time,
      user_identity.email as user_email,
      service_name,
      action_name,
      request_id,
      response.status_code as status_code,
      response.error_message as error_message
    FROM system.access.audit
    WHERE event_time >= TIMESTAMP '${jobFailure.period_start_time}' - INTERVAL 5 MINUTES
      AND event_time <= TIMESTAMP '${jobFailure.period_end_time}' + INTERVAL 5 MINUTES
      AND response.status_code >= 400
    ORDER BY event_time DESC
    LIMIT 20
  `;
  const auditLogs = await executeSQLQuery(auditQuery, config);

  // 6. Determine likely root cause
  const { likelyRootCause, confidence } = determineLikelyRootCause(
    jobFailure,
    correlations,
    auditLogs
  );

  return {
    job_failure: jobFailure,
    correlated_incidents: correlations,
    cluster_info: clusterInfo,
    audit_logs: auditLogs,
    likely_root_cause: likelyRootCause,
    confidence,
  };
}

// Calculate correlation score between job failure and incident
function calculateCorrelation(
  job: JobFailure,
  incident: PlatformIncident
): CorrelationResult {
  let score = 0;
  const reasons: string[] = [];
  let timeOverlap = false;
  let regionMatch = false;
  let serviceMatch = false;

  // Check time overlap (highest weight)
  const jobStart = new Date(job.period_start_time).getTime();
  const jobEnd = new Date(job.period_end_time).getTime();
  const incidentStart = new Date(incident.start_time).getTime();
  const incidentEnd = incident.end_time 
    ? new Date(incident.end_time).getTime() 
    : Date.now();

  if (incidentStart <= jobEnd && incidentEnd >= jobStart) {
    timeOverlap = true;
    score += 50;
    reasons.push(`Incident was active during job execution (${new Date(incident.start_time).toISOString()})`);
  }

  // Check severity (medium weight)
  if (incident.severity === 'critical') {
    score += 20;
    reasons.push('Critical severity incident');
  } else if (incident.severity === 'major') {
    score += 15;
    reasons.push('Major severity incident');
  }

  // Check incident type (medium weight)
  if (incident.incident_type === 'outage') {
    score += 15;
    reasons.push('Service outage reported');
  } else if (incident.incident_type === 'degraded_performance') {
    score += 10;
    reasons.push('Degraded performance reported');
  }

  // Check service match (medium weight)
  const relevantServices = [
    'databricks sql',
    'compute',
    'jobs',
    'notebooks',
    'unity catalog',
    'delta live tables',
    'clusters',
    'workspace',
  ];

  for (const service of incident.affected_services) {
    const serviceLower = service.toLowerCase();
    if (relevantServices.some(rs => serviceLower.includes(rs))) {
      serviceMatch = true;
      score += 10;
      reasons.push(`Affected service: ${service}`);
      break;
    }
  }

  // Check region match (lower weight - requires external data about cluster region)
  // For now, give partial credit if incident mentions "Global" or specific regions
  if (incident.affected_regions.includes('Global')) {
    regionMatch = true;
    score += 5;
    reasons.push('Global incident affecting all regions');
  }

  // Check termination code patterns
  if (job.termination_code) {
    const codePatterns = [
      { pattern: /cloud|aws|azure|gcp/i, weight: 15, reason: 'Cloud infrastructure error' },
      { pattern: /cluster|driver|executor/i, weight: 10, reason: 'Cluster initialization error' },
      { pattern: /network|connection|timeout/i, weight: 10, reason: 'Network connectivity issue' },
      { pattern: /permission|access|forbidden/i, weight: 5, reason: 'Permission/access issue' },
    ];

    for (const { pattern, weight, reason } of codePatterns) {
      if (pattern.test(job.termination_code) && 
          pattern.test(incident.title + ' ' + incident.description)) {
        score += weight;
        reasons.push(reason);
      }
    }
  }

  return {
    incident,
    correlation_score: Math.min(score, 100),
    correlation_reasons: reasons,
    time_overlap: timeOverlap,
    region_match: regionMatch,
    service_match: serviceMatch,
  };
}

// Determine likely root cause from correlations
function determineLikelyRootCause(
  job: JobFailure,
  correlations: CorrelationResult[],
  auditLogs: any[]
): { likelyRootCause: string; confidence: 'high' | 'medium' | 'low' | 'none' } {
  // High confidence: Strong correlation with critical platform incident
  if (correlations.length > 0 && correlations[0].correlation_score >= 70) {
    return {
      likelyRootCause: `Platform outage: ${correlations[0].incident.title}`,
      confidence: 'high',
    };
  }

  // Medium confidence: Permission/access issues in audit logs
  if (auditLogs.length > 0) {
    const permissionErrors = auditLogs.filter(log => 
      log.status_code === 403 || 
      (log.error_message && /permission|access|forbidden/i.test(log.error_message))
    );
    if (permissionErrors.length > 0) {
      return {
        likelyRootCause: `Permission denied: ${permissionErrors[0].error_message || 'Access forbidden'}`,
        confidence: 'medium',
      };
    }
  }

  // Medium confidence: Moderate correlation with incidents
  if (correlations.length > 0 && correlations[0].correlation_score >= 40) {
    return {
      likelyRootCause: `Possible platform issue: ${correlations[0].incident.title}`,
      confidence: 'medium',
    };
  }

  // Low confidence: Termination code analysis only
  if (job.termination_code) {
    const code = job.termination_code.toLowerCase();
    if (code.includes('cluster')) {
      return {
        likelyRootCause: 'Cluster initialization or configuration issue',
        confidence: 'low',
      };
    }
    if (code.includes('timeout') || code.includes('network')) {
      return {
        likelyRootCause: 'Network connectivity or timeout issue',
        confidence: 'low',
      };
    }
    if (code.includes('spark') || code.includes('config')) {
      return {
        likelyRootCause: 'Spark configuration or runtime error',
        confidence: 'low',
      };
    }
  }

  // No clear root cause
  return {
    likelyRootCause: 'Unable to determine root cause - manual investigation required',
    confidence: 'none',
  };
}
