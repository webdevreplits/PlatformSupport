import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock, CheckCircle2, Sparkles, Loader2, Code } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Incidents() {
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<Record<string, string>>({});
  const [aiScript, setAiScript] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const incidents = [
    { id: "INC0012345", title: "Databricks Job Failure", description: "Job cluster failed to start due to insufficient quota in region", priority: "High", status: "Open", created: "2 hours ago", service: "Databricks" },
    { id: "INC0012344", title: "Power BI Report Error", description: "Unable to refresh dataset - connection timeout", priority: "Medium", status: "In Progress", created: "5 hours ago", service: "Power BI" },
    { id: "INC0012343", title: "API Gateway Timeout", description: "Gateway timeout errors on production API endpoints", priority: "Critical", status: "Open", created: "1 hour ago", service: "API Management" },
    { id: "INC0012342", title: "Storage Account Access Issue", description: "403 Forbidden error when accessing blob storage", priority: "Medium", status: "Resolved", created: "1 day ago", service: "Storage" },
  ];

  const summarizeMutation = useMutation({
    mutationFn: async (incident: typeof incidents[0]) => {
      const response = await apiRequest("POST", "/api/ai/summarize-incident", incident);
      return response.json().then((data: { summary: string }) => data.summary);
    },
    onSuccess: (summary, incident) => {
      setAiSummary(prev => ({ ...prev, [incident.id]: summary }));
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate AI summary",
        variant: "destructive",
      });
    }
  });

  const generateFixMutation = useMutation({
    mutationFn: async (incident: typeof incidents[0]) => {
      const response = await apiRequest("POST", "/api/ai/generate-fix", incident);
      return response.json().then((data: { script: string }) => data.script);
    },
    onSuccess: (script, incident) => {
      setAiScript(prev => ({ ...prev, [incident.id]: script }));
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate fix script",
        variant: "destructive",
      });
    }
  });

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">ServiceNow Incidents</h1>
          <p className="text-muted-foreground mt-1">Track and manage platform incidents with AI assistance</p>
        </div>

        <div className="grid gap-4">
          {incidents.map((incident) => (
            <Card key={incident.id} className="shadow-sm">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{incident.id}</CardTitle>
                    <CardDescription className="mt-1">{incident.title}</CardDescription>
                    <p className="text-sm text-muted-foreground mt-2">{incident.description}</p>
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
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Created {incident.created}</span>
                  <span className="mx-2">•</span>
                  <span>{incident.service}</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => summarizeMutation.mutate(incident)}
                    disabled={summarizeMutation.isPending}
                    data-testid={`button-summarize-${incident.id}`}
                  >
                    {summarizeMutation.isPending && summarizeMutation.variables?.id === incident.id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    AI Summary
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateFixMutation.mutate(incident)}
                    disabled={generateFixMutation.isPending}
                    data-testid={`button-fix-${incident.id}`}
                  >
                    {generateFixMutation.isPending && generateFixMutation.variables?.id === incident.id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Code className="h-4 w-4 mr-2" />
                    )}
                    Generate Fix
                  </Button>
                </div>

                {aiSummary[incident.id] && (
                  <div className="rounded-lg bg-muted p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">AI Analysis</span>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{aiSummary[incident.id]}</p>
                  </div>
                )}

                {aiScript[incident.id] && (
                  <div className="rounded-lg bg-muted p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Code className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Automated Fix Script</span>
                    </div>
                    <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono">{aiScript[incident.id]}</pre>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
