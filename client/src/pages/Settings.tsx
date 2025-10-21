import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Sparkles, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [token, setToken] = useState("");
  const [baseUrl, setBaseUrl] = useState("https://adb-7901759384367063.3.azuredatabricks.net/serving-endpoints");
  const { toast } = useToast();

  // Get current configuration
  const configQuery = useQuery({
    queryKey: ["/api/ai/config"],
  });

  useEffect(() => {
    if (configQuery.data) {
      const data = configQuery.data as any;
      if (data.configured && data.baseUrl) {
        setBaseUrl(data.baseUrl);
      }
    }
  }, [configQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ai/config", { token, baseUrl });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Databricks AI configuration saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/ai/config"] });
      setToken(""); // Clear token field after saving for security
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save configuration",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!token.trim()) {
      toast({
        title: "Error",
        description: "Please enter a Databricks token",
        variant: "destructive",
      });
      return;
    }
    saveMutation.mutate();
  };

  const configData = configQuery.data as any;
  const isConfigured = configData?.configured;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your platform configuration and preferences</p>
        </div>

        <Tabs defaultValue="ai" className="space-y-6">
          <TabsList>
            <TabsTrigger value="ai" data-testid="tab-ai-config">AI Configuration</TabsTrigger>
            <TabsTrigger value="account" data-testid="tab-account">Account</TabsTrigger>
            <TabsTrigger value="preferences" data-testid="tab-preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="ai">
            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <CardTitle>Databricks AI Configuration</CardTitle>
                  </div>
                  {isConfigured ? (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Configured
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Not Configured
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  Configure your Databricks Personal Access Token (PAT) to connect to your Databricks Claude Sonnet 4.5 model. 
                  This will enable AI-powered features including chat assistant, incident analysis, and automated fix generation 
                  using YOUR Databricks serving endpoint (not Replit AI).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="databricks-token">Databricks Personal Access Token (PAT)</Label>
                    <Input
                      id="databricks-token"
                      type="password"
                      placeholder="dapi..."
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      data-testid="input-databricks-token"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Your Databricks PAT token from workspace User Settings → Developer → Access tokens. 
                      <a href="https://docs.databricks.com/en/dev-tools/auth/pat.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                        Learn how
                      </a>
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="base-url">Databricks Serving Endpoint Base URL</Label>
                    <Input
                      id="base-url"
                      type="text"
                      value={baseUrl}
                      onChange={(e) => setBaseUrl(e.target.value)}
                      data-testid="input-base-url"
                      className="mt-1"
                      placeholder="https://adb-7901759384367063.3.azuredatabricks.net/serving-endpoints"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Format: https://&lt;workspace-url&gt;/serving-endpoints (without the endpoint name)
                    </p>
                  </div>

                  <Button 
                    onClick={handleSave}
                    disabled={saveMutation.isPending}
                    data-testid="button-save-ai-config"
                  >
                    {saveMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Configuration"
                    )}
                  </Button>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium mb-2">AI Features Enabled:</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      AI Assistant chat interface
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Automated incident analysis
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Fix script generation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Dashboard operational insights
                    </li>
                  </ul>
                </div>

                {isConfigured && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Connected to Your Databricks Claude Sonnet 4.5</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Successfully connected to your Databricks serving endpoint. All AI features now use 
                          YOUR Databricks Claude model (not Replit AI).
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    defaultValue="admin@azureops.com" 
                    data-testid="input-username"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    defaultValue="admin@azureops.com" 
                    data-testid="input-email"
                    className="mt-1"
                  />
                </div>
                <Button data-testid="button-save-account">Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Customize your platform experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Input 
                    id="language" 
                    defaultValue="English" 
                    data-testid="input-language"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input 
                    id="timezone" 
                    defaultValue="UTC-8 (Pacific Time)" 
                    data-testid="input-timezone"
                    className="mt-1"
                  />
                </div>
                <Button data-testid="button-save-preferences">Save Preferences</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
