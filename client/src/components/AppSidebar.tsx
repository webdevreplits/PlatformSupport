import { Home, BarChart3, Settings, HelpCircle, Activity, Box } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: BarChart3, label: "Monitoring", path: "/monitoring" },
  { icon: Activity, label: "Analytics", path: "/analytics" },
  { icon: Box, label: "Resources", path: "/resources" },
  { icon: Settings, label: "Settings", path: "/settings" },
  { icon: HelpCircle, label: "Help", path: "/help" },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-16 border-r border-white/10 bg-background/80 backdrop-blur-xl flex flex-col items-center py-4 gap-6 z-40">
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-chart-1 to-chart-4 flex items-center justify-center mb-4">
        <div className="w-5 h-5 bg-white rounded-sm" />
      </div>

      <nav className="flex-1 flex flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Link key={item.path} href={item.path}>
              <button
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center transition-all hover-elevate",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                data-testid={`nav-${item.label.toLowerCase()}`}
                title={item.label}
              >
                <Icon className="w-5 h-5" />
              </button>
            </Link>
          );
        })}
      </nav>

      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-chart-2 to-chart-3" />
    </aside>
  );
}
