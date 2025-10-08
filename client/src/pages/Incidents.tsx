import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, CheckCircle2 } from "lucide-react";

export default function Incidents() {
  const incidents = [
    { id: "INC0012345", title: "Databricks Job Failure", priority: "High", status: "Open", created: "2 hours ago" },
    { id: "INC0012344", title: "Power BI Report Error", priority: "Medium", status: "In Progress", created: "5 hours ago" },
    { id: "INC0012343", title: "API Gateway Timeout", priority: "Critical", status: "Open", created: "1 hour ago" },
    { id: "INC0012342", title: "Storage Account Access Issue", priority: "Medium", status: "Resolved", created: "1 day ago" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(235,50%,9%)] via-[hsl(240,45%,11%)] to-[hsl(250,40%,12%)] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">ServiceNow Incidents</h1>
          <p className="text-white/60 mt-1">Track and manage platform incidents</p>
        </div>

        <div className="grid gap-4">
          {incidents.map((incident) => (
            <Card key={incident.id} className="border-white/10 backdrop-blur-xl bg-card/50">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{incident.id}</CardTitle>
                    <CardDescription className="mt-1">{incident.title}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={incident.priority === "Critical" ? "destructive" : incident.priority === "High" ? "destructive" : "secondary"}>
                      {incident.priority}
                    </Badge>
                    <Badge variant={incident.status === "Resolved" ? "default" : "outline"}>
                      {incident.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Created {incident.created}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
