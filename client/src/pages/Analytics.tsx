import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Users, Database, Activity, Zap } from "lucide-react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { BackgroundDecor } from "@/components/BackgroundDecor";
import { Footer } from "@/components/Footer";

export default function Analytics() {
  const handleThemeToggle = () => {
    document.documentElement.classList.toggle("dark");
  };
  const databricksJobs = [
    { name: "ETL Pipeline", runs: 245, success: 242, avgDuration: "12m" },
    { name: "Data Quality Check", runs: 180, success: 178, avgDuration: "5m" },
    { name: "ML Model Training", runs: 32, success: 30, avgDuration: "45m" },
    { name: "Report Generation", runs: 120, success: 119, avgDuration: "8m" },
  ];

  const systemMetrics = [
    { label: "CPU Usage", value: "45%", trend: "stable" },
    { label: "Memory Usage", value: "62%", trend: "up" },
    { label: "Network I/O", value: "1.2 GB/s", trend: "stable" },
    { label: "Storage", value: "78%", trend: "up" },
  ];

  const userActivity = [
    { user: "admin@company.com", actions: 142, lastActive: "5 min ago" },
    { user: "dev1@company.com", actions: 87, lastActive: "15 min ago" },
    { user: "analyst@company.com", actions: 63, lastActive: "1 hour ago" },
  ];

  return (
    <div className="min-h-screen relative">
      <BackgroundDecor />
      <div className="relative z-10">
        <DashboardHeader onThemeToggle={handleThemeToggle} isDark={document.documentElement.classList.contains('dark')} />
        <main className="container mx-auto px-4 lg:px-8 py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Platform Analytics</h1>
            <p className="text-white/70 mt-1">Comprehensive insights into platform performance and usage</p>
          </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="databricks" data-testid="tab-databricks">Databricks</TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">User Activity</TabsTrigger>
            <TabsTrigger value="system" data-testid="tab-system">System Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                  <CardTitle className="text-sm font-medium">Total Jobs Run</CardTitle>
                  <BarChart3 className="h-4 w-4 text-chart-1" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono">577</div>
                  <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
                  <div className="flex items-center gap-1 text-xs mt-2 text-green-500">
                    <TrendingUp className="h-3 w-3" />
                    <span>+12% from last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <Zap className="h-4 w-4 text-chart-2" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono">98.2%</div>
                  <p className="text-xs text-muted-foreground mt-1">Job completion rate</p>
                  <div className="flex items-center gap-1 text-xs mt-2 text-green-500">
                    <span>Excellent performance</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-chart-3" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono">23</div>
                  <p className="text-xs text-muted-foreground mt-1">Last 24 hours</p>
                  <div className="flex items-center gap-1 text-xs mt-2 text-muted-foreground">
                    <span>8 online now</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                  <CardTitle className="text-sm font-medium">Data Processed</CardTitle>
                  <Database className="h-4 w-4 text-chart-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-mono">2.4 TB</div>
                  <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
                  <div className="flex items-center gap-1 text-xs mt-2 text-green-500">
                    <TrendingUp className="h-3 w-3" />
                    <span>+8% from last week</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Platform Health Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {systemMetrics.map((metric) => (
                    <div key={metric.label} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{metric.label}</span>
                        <Badge variant={metric.trend === "up" ? "secondary" : "default"}>
                          {metric.trend === "up" ? "↑" : "→"}
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold font-mono">{metric.value}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="databricks" className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Databricks Job Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {databricksJobs.map((job) => (
                    <div key={job.name} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="flex-1">
                        <h4 className="font-medium">{job.name}</h4>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>{job.runs} runs</span>
                          <span>•</span>
                          <span>{job.success} successful</span>
                          <span>•</span>
                          <span>Avg: {job.avgDuration}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="default">
                          {((job.success / job.runs) * 100).toFixed(1)}% success
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userActivity.map((user) => (
                    <div key={user.user} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div>
                        <h4 className="font-medium">{user.user}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {user.actions} actions • Last active {user.lastActive}
                        </p>
                      </div>
                      <Activity className="h-5 w-5 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Resource Utilization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {systemMetrics.map((metric) => (
                    <div key={metric.label}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{metric.label}</span>
                        <span className="text-sm font-mono">{metric.value}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2"
                          style={{ width: metric.value }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>System Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Platform Version</span>
                    <span className="text-sm font-medium">v2.5.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Uptime</span>
                    <span className="text-sm font-medium">23 days, 14 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Environment</span>
                    <Badge variant="default">Production</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Region</span>
                    <span className="text-sm font-medium">East US 2</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        </main>
        <Footer />
      </div>
    </div>
  );
}
