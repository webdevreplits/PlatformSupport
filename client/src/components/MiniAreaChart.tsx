import { cn } from "@/lib/utils";

interface MiniAreaChartProps {
  data: number[];
  className?: string;
  color?: string;
}

export function MiniAreaChart({ data, className, color = "stroke-chart-1 fill-chart-1" }: MiniAreaChartProps) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(" ");

  const areaPath = `M 0,100 L ${points} L 100,100 Z`;
  const linePath = `M ${points}`;

  return (
    <div className={cn("w-full h-full", className)}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        <path
          d={areaPath}
          className={cn("fill-current opacity-20", color.split(" ")[1] || "fill-chart-1")}
        />
        <path
          d={linePath}
          fill="none"
          strokeWidth="2"
          className={cn("stroke-current", color.split(" ")[0] || "stroke-chart-1")}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
