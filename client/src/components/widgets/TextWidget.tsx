import { cn } from "@/lib/utils";

interface TextWidgetProps {
  content: string;
  size?: "sm" | "base" | "lg";
  weight?: "normal" | "medium" | "semibold" | "bold";
  color?: "default" | "muted" | "primary";
  className?: string;
}

export function TextWidget({ content, size = "base", weight = "normal", color = "default", className }: TextWidgetProps) {
  const sizeClasses = {
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
  };

  const weightClasses = {
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
  };

  const colorClasses = {
    default: "text-foreground",
    muted: "text-muted-foreground",
    primary: "text-primary",
  };

  return (
    <p 
      className={cn(sizeClasses[size], weightClasses[weight], colorClasses[color], className)}
      data-testid="widget-text"
    >
      {content}
    </p>
  );
}
