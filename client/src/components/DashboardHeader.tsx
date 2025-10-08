import { Search, SlidersHorizontal, Bell, Moon, Sun } from "lucide-react";
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

  const filters = ["App", "Aury", "Nlev", "Esso", "Gallup", "Bi.mes", "Biling_Nlissues"];

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
                placeholder="Spot Cost | Jo Hotlook"
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
            </Button>
            <Button variant="default" className="hidden sm:flex" data-testid="button-primary-action">
              Coni.hotnorr
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 pb-3 overflow-x-auto scrollbar-hide">
          <Button variant="ghost" size="sm" className="gap-2" data-testid="button-filters">
            <SlidersHorizontal className="w-3 h-3" />
            Filters
          </Button>
          {filters.map((filter) => (
            <Badge
              key={filter}
              variant={activeFilter === filter ? "default" : "outline"}
              className="cursor-pointer hover-elevate"
              onClick={() => setActiveFilter(activeFilter === filter ? null : filter)}
              data-testid={`filter-${filter.toLowerCase()}`}
            >
              {filter}
            </Badge>
          ))}
        </div>
      </div>
    </header>
  );
}
