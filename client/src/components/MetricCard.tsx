import { GlassmorphicCard } from "./GlassmorphicCard";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: LucideIcon;
  gradient?: "blue" | "mint" | "coral" | "purple" | "dark" | "light";
  badge?: {
    text: string;
    variant?: "default" | "success" | "warning";
  };
  actionButton?: {
    text: string;
    onClick: () => void;
  };
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient = "light",
  badge,
  actionButton,
  trend,
  className,
}: MetricCardProps) {
  return (
    <GlassmorphicCard gradient={gradient} className={cn("p-6 hover-elevate", className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-foreground/70">{title}</h3>
          <div className="mt-2 flex items-end gap-2">
            <p className="text-3xl font-bold font-mono">{value}</p>
            {trend && (
              <span className={cn("text-sm mb-1", trend.isPositive ? "text-chart-2" : "text-chart-3")}>
                {trend.value}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="rounded-lg bg-white/10 p-2">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        {badge && (
          <span
            className={cn(
              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
              badge.variant === "success" && "bg-chart-2/20 text-chart-2",
              badge.variant === "warning" && "bg-chart-3/20 text-chart-3",
              (!badge.variant || badge.variant === "default") && "bg-primary/20 text-primary"
            )}
            data-testid={`badge-${badge.text.toLowerCase().replace(/\s+/g, "-")}`}
          >
            {badge.text}
          </span>
        )}
        {actionButton && (
          <button
            onClick={actionButton.onClick}
            className="ml-auto px-3 py-1 rounded-lg bg-white/10 text-sm font-medium hover-elevate active-elevate-2 transition-all"
            data-testid={`button-${actionButton.text.toLowerCase().replace(/\s+/g, "-")}`}
          >
            {actionButton.text}
          </button>
        )}
      </div>
    </GlassmorphicCard>
  );
}
