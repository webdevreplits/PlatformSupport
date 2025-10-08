import { Home, FileText, BarChart3, Settings, HelpCircle, Activity, Box, LogOut, User, DollarSign } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const navItems = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: DollarSign, label: "Cost Analysis", path: "/cost-analysis" },
  { icon: Box, label: "Resources", path: "/resources" },
  { icon: FileText, label: "Pages", path: "/pages" },
  { icon: Activity, label: "Incidents", path: "/incidents" },
  { icon: BarChart3, label: "Jobs", path: "/jobs" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 rounded-full bg-gradient-to-br from-chart-2 to-chart-3"
            data-testid="button-user-menu"
          >
            <User className="w-5 h-5 text-white" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="right" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="text-sm">{user?.email}</span>
              <span className="text-xs text-muted-foreground capitalize">{user?.role}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} data-testid="button-logout">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </aside>
  );
}
