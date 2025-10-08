import { DashboardHeader } from "@/components/DashboardHeader";
import { GlassmorphicCard } from "@/components/GlassmorphicCard";
import { CircularProgress } from "@/components/CircularProgress";
import { MiniAreaChart } from "@/components/MiniAreaChart";
import { StatusToggle } from "@/components/StatusToggle";
import { Activity, AlertCircle, CheckCircle2, Database, Server, Workflow } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const chartData = [30, 45, 35, 60, 55, 70, 65, 80, 75, 90];

  const handleThemeToggle = () => {
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onThemeToggle={handleThemeToggle} isDark={document.documentElement.classList.contains('dark')} />

      <main className="container mx-auto px-4 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Azure Platform Support</h1>
          <p className="text-muted-foreground">Monitor and manage your Azure infrastructure and services</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
              <div className="text-2xl font-bold font-mono">142</div>
              <p className="text-xs text-muted-foreground mt-1">
                Running Jobs
              </p>
              <div className="flex items-center gap-1 text-xs mt-2 text-green-500">
                <CheckCircle2 className="h-3 w-3" />
                <span>98% success rate</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
              <Workflow className="h-4 w-4 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">47</div>
              <p className="text-xs text-muted-foreground mt-1">
                Automation Flows
              </p>
              <div className="flex items-center gap-1 text-xs mt-2 text-green-500">
                <span>All operational</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <Server className="h-4 w-4 text-chart-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">99.8%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Uptime (30 days)
              </p>
              <div className="flex items-center gap-1 text-xs mt-2 text-green-500">
                <CheckCircle2 className="h-3 w-3" />
                <span>Healthy</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
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
                <h3 className="text-sm font-medium text-foreground/70">Job Success Rate</h3>
              </div>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <div className="h-20 flex items-center justify-center">
              <CircularProgress value={98} size={80} strokeWidth={8} className="text-green-500" />
            </div>
          </Card>

          <Card className="shadow-sm p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-medium text-foreground/70">Active Alerts</h3>
                <p className="text-3xl font-bold font-mono mt-2">12</p>
              </div>
              <AlertCircle className="w-5 h-5 text-chart-3" />
            </div>
            <div className="text-xs text-muted-foreground mb-2">Monitoring Alerts</div>
            <div className="flex gap-2">
              <Badge variant="destructive">3 High</Badge>
              <Badge variant="secondary">9 Medium</Badge>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <div>
                    <p className="text-sm font-medium">Databricks Job Completed</p>
                    <p className="text-xs text-muted-foreground">ETL Pipeline - 2 min ago</p>
                  </div>
                </div>
                <Badge variant="default">Success</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <div>
                    <p className="text-sm font-medium">ServiceNow Ticket Created</p>
                    <p className="text-xs text-muted-foreground">INC0012345 - 15 min ago</p>
                  </div>
                </div>
                <Badge variant="secondary">Open</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <div>
                    <p className="text-sm font-medium">Workflow Triggered</p>
                    <p className="text-xs text-muted-foreground">Auto-remediation - 30 min ago</p>
                  </div>
                </div>
                <Badge variant="outline">Running</Badge>
              </div>
            </div>
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
    </div>
  );
}
