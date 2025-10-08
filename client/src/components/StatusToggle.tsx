import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface StatusToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  label?: string;
  className?: string;
}

export function StatusToggle({ enabled, onToggle, label, className }: StatusToggleProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
      <Switch
        checked={enabled}
        onCheckedChange={onToggle}
        data-testid={`toggle-${label?.toLowerCase().replace(/\s+/g, "-") || "status"}`}
      />
    </div>
  );
}
