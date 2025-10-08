import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Server, Database, HardDrive, Network } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Resources() {
  const resources = {
    compute: [
      { name: "vm-prod-web-01", type: "Virtual Machine", status: "Running", region: "East US", size: "Standard_D4s_v3" },
      { name: "databricks-workspace", type: "Databricks", status: "Running", region: "East US", tier: "Premium" },
      { name: "aks-cluster-prod", type: "Kubernetes", status: "Running", region: "West Europe", nodes: 5 },
    ],
    storage: [
      { name: "storageprod001", type: "Storage Account", status: "Active", region: "Central US", capacity: "2.5 TB" },
      { name: "datalake-analytics", type: "Data Lake", status: "Active", region: "East US", capacity: "15.3 TB" },
    ],
    database: [
      { name: "sqldb-prod-main", type: "SQL Database", status: "Online", region: "East US", tier: "Business Critical" },
      { name: "cosmos-global-db", type: "Cosmos DB", status: "Online", region: "Multi-region", consistency: "Strong" },
    ],
    networking: [
      { name: "vnet-prod-eastus", type: "Virtual Network", status: "Active", region: "East US", addressSpace: "10.0.0.0/16" },
      { name: "appgw-prod-lb", type: "Application Gateway", status: "Running", region: "East US", tier: "WAF v2" },
    ],
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      Running: "default",
      Active: "default",
      Online: "default",
      Stopped: "secondary",
      Failed: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const getIcon = (category: string) => {
    const icons: Record<string, any> = {
      compute: Server,
      storage: HardDrive,
      database: Database,
      networking: Network,
    };
    const Icon = icons[category] || Server;
    return <Icon className="h-5 w-5" />;
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Azure Resources</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor infrastructure resources</p>
        </div>

        <Tabs defaultValue="compute" className="space-y-6">
          <TabsList>
            <TabsTrigger value="compute" data-testid="tab-compute">Compute</TabsTrigger>
            <TabsTrigger value="storage" data-testid="tab-storage">Storage</TabsTrigger>
            <TabsTrigger value="database" data-testid="tab-database">Database</TabsTrigger>
            <TabsTrigger value="networking" data-testid="tab-networking">Networking</TabsTrigger>
          </TabsList>

          {Object.entries(resources).map(([category, items]) => (
            <TabsContent key={category} value={category} className="space-y-4">
              {items.map((resource: any, idx) => (
                <Card key={idx} className="shadow-sm">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 rounded-lg bg-primary/10">
                          {getIcon(category)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{resource.name}</CardTitle>
                          <CardDescription className="mt-1">{resource.type}</CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(resource.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Region:</span>
                        <span>{resource.region}</span>
                      </div>
                      {resource.size && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Size:</span>
                          <span>{resource.size}</span>
                        </div>
                      )}
                      {resource.tier && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Tier:</span>
                          <span>{resource.tier}</span>
                        </div>
                      )}
                      {resource.capacity && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Capacity:</span>
                          <span>{resource.capacity}</span>
                        </div>
                      )}
                      {resource.nodes && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Nodes:</span>
                          <span>{resource.nodes}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
