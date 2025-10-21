import { useState } from "react";
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

interface CorrelatedIncident {
  incident: {
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
    source_url: string;
  };
  correlation_score: number;
  correlation_reasons: string[];
  time_overlap: boolean;
  region_match: boolean;
  service_match: boolean;
}

interface RCAReport {
  job_failure: FailedJob;
  correlated_incidents: CorrelatedIncident[];
  cluster_info?: any;
  audit_logs?: any[];
  likely_root_cause: string;
  confidence: 'high' | 'medium' | 'low' | 'none';
  ai_analysis?: string;
  ai_error?: string;
}

export default function RCA() {
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [rcaReport, setRcaReport] = useState<RCAReport | null>(null);

  // Fetch failed jobs
  const { data: failedJobsData, isLoading: isLoadingJobs, error: jobsError } = useQuery<{ jobs: FailedJob[] }>({
    queryKey: ['/api/rca/failed-jobs'],
  });

  const failedJobs = failedJobsData?.jobs || [];

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
    },
  });

  const handleAnalyze = (runId: string) => {
    setSelectedRunId(runId);
    setRcaReport(null);
    analyzeMutation.mutate(runId);
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  const getConfidenceBadge = (confidence: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
      high: { variant: "default", icon: CheckCircle2 },
      medium: { variant: "secondary", icon: AlertCircle },
      low: { variant: "outline", icon: AlertCircle },
      none: { variant: "destructive", icon: XCircle },
    };
    const config = variants[confidence] || variants.none;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1" data-testid={`badge-confidence-${confidence}`}>
        <Icon className="h-3 w-3" />
        {confidence.toUpperCase()}
      </Badge>
    );
  };

  const getSeverityBadge = (severity: string) => {
    const severityLower = severity.toLowerCase();
    if (severityLower === 'critical') return <Badge variant="destructive" data-testid={`badge-severity-${severity}`}>{severity}</Badge>;
    if (severityLower === 'major') return <Badge variant="secondary" data-testid={`badge-severity-${severity}`}>{severity}</Badge>;
    return <Badge variant="outline" data-testid={`badge-severity-${severity}`}>{severity}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="page-rca">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Root Cause Analysis</h1>
        <p className="text-muted-foreground" data-testid="text-page-description">
          Analyze Databricks job failures with AI-powered incident correlation
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
                            Analyzing...
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
              {rcaReport?.job_failure.run_name || rcaReport?.job_failure.job_id}
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
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Confidence:</span>
                      {getConfidenceBadge(rcaReport.confidence)}
                    </div>
                    <div>
                      <span className="text-sm font-medium">Likely Root Cause:</span>
                      <p className="text-sm text-muted-foreground mt-1" data-testid="text-root-cause">
                        {rcaReport.likely_root_cause}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Analysis */}
                {rcaReport.ai_analysis && (
                  <Card data-testid="card-ai-analysis">
                    <CardHeader>
                      <CardTitle className="text-lg" data-testid="text-ai-title">AI-Powered Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none" data-testid="text-ai-analysis">
                        <pre className="whitespace-pre-wrap text-sm">{rcaReport.ai_analysis}</pre>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {rcaReport.ai_error && (
                  <Alert data-testid="alert-ai-error">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription data-testid="text-ai-error">
                      AI Analysis unavailable: {rcaReport.ai_error}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Correlated Incidents */}
                {rcaReport.correlated_incidents.length > 0 && (
                  <Card data-testid="card-incidents">
                    <CardHeader>
                      <CardTitle className="text-lg" data-testid="text-incidents-title">
                        Correlated Platform Incidents ({rcaReport.correlated_incidents.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {rcaReport.correlated_incidents.map((correlation, idx) => (
                        <div key={correlation.incident.incident_id} className="border rounded-md p-4 space-y-2" data-testid={`card-incident-${idx}`}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="font-medium" data-testid={`text-incident-title-${idx}`}>
                                {correlation.incident.title}
                              </h4>
                              <p className="text-sm text-muted-foreground mt-1" data-testid={`text-incident-description-${idx}`}>
                                {correlation.incident.description}
                              </p>
                            </div>
                            <div className="flex flex-col gap-2 items-end">
                              {getSeverityBadge(correlation.incident.severity)}
                              <Badge variant="secondary" data-testid={`badge-score-${idx}`}>
                                Score: {correlation.correlation_score}
                              </Badge>
                            </div>
                          </div>
                          <Separator />
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Correlation Reasons:</p>
                            <ul className="text-sm text-muted-foreground list-disc list-inside">
                              {correlation.correlation_reasons.map((reason, ridx) => (
                                <li key={ridx} data-testid={`text-reason-${idx}-${ridx}`}>{reason}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            <span data-testid={`text-source-${idx}`}>{correlation.incident.source_system}</span>
                            <span>•</span>
                            <span data-testid={`text-status-${idx}`}>{correlation.incident.status}</span>
                            <span>•</span>
                            <span data-testid={`text-start-time-${idx}`}>{formatDateTime(correlation.incident.start_time)}</span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

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
