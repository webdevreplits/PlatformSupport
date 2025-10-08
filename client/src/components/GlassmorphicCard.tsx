import { cn } from "@/lib/utils";

interface GlassmorphicCardProps {
  children: React.ReactNode;
  className?: string;
  gradient?: "blue" | "mint" | "coral" | "purple" | "dark" | "light";
}

const gradientStyles = {
  blue: "bg-gradient-to-br from-gradient-blue/20 to-gradient-blue/5",
  mint: "bg-gradient-to-br from-gradient-mint/20 to-gradient-mint/5",
  coral: "bg-gradient-to-br from-gradient-coral/20 to-gradient-coral/5",
  purple: "bg-gradient-to-br from-gradient-purple/20 to-gradient-purple/5",
  dark: "bg-gradient-to-br from-white/5 to-white/2",
  light: "bg-gradient-to-br from-white/15 to-white/8",
};

export function GlassmorphicCard({ children, className, gradient = "light" }: GlassmorphicCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl transition-all duration-300",
        gradientStyles[gradient],
        className
      )}
    >
      {children}
    </div>
  );
}
