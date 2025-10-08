import { Button } from "@/components/ui/button";

interface ButtonWidgetProps {
  text: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  onClick?: () => void;
  className?: string;
}

export function ButtonWidget({ text, variant = "default", size = "default", onClick, className }: ButtonWidgetProps) {
  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={onClick}
      className={className}
      data-testid="widget-button"
    >
      {text}
    </Button>
  );
}
