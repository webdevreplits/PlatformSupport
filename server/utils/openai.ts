// Direct HTTP integration with Databricks serving endpoints
// Databricks endpoints expect POST to {baseUrl}/{endpointName}/invocations

interface DatabricksMessage {
  role: string;
  content: string;
}

interface DatabricksRequest {
  messages: DatabricksMessage[];
  temperature?: number;
  max_tokens?: number;
}

async function callDatabricksEndpoint(
  messages: DatabricksMessage[],
  databricksToken: string,
  databricksBaseUrl: string,
  endpointName: string
): Promise<string> {
  const url = `${databricksBaseUrl}/${endpointName}/invocations`;
  
  console.log(`Calling Databricks endpoint: ${url}`);

  const requestBody: DatabricksRequest = {
    messages,
    temperature: 0.7,
    max_tokens: 1000,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${databricksToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Databricks API Error ${response.status}:`, errorText);
      throw new Error(`Databricks API returned ${response.status}: ${errorText || response.statusText}`);
    }

    const data = await response.json();
    
    // Databricks Claude endpoint returns OpenAI-compatible format
    // Response: { choices: [{ message: { content: "..." } }] }
    if (data.choices && data.choices[0]?.message?.content) {
      return data.choices[0].message.content;
    }
    
    // Fallback for other response formats
    if (typeof data === 'string') {
      return data;
    }
    
    if (data.response) {
      return data.response;
    }

    console.warn('Unexpected response format from Databricks:', data);
    return JSON.stringify(data);
  } catch (error) {
    console.error('Databricks endpoint call failed:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to call Databricks AI: ${error.message}. Please verify your endpoint configuration in Settings.`);
    }
    throw new Error('Failed to connect to Databricks AI. Please check your token and endpoint configuration in Settings.');
  }
}

export async function generateChatCompletion(
  messages: Array<{ role: string; content: string }>,
  databricksToken: string,
  databricksBaseUrl: string = "https://adb-7901759384367063.3.azuredatabricks.net/serving-endpoints",
  endpointName: string = "databricks-claude-sonnet-4-5"
) {
  return await callDatabricksEndpoint(messages, databricksToken, databricksBaseUrl, endpointName);
}

export async function summarizeIncident(
  incidentData: any,
  databricksToken: string,
  databricksBaseUrl?: string,
  endpointName?: string
) {
  const prompt = `Analyze this Azure incident and provide a concise summary with key points and suggested next steps:

Incident ID: ${incidentData.id}
Priority: ${incidentData.priority}
Status: ${incidentData.status}
Description: ${incidentData.description}
Service: ${incidentData.service || 'Unknown'}

Provide:
1. Brief summary (2-3 sentences)
2. Root cause analysis
3. Recommended actions
4. Prevention tips`;

  return await generateChatCompletion([
    { role: 'system', content: 'You are an Azure platform support expert. Provide clear, actionable insights.' },
    { role: 'user', content: prompt }
  ], databricksToken, databricksBaseUrl, endpointName);
}

export async function generateFixScript(
  incidentData: any,
  databricksToken: string,
  databricksBaseUrl?: string,
  endpointName?: string
) {
  const prompt = `Generate a PowerShell or Azure CLI script to resolve this incident:

Issue: ${incidentData.description}
Service: ${incidentData.service || 'Azure Resource'}

Provide a safe, well-commented script with error handling.`;

  return await generateChatCompletion([
    { role: 'system', content: 'You are an Azure automation expert. Generate safe, production-ready scripts.' },
    { role: 'user', content: prompt }
  ], databricksToken, databricksBaseUrl, endpointName);
}

export async function generateDashboardInsights(
  metrics: any,
  databricksToken: string,
  databricksBaseUrl?: string,
  endpointName?: string
) {
  const prompt = `Based on these Azure platform metrics, provide today's operational insights:

Active Incidents: ${metrics.incidents}
Databricks Jobs: ${metrics.jobs}
System Health: ${metrics.health}%
Cost Trend: ${metrics.costTrend}

Provide 2-3 actionable insights focusing on areas needing attention.`;

  return await generateChatCompletion([
    { role: 'system', content: 'You are an Azure operations analyst. Provide brief, actionable insights.' },
    { role: 'user', content: prompt }
  ], databricksToken, databricksBaseUrl, endpointName);
}

export async function generateReport(
  reportType: string,
  data: any,
  databricksToken: string,
  databricksBaseUrl?: string,
  endpointName?: string
) {
  const prompt = `Generate a ${reportType} report for Azure platform operations:

Data Summary:
${JSON.stringify(data, null, 2)}

Include:
- Executive summary
- Key metrics and trends
- Issues and recommendations
- Action items`;

  return await generateChatCompletion([
    { role: 'system', content: 'You are an Azure platform reporting specialist. Create clear, executive-level reports.' },
    { role: 'user', content: prompt }
  ], databricksToken, databricksBaseUrl, endpointName);
}

// New function for RCA analysis
export async function analyzeJobFailureRCA(
  jobData: any,
  systemLogs: string,
  statusPageIncidents: any[],
  databricksToken: string,
  databricksBaseUrl?: string,
  endpointName?: string
) {
  const incidentsText = statusPageIncidents.length > 0
    ? statusPageIncidents.map(inc => `- ${inc.title} (${inc.status}): ${inc.description}`).join('\n')
    : 'No active platform incidents found';

  const prompt = `Perform Root Cause Analysis for this Databricks job failure:

JOB DETAILS:
${JSON.stringify(jobData, null, 2)}

SYSTEM LOGS:
${systemLogs}

PLATFORM INCIDENTS:
${incidentsText}

ANALYZE AND PROVIDE:
1. Root Cause Category: (Platform Error / Permission Issue / Spark Configuration / Resource Constraint / Code Error)
2. Detailed Analysis: What specifically caused the failure?
3. Evidence: Which logs/incidents support this conclusion?
4. Remediation Steps: Specific actions to fix this issue
5. Prevention: How to avoid this in the future

Be specific and actionable. Reference exact error messages and log entries.`;

  return await generateChatCompletion([
    { role: 'system', content: 'You are a Databricks platform expert specializing in job failure analysis and root cause determination. Provide detailed, evidence-based analysis.' },
    { role: 'user', content: prompt }
  ], databricksToken, databricksBaseUrl, endpointName);
}
