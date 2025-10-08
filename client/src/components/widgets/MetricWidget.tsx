import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricWidgetProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  trend?: "up" | "down";
  badge?: {
    text: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
  className?: string;
}

export function MetricWidget({ title, value, subtitle, change, trend, badge, className }: MetricWidgetProps) {
  return (
    <Card className={cn("border-white/10", className)} data-testid="widget-metric">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {badge && (
          <Badge variant={badge.variant || "default"}>
            {badge.text}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-mono">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {change !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-xs mt-2",
            trend === "up" ? "text-green-500" : "text-red-500"
          )}>
            {trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
