import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2, XCircle, Search } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface FailedJob {
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

interface AIRCAResult {
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

interface RCAReport {
  job_failure: FailedJob;
  cluster_info?: any;
  audit_logs?: any[];
  rca_analysis: AIRCAResult;
  likely_root_cause: string;
  confidence: 'high' | 'medium' | 'low' | 'none';
}

interface AnalysisProgress {
  status: string;
  step: number;
  totalSteps: number;
  message: string;
}

export default function RCA() {
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [rcaReport, setRcaReport] = useState<RCAReport | null>(null);
  const [progress, setProgress] = useState<AnalysisProgress | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Fetch failed jobs
  const { data: failedJobsData, isLoading: isLoadingJobs, error: jobsError } = useQuery<{ jobs: FailedJob[] }>({
    queryKey: ['/api/rca/failed-jobs'],
  });

  const failedJobs = failedJobsData?.jobs || [];

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Poll for progress
  const pollProgress = async (runId: string) => {
    try {
      const response = await fetch(`/api/rca/analyze/progress/${runId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      // Handle auth/session issues
      if (!response.ok) {
        console.error(`Progress fetch failed: ${response.status}`);
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
        return;
      }
      
      const progressData = await response.json();
      setProgress(progressData);
      
      // Stop polling if complete or error
      if (progressData.status === 'completed' || progressData.status === 'error') {
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error);
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    }
  };

  // RCA analysis mutation
  const analyzeMutation = useMutation({
    mutationFn: async (runId: string) => {
      const response = await apiRequest("POST", "/api/rca/analyze", { 
        runId, 
        includeAiAnalysis: true 
      });
      return response as unknown as RCAReport;
    },
    onSuccess: (data) => {
      setRcaReport(data);
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
      setProgress(null);
    },
    onError: () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
      setProgress(null);
    },
  });

  const handleAnalyze = (runId: string) => {
    setSelectedRunId(runId);
    setRcaReport(null);
    setProgress({ status: 'starting', step: 0, totalSteps: 6, message: 'Starting analysis...' });
    
    // Start polling for progress
    const interval = setInterval(() => pollProgress(runId), 1000);
    setPollingInterval(interval);
    
    analyzeMutation.mutate(runId);
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  const getConfidenceBadge = (confidence: string | undefined | null) => {
    const safeConfidence = (confidence || 'unknown').toLowerCase();
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
      high: { variant: "default", icon: CheckCircle2 },
      medium: { variant: "secondary", icon: AlertCircle },
      low: { variant: "outline", icon: AlertCircle },
      none: { variant: "destructive", icon: XCircle },
      unknown: { variant: "destructive", icon: XCircle },
    };
    const config = variants[safeConfidence] || variants.unknown;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1" data-testid={`badge-confidence-${safeConfidence}`}>
        <Icon className="h-3 w-3" />
        {safeConfidence.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="page-rca">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Root Cause Analysis</h1>
        <p className="text-muted-foreground" data-testid="text-page-description">
          AI-powered root cause analysis with internet research for platform outages and comprehensive diagnostics
        </p>
      </div>

      {jobsError && (
        <Alert variant="destructive" data-testid="alert-jobs-error">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load jobs: {jobsError instanceof Error ? jobsError.message : "Unknown error"}
          </AlertDescription>
        </Alert>
      )}

      <Card data-testid="card-failed-jobs">
        <CardHeader>
          <CardTitle data-testid="text-failed-jobs-title">Failed Job Runs</CardTitle>
          <CardDescription data-testid="text-failed-jobs-description">
            Recent job failures from system.lakeflow.job_run_timeline
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingJobs ? (
            <div className="flex items-center justify-center py-8" data-testid="loader-jobs">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : failedJobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground" data-testid="text-no-jobs">
              No failed jobs found
            </div>
          ) : (
            <Table data-testid="table-failed-jobs">
              <TableHeader>
                <TableRow>
                  <TableHead data-testid="text-header-job">Job Name</TableHead>
                  <TableHead data-testid="text-header-run-id">Run ID</TableHead>
                  <TableHead data-testid="text-header-failure-time">Failure Time</TableHead>
                  <TableHead data-testid="text-header-termination">Termination Code</TableHead>
                  <TableHead data-testid="text-header-actions">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {failedJobs.map((job) => (
                  <TableRow key={job.run_id} data-testid={`row-job-${job.run_id}`}>
                    <TableCell className="font-medium" data-testid={`text-job-name-${job.run_id}`}>
                      {job.run_name || job.job_id}
                    </TableCell>
                    <TableCell className="font-mono text-sm" data-testid={`text-run-id-${job.run_id}`}>
                      {job.run_id}
                    </TableCell>
                    <TableCell data-testid={`text-failure-time-${job.run_id}`}>
                      {formatDateTime(job.period_end_time)}
                    </TableCell>
                    <TableCell data-testid={`text-termination-${job.run_id}`}>
                      <Badge variant="outline" data-testid={`badge-termination-${job.run_id}`}>
                        {job.termination_code || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleAnalyze(job.run_id)}
                        disabled={analyzeMutation.isPending}
                        data-testid={`button-analyze-${job.run_id}`}
                      >
                        {analyzeMutation.isPending && selectedRunId === job.run_id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {progress ? `Step ${progress.step}/${progress.totalSteps}` : 'Analyzing...'}
                          </>
                        ) : (
                          <>
                            <Search className="mr-2 h-4 w-4" />
                            Analyze
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* RCA Results Dialog */}
      <Dialog open={!!rcaReport} onOpenChange={() => setRcaReport(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]" data-testid="dialog-rca-results">
          <DialogHeader>
            <DialogTitle data-testid="text-dialog-title">Root Cause Analysis Results</DialogTitle>
            <DialogDescription data-testid="text-dialog-description">
              {rcaReport?.job_failure?.run_name || rcaReport?.job_failure?.job_id || 'Job analysis results'}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[70vh] pr-4">
            {rcaReport && (
              <div className="space-y-6">
                {/* Summary */}
                <Card data-testid="card-summary">
                  <CardHeader>
                    <CardTitle className="text-lg" data-testid="text-summary-title">Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Confidence:</span>
                      {getConfidenceBadge(rcaReport.confidence)}
                    </div>
                    {rcaReport.rca_analysis?.root_cause_category && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Category:</span>
                        <Badge variant="outline" data-testid="badge-category">
                          {rcaReport.rca_analysis.root_cause_category}
                        </Badge>
                      </div>
                    )}
                    <div>
                      <span className="text-sm font-medium">Likely Root Cause:</span>
                      <p className="text-sm text-muted-foreground mt-1" data-testid="text-root-cause">
                        {rcaReport.likely_root_cause || (progress ? progress.message : 'Analysis in progress...')}
                      </p>
                      {progress && progress.status === 'in_progress' && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span>Step {progress.step} of {progress.totalSteps}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Platform Outages Research */}
                <Card data-testid="card-outages">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2" data-testid="text-outages-title">
                      <Search className="h-5 w-5" />
                      Platform Outages Research
                    </CardTitle>
                    <CardDescription>AI verified multiple sources for platform issues</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm font-medium">Findings:</span>
                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap" data-testid="text-outages-found">
                        {rcaReport.rca_analysis?.platform_outages_found || 'No platform outages detected'}
                      </p>
                    </div>
                    {rcaReport.rca_analysis?.sources_verified && rcaReport.rca_analysis.sources_verified.length > 0 && (
                      <div>
                        <span className="text-sm font-medium">Sources Verified:</span>
                        <ul className="text-sm text-muted-foreground mt-1 list-disc list-inside">
                          {rcaReport.rca_analysis.sources_verified.map((source, idx) => (
                            <li key={idx} data-testid={`text-source-${idx}`}>{source}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* AI Analysis */}
                <Card data-testid="card-ai-analysis">
                  <CardHeader>
                    <CardTitle className="text-lg" data-testid="text-ai-title">Detailed Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap" data-testid="text-ai-analysis">
                      {rcaReport.rca_analysis?.analysis || 'No detailed analysis available'}
                    </p>
                  </CardContent>
                </Card>

                {/* Evidence */}
                <Card data-testid="card-evidence">
                  <CardHeader>
                    <CardTitle className="text-lg" data-testid="text-evidence-title">Evidence</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap" data-testid="text-evidence">
                      {rcaReport.rca_analysis?.evidence || 'No evidence collected'}
                    </p>
                  </CardContent>
                </Card>

                {/* Remediation Steps */}
                <Card data-testid="card-remediation">
                  <CardHeader>
                    <CardTitle className="text-lg" data-testid="text-remediation-title">
                      Remediation Steps
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {rcaReport.rca_analysis?.remediation_steps && rcaReport.rca_analysis.remediation_steps.length > 0 ? (
                      <ol className="text-sm space-y-2 list-decimal list-inside">
                        {rcaReport.rca_analysis.remediation_steps.map((step, idx) => (
                          <li key={idx} className="text-muted-foreground" data-testid={`text-step-${idx}`}>
                            {step}
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-sm text-muted-foreground">No remediation steps available</p>
                    )}
                  </CardContent>
                </Card>

                {/* Prevention Recommendations */}
                <Card data-testid="card-prevention">
                  <CardHeader>
                    <CardTitle className="text-lg" data-testid="text-prevention-title">
                      Prevention Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {rcaReport.rca_analysis?.prevention_recommendations && rcaReport.rca_analysis.prevention_recommendations.length > 0 ? (
                      <ul className="text-sm space-y-2 list-disc list-inside">
                        {rcaReport.rca_analysis.prevention_recommendations.map((rec, idx) => (
                          <li key={idx} className="text-muted-foreground" data-testid={`text-prevention-${idx}`}>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No prevention recommendations available</p>
                    )}
                  </CardContent>
                </Card>

                {/* Audit Logs */}
                {rcaReport.audit_logs && rcaReport.audit_logs.length > 0 && (
                  <Card data-testid="card-audit-logs">
                    <CardHeader>
                      <CardTitle className="text-lg" data-testid="text-audit-title">
                        Related Audit Logs ({rcaReport.audit_logs.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {rcaReport.audit_logs.map((log, idx) => (
                          <div key={idx} className="text-sm border-l-2 border-destructive pl-3 py-1" data-testid={`log-audit-${idx}`}>
                            <div className="font-medium" data-testid={`text-log-action-${idx}`}>{log.action_name}</div>
                            <div className="text-muted-foreground" data-testid={`text-log-error-${idx}`}>
                              {log.error_message || `Status: ${log.status_code}`}
                            </div>
                            <div className="text-xs text-muted-foreground" data-testid={`text-log-time-${idx}`}>
                              {formatDateTime(log.event_time)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
