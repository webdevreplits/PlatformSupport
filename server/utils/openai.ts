import OpenAI from 'openai';

export async function generateChatCompletion(
  messages: Array<{ role: string; content: string }>,
  databricksToken: string,
  databricksBaseUrl: string = "https://adb-7901759384367063.3.azuredatabricks.net/serving-endpoints",
  endpointName: string = "databricks-claude-sonnet-4-5"
) {
  try {
    // Databricks serving endpoints support OpenAI-compatible API
    // The baseURL should be: {baseUrl}/{endpointName}
    // The OpenAI SDK will append /v1/chat/completions (or similar paths)
    // But Databricks might expect different paths, so we use the base without /v1
    const fullBaseUrl = `${databricksBaseUrl}/${endpointName}`;

    console.log(`Calling Databricks endpoint: ${fullBaseUrl}`);

    const client = new OpenAI({
      apiKey: databricksToken,
      baseURL: fullBaseUrl,
    });

    const completion = await client.chat.completions.create({
      // For Databricks, the model parameter can be any value - the endpoint determines the actual model
      model: "gpt-3.5-turbo",
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 1000,
    });

    return completion.choices[0]?.message?.content || "No response generated";
  } catch (error) {
    console.error('Databricks AI API Error:', error);
    if (error instanceof Error) {
      throw new Error(`Databricks API Error: ${error.message}. Please verify your endpoint configuration in Settings.`);
    }
    throw new Error('Failed to connect to Databricks AI. Please check your token and endpoint configuration in Settings.');
  }
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
