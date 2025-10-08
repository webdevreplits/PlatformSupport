import { cn } from "@/lib/utils";

interface HeadingWidgetProps {
  text: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  align?: "left" | "center" | "right";
  className?: string;
}

export function HeadingWidget({ text, level = 2, align = "left", className }: HeadingWidgetProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  const sizeClasses = {
    1: "text-4xl font-bold",
    2: "text-3xl font-bold",
    3: "text-2xl font-semibold",
    4: "text-xl font-semibold",
    5: "text-lg font-medium",
    6: "text-base font-medium",
  };

  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <Tag 
      className={cn(sizeClasses[level], alignClasses[align], "text-foreground", className)}
      data-testid="widget-heading"
    >
      {text}
    </Tag>
  );
}
