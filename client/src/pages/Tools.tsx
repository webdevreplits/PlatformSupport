import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Server, Activity, BarChart3 } from "lucide-react";
import { BackgroundDecor } from "@/components/BackgroundDecor";
import { DashboardHeader } from "@/components/DashboardHeader";

export default function Tools() {
  const handleThemeToggle = () => {
    document.documentElement.classList.toggle("dark");
  };

  const tools = [
    { id: 1, name: "Databricks", type: "Data Platform", icon: Database, status: "Connected", lastSync: "2 min ago" },
    { id: 2, name: "ServiceNow", type: "ITSM", icon: Server, status: "Connected", lastSync: "5 min ago" },
    { id: 3, name: "Power BI", type: "Analytics", icon: BarChart3, status: "Connected", lastSync: "10 min ago" },
    { id: 4, name: "Azure DevOps", type: "CI/CD", icon: Activity, status: "Connected", lastSync: "1 min ago" },
  ];

  return (
    <div className="min-h-screen relative">
      <BackgroundDecor />
      <div className="relative z-10">
        <DashboardHeader onThemeToggle={handleThemeToggle} isDark={document.documentElement.classList.contains('dark')} />
        <main className="container mx-auto px-4 lg:px-8 py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Connected Tools</h1>
            <p className="text-white/70 mt-1">Manage platform integrations and connectors</p>
          </div>

        <div className="grid md:grid-cols-2 gap-4">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card key={tool.id} className="shadow-sm">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{tool.name}</CardTitle>
                        <CardDescription className="mt-1">{tool.type}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <Badge variant="outline">{tool.status}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Last sync: {tool.lastSync}</p>
                </CardContent>
              </Card>
            );
          })}
          </div>
        </main>
      </div>
    </div>
  );
}
