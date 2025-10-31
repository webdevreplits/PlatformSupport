import { DashboardHeader } from "@/components/DashboardHeader";
import { BackgroundDecor } from "@/components/BackgroundDecor";
import { Footer } from "@/components/Footer";
import { GlassmorphicCard } from "@/components/GlassmorphicCard";
import { MiniAreaChart } from "@/components/MiniAreaChart";
import { StatusToggle } from "@/components/StatusToggle";
import { Activity, AlertCircle, CheckCircle2, Database, Server, Workflow, Sparkles, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState, useEffect } from "react";

interface DashboardMetrics {
  jobs: {
    total: number;
    running: number;
    failed: number;
    success_rate: number;
  };
  clusters: {
    total: number;
  };
  workflows: {
    count: number;
  };
  system_health: number;
  recent_activity: Array<{
    job_id: string;
    run_id: string;
    run_name: string;
    result_state: string;
    period_end_time: string;
    termination_code: string;
  }>;
}

export default function Dashboard() {
  const chartData = [30, 45, 35, 60, 55, 70, 65, 80, 75, 90];
  const [aiInsights, setAiInsights] = useState<string>("");

  const handleThemeToggle = () => {
    document.documentElement.classList.toggle("dark");
  };

  // Fetch real metrics from Databricks
  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ['/api/dashboard/metrics'],
  });

  const insightsMutation = useMutation({
    mutationFn: async () => {
      const metricsData = {
        incidents: 23,
        jobs: metrics?.jobs?.total || 0,
        health: metrics?.system_health || 0,
        costTrend: "stable"
      };
      
      const response = await apiRequest("POST", "/api/ai/dashboard-insights", metricsData);
      return response.json().then((data: { insights: string }) => data.insights);
    },
    onSuccess: (insights) => {
      setAiInsights(insights);
    }
  });

  useEffect(() => {
    if (metrics) {
      insightsMutation.mutate();
    }
  }, [metrics]);

  return (
    <div className="min-h-screen relative">
      <BackgroundDecor />
      <div className="relative z-10">
        <DashboardHeader onThemeToggle={handleThemeToggle} isDark={document.documentElement.classList.contains('dark')} />

        <main className="container mx-auto px-4 lg:px-8 py-6">
          <div className="mb-6">
            <p className="text-sm text-white/70">Monitor and manage your data analytics infrastructure and services</p>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
                <AlertCircle className="h-4 w-4 text-chart-3" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">23</div>
                <p className="text-xs text-muted-foreground mt-1">
                  ServiceNow Tickets
                </p>
                <div className="flex items-center gap-1 text-xs mt-2 text-chart-3">
                  <span>5 critical</span>
                </div>
              </CardContent>
            </Card>
          

          
            <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">Databricks Jobs</CardTitle>
              <Database className="h-4 w-4 text-chart-1" />
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <div className="text-2xl font-bold font-mono" data-testid="text-jobs-running">{metrics?.jobs?.running || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Running Jobs
                  </p>
                  <div className="flex items-center gap-1 text-xs mt-2 text-green-500">
                    <CheckCircle2 className="h-3 w-3" />
                    <span data-testid="text-success-rate">{metrics?.jobs?.success_rate || 0}% success rate</span>
                  </div>
                </>
              )}
            </CardContent>
            </Card>
          

          
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
                <Workflow className="h-4 w-4 text-chart-2" />
              </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <div className="text-2xl font-bold font-mono" data-testid="text-workflows-count">{metrics?.workflows?.count || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Automation Flows
                  </p>
                  <div className="flex items-center gap-1 text-xs mt-2 text-green-500">
                    <span>Total workflows</span>
                  </div>
                </>
              )}
            </CardContent>
            </Card>
          

          
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <Server className="h-4 w-4 text-chart-4" />
              </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <div className="text-2xl font-bold font-mono" data-testid="text-system-health">{metrics?.system_health || 0}%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Uptime (30 days)
                  </p>
                  <div className="flex items-center gap-1 text-xs mt-2 text-green-500">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Healthy</span>
                  </div>
                </>
              )}
            </CardContent>
            </Card>
          
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
            <Card className="shadow-sm p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-medium text-foreground/70">Incident Response Time</h3>
                <p className="text-3xl font-bold font-mono mt-2">2.4 hrs</p>
              </div>
              <Activity className="w-5 h-5 text-chart-1" />
            </div>
            <div className="text-xs text-muted-foreground mb-2">Average Resolution Time</div>
            <Badge variant="default">Within SLA</Badge>
            </Card>
          

          
            <Card className="shadow-sm p-6">
              <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-medium text-foreground/70">Failed Jobs</h3>
                {metricsLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mt-2" />
                ) : (
                  <p className="text-3xl font-bold font-mono mt-2" data-testid="text-failed-jobs">{metrics?.jobs?.failed || 0}</p>
                )}
              </div>
              <AlertCircle className="w-5 h-5 text-chart-3" />
            </div>
            <div className="text-xs text-muted-foreground mb-2">Last 7 days</div>
            {!metricsLoading && metrics?.jobs?.failed && metrics.jobs.failed > 0 && (
              <Badge variant="destructive">{metrics.jobs.failed} Failures</Badge>
            )}
            </Card>
          
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
            <Card className="shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {metricsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : metrics?.recent_activity && metrics.recent_activity.length > 0 ? (
                metrics.recent_activity.slice(0, 5).map((activity, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white/5" data-testid={`activity-${idx}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${activity.result_state === 'SUCCESS' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div>
                        <p className="text-sm font-medium">{activity.run_name || `Job ${activity.job_id}`}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.period_end_time).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={activity.result_state === 'SUCCESS' ? 'default' : 'destructive'}>
                      {activity.result_state}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center text-sm text-muted-foreground py-8">
                  No recent activity
                </div>
              )}
            </div>
            </Card>
          

          
            <Card className="shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">AI Insights</h3>
                </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => insightsMutation.mutate()}
                disabled={insightsMutation.isPending}
                data-testid="button-refresh-insights"
              >
                {insightsMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Refresh"
                )}
              </Button>
            </div>
            {insightsMutation.isPending && !aiInsights ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                {aiInsights || "No insights available"}
              </div>
            )}
            </Card>
          

          <Card className="shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Connected Services</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-chart-1" />
                  <div>
                    <p className="text-sm font-medium">Databricks</p>
                    <p className="text-xs text-muted-foreground">Azure Workspace</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs">Connected</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <Server className="w-5 h-5 text-chart-2" />
                  <div>
                    <p className="text-sm font-medium">ServiceNow</p>
                    <p className="text-xs text-muted-foreground">Production Instance</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs">Connected</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-chart-3" />
                  <div>
                    <p className="text-sm font-medium">Power BI</p>
                    <p className="text-xs text-muted-foreground">Analytics Workspace</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs">Connected</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
      </div>
    </div>
  );
}
