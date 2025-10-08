import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export default function CostAnalysis() {
  const [timeRange, setTimeRange] = useState("30d");

  const costData = {
    total: "$12,847.32",
    change: 8.5,
    trend: "up" as const,
    breakdown: [
      { category: "Compute", cost: "$5,234.50", percentage: 40.7, change: 12.3 },
      { category: "Storage", cost: "$3,120.45", percentage: 24.3, change: -5.2 },
      { category: "Database", cost: "$2,890.12", percentage: 22.5, change: 15.8 },
      { category: "Networking", cost: "$1,602.25", percentage: 12.5, change: 3.4 },
    ],
    topResources: [
      { name: "databricks-workspace-prod", type: "Databricks", cost: "$2,345.67", region: "East US" },
      { name: "sqldb-analytics", type: "SQL Database", cost: "$1,890.23", region: "West Europe" },
      { name: "storage-account-main", type: "Storage", cost: "$1,234.56", region: "Central US" },
    ],
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Cost Analysis</h1>
            <p className="text-muted-foreground mt-1">Monitor and optimize Azure spending</p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40" data-testid="select-timerange">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-6 mb-6">
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Total Azure Costs</CardTitle>
                  <CardDescription>Current billing period</CardDescription>
                </div>
                <DollarSign className="h-8 w-8 text-chart-1" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold font-mono mb-4">{costData.total}</div>
              <div className={`flex items-center gap-2 text-sm ${costData.trend === "up" ? "text-red-500" : "text-green-500"}`}>
                {costData.trend === "up" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span>{costData.change}% vs last period</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Cost by Category</CardTitle>
              <CardDescription>Resource type breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {costData.breakdown.map((item) => (
                  <div key={item.category}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{item.category}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono">{item.cost}</span>
                        <Badge variant={item.change > 0 ? "destructive" : "default"} className="text-xs">
                          {item.change > 0 ? "+" : ""}{item.change}%
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Top Cost Resources</CardTitle>
              <CardDescription>Highest spending resources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {costData.topResources.map((resource, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div>
                      <p className="text-sm font-medium">{resource.name}</p>
                      <p className="text-xs text-muted-foreground">{resource.type} • {resource.region}</p>
                    </div>
                    <span className="text-sm font-mono font-semibold">{resource.cost}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
