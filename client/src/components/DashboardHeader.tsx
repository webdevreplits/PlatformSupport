import { Search, Bell, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface DashboardHeaderProps {
  onThemeToggle?: () => void;
  isDark?: boolean;
}

export function DashboardHeader({ onThemeToggle, isDark = true }: DashboardHeaderProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filters = [
    { key: "compute", label: "Compute" },
    { key: "storage", label: "Storage" },
    { key: "database", label: "Database" },
    { key: "networking", label: "Networking" },
    { key: "analytics", label: "Analytics" },
    { key: "security", label: "Security" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-chart-1 to-chart-4 flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm" />
              </div>
              <span className="font-semibold text-lg hidden sm:block">Azure Platform Support</span>
            </div>
          </div>

          <div className="flex-1 max-w-xl hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search resources, costs, or incidents..."
                className="pl-10 bg-white/5 border-white/10 focus-visible:ring-primary"
                data-testid="input-search"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onThemeToggle}
              data-testid="button-theme-toggle"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" data-testid="button-notifications">
              <Bell className="w-4 h-4" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                3
              </Badge>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 pb-3 overflow-x-auto scrollbar-hide">
          <span className="text-sm text-muted-foreground mr-2">Filter by:</span>
          {filters.map((filter) => (
            <Badge
              key={filter.key}
              variant={activeFilter === filter.key ? "default" : "outline"}
              className="cursor-pointer hover-elevate"
              onClick={() => setActiveFilter(activeFilter === filter.key ? null : filter.key)}
              data-testid={`filter-${filter.key}`}
            >
              {filter.label}
            </Badge>
          ))}
        </div>
      </div>
    </header>
  );
}
