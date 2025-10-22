// AI-Powered Root Cause Analysis using Internet Research
// Searches for platform outages and combines with job logs for comprehensive RCA

import { generateChatCompletion } from './openai';

// In-memory progress tracking
const analysisProgress = new Map<string, {
  status: string;
  step: number;
  totalSteps: number;
  message: string;
}>();

export function getAnalysisProgress(runId: string) {
  return analysisProgress.get(runId) || {
    status: 'not_started',
    step: 0,
    totalSteps: 6,
    message: 'Analysis not started'
  };
}

export function updateAnalysisProgress(runId: string, step: number, totalSteps: number, message: string, status: string = 'in_progress') {
  analysisProgress.set(runId, { status, step, totalSteps, message });
}

export function clearAnalysisProgress(runId: string) {
  analysisProgress.delete(runId);
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

export interface AIRCAResult {
  root_cause_category: string;
  likely_root_cause: string;
  confidence: 'high' | 'medium' | 'low' | 'none';
  analysis: string;
  platform_outages_found: string;
  sources_verified: string[];
  evidence: string;
  remediation_steps: string[];
  prevention_recommendations: string[];
}

/**
 * Performs AI-powered RCA by:
 * 1. Researching internet for platform outages (Databricks, Azure)
 * 2. Analyzing Spark errors from task logs
 * 3. Analyzing job logs and termination codes
 * 4. Combining findings for comprehensive root cause analysis
 */
export async function performAIRootCauseAnalysis(
  jobFailure: JobFailure,
  clusterInfo: any,
  auditLogs: any[],
  sparkErrors: string,
  databricksToken: string,
  databricksBaseUrl?: string,
  endpointName?: string
): Promise<AIRCAResult> {
  
  const runId = jobFailure.run_id;
  
  // Step 1: Initialize analysis
  updateAnalysisProgress(runId, 1, 6, 'Analyzing job failure details...');
  
  // Prepare failure context
  const failureTime = new Date(jobFailure.period_end_time);
  const formattedDate = failureTime.toISOString().split('T')[0]; // YYYY-MM-DD
  const formattedDateTime = failureTime.toISOString();
  
  // Step 2: Building context
  updateAnalysisProgress(runId, 2, 6, 'Processing Spark error logs and cluster information...');
  
  // Build comprehensive context for AI
  const jobContext = `
JOB FAILURE DETAILS:
- Job ID: ${jobFailure.job_id}
- Run ID: ${jobFailure.run_id}
- Job Name: ${jobFailure.run_name}
- Failure Time: ${formattedDateTime}
- Termination Code: ${jobFailure.termination_code || 'Unknown'}
- Result State: ${jobFailure.result_state}
- Trigger Type: ${jobFailure.trigger_type}
${sparkErrors ? `\nSPARK ERROR LOGS:
${sparkErrors}` : ''}
${clusterInfo ? `\nCLUSTER INFO:
- Cluster ID: ${clusterInfo.cluster_id || 'N/A'}
- Cluster Name: ${clusterInfo.cluster_name || 'N/A'}
- State: ${clusterInfo.state || 'N/A'}
- Driver Node Type: ${clusterInfo.driver_node_type_id || 'N/A'}
- Worker Node Type: ${clusterInfo.node_type_id || 'N/A'}
- Number of Workers: ${clusterInfo.num_workers || 'N/A'}` : ''}
${auditLogs && auditLogs.length > 0 ? `\nAUDIT LOGS (Errors):
${auditLogs.map(log => `- [${log.event_time}] ${log.action_name}: ${log.error_message || 'Status ' + log.status_code}`).join('\n')}` : ''}
  `.trim();

  const analysisPrompt = `You are a Databricks and Azure platform expert performing Root Cause Analysis (RCA) for a job failure.

${jobContext}

TASK: Perform comprehensive RCA analysis with the following steps:

1. **SEARCH THE INTERNET** for platform outages and issues:
   - Check for Databricks platform outages on ${formattedDate}
   - Check for Azure platform service disruptions on ${formattedDate}
   - Look for Databricks workspace or compute issues
   - Search for known issues with the termination code: ${jobFailure.termination_code || 'Unknown'}
   - Verify information from multiple reliable sources

2. **ANALYZE SPARK ERROR LOGS** provided above:
   - Identify the specific Spark exception or error type
   - Examine error messages and stack traces for root cause clues
   - Determine if the error is related to code, data, or infrastructure
   - Look for patterns indicating resource issues, data quality problems, or code bugs

3. **ANALYZE JOB METADATA** and identify error patterns:
   - Examine the termination code and what it typically indicates
   - Review audit logs for permission or access issues
   - Check cluster configuration for resource constraints
   - Identify any code or configuration errors

4. **CORRELATE FINDINGS**:
   - Determine if platform outages contributed to the failure
   - Assess whether this is a platform issue vs. job-specific issue
   - Cross-reference Spark errors with platform status
   - Identify the most likely root cause based on all evidence (prioritize Spark error logs)

5. **PROVIDE DETAILED ANALYSIS** in this exact JSON format:
{
  "root_cause_category": "<Platform Outage|Permission Issue|Cluster Configuration|Resource Constraint|Code Error|Network Issue|Storage Issue>",
  "likely_root_cause": "<One sentence summary of the most likely cause>",
  "confidence": "<high|medium|low|none>",
  "analysis": "<Detailed explanation of what caused the failure, referencing specific evidence>",
  "platform_outages_found": "<Summary of any Databricks/Azure outages found during internet research, or 'No platform outages found'>",
  "sources_verified": ["<list of sources you checked>"],
  "evidence": "<Specific log entries, error codes, or outage reports that support your conclusion>",
  "remediation_steps": ["<Specific action 1>", "<Specific action 2>", "..."],
  "prevention_recommendations": ["<Prevention step 1>", "<Prevention step 2>", "..."]
}

IMPORTANT GUIDELINES:
- Actually search the internet for outages - don't just assume
- Verify information from multiple sources when possible
- Be specific about what you found during your research
- Reference exact error messages, codes, or outage reports
- Provide actionable remediation steps
- Distinguish between platform issues vs. user-fixable issues

Respond ONLY with the JSON object, no other text.`;

  // Step 3: Searching for platform outages
  updateAnalysisProgress(runId, 3, 6, 'Searching for platform outages and known issues...');
  
  console.log('Calling AI for comprehensive RCA with internet research...');
  
  // Step 4: Generating AI analysis
  updateAnalysisProgress(runId, 4, 6, 'Generating AI-powered root cause analysis...');
  
  const response = await generateChatCompletion(
    [
      {
        role: 'system',
        content: 'You are an expert Databricks and Azure platform analyst. You have access to search the internet for current platform status and outages. Provide detailed, evidence-based root cause analysis in JSON format.'
      },
      {
        role: 'user',
        content: analysisPrompt
      }
    ],
    databricksToken,
    databricksBaseUrl,
    endpointName
  );

  // Step 5: Parsing results
  updateAnalysisProgress(runId, 5, 6, 'Finalizing analysis results...');

  // Parse AI response
  try {
    // Extract JSON from response (handle markdown code blocks)
    let jsonText = response.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }
    
    const result: AIRCAResult = JSON.parse(jsonText);
    
    // Validate required fields
    if (!result.root_cause_category || !result.likely_root_cause || !result.confidence) {
      throw new Error('AI response missing required fields');
    }
    
    // Step 6: Complete
    updateAnalysisProgress(runId, 6, 6, 'Analysis complete', 'completed');
    
    // Clear progress after a delay to allow client to fetch final status
    setTimeout(() => clearAnalysisProgress(runId), 30000); // 30 seconds
    
    return result;
  } catch (parseError) {
    console.error('Failed to parse AI RCA response:', parseError);
    console.error('Raw AI response:', response);
    
    // Mark as error
    updateAnalysisProgress(runId, 6, 6, 'Analysis failed - parsing error', 'error');
    
    // Clear progress after a delay
    setTimeout(() => clearAnalysisProgress(runId), 30000);
    
    // Return fallback result
    return {
      root_cause_category: 'Unknown',
      likely_root_cause: 'Unable to determine root cause - AI analysis parsing failed',
      confidence: 'none',
      analysis: response.substring(0, 500),
      platform_outages_found: 'Analysis failed',
      sources_verified: [],
      evidence: 'Error parsing AI response',
      remediation_steps: ['Review job logs manually', 'Check Databricks status page'],
      prevention_recommendations: ['Monitor platform status regularly']
    };
  }
}
