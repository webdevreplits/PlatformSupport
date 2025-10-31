import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Clock, CheckCircle2, XCircle } from "lucide-react";
import { BackgroundDecor } from "@/components/BackgroundDecor";
import { DashboardHeader } from "@/components/DashboardHeader";

export default function Jobs() {
  const handleThemeToggle = () => {
    document.documentElement.classList.toggle("dark");
  };

  const jobs = [
    { id: "job-123", name: "ETL Pipeline - Daily", cluster: "analytics-cluster", status: "Success", duration: "12m 34s", lastRun: "30 min ago" },
    { id: "job-124", name: "Data Quality Check", cluster: "data-quality", status: "Running", duration: "5m 12s", lastRun: "running" },
    { id: "job-125", name: "ML Model Training", cluster: "ml-cluster", status: "Success", duration: "45m 22s", lastRun: "2 hours ago" },
    { id: "job-126", name: "Report Generation", cluster: "reporting", status: "Failed", duration: "2m 15s", lastRun: "1 hour ago" },
  ];

  return (
    <div className="min-h-screen relative">
      <BackgroundDecor />
      <div className="relative z-10">
        <DashboardHeader onThemeToggle={handleThemeToggle} isDark={document.documentElement.classList.contains('dark')} />
        <main className="container mx-auto px-4 lg:px-8 py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Databricks Jobs</h1>
            <p className="text-muted-foreground mt-1">Monitor job execution and performance</p>
          </div>

        <div className="grid gap-4">
          {jobs.map((job) => (
            <Card key={job.id} className="shadow-sm">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <Database className="h-5 w-5 text-chart-1" />
                    <div>
                      <CardTitle className="text-lg">{job.name}</CardTitle>
                      <CardDescription className="mt-1">Cluster: {job.cluster}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={job.status === "Success" ? "default" : job.status === "Failed" ? "destructive" : "secondary"}>
                    {job.status === "Success" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                    {job.status === "Failed" && <XCircle className="h-3 w-3 mr-1" />}
                    {job.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Duration: {job.duration}</span>
                  </div>
                  <span>•</span>
                  <span>Last run: {job.lastRun}</span>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        </main>
      </div>
    </div>
  );
}
