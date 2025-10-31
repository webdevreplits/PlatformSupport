import { Search, Bell, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import platformLogo from "@assets/image_1761933414000.png";

interface DashboardHeaderProps {
  onThemeToggle?: () => void;
  isDark?: boolean;
}

interface Notification {
  job_id: string;
  run_id: string;
  run_name: string;
  result_state: string;
  period_end_time: string;
  termination_code: string;
}

interface NotificationResponse {
  count: number;
  notifications: Notification[];
}

export function DashboardHeader({ onThemeToggle, isDark = true }: DashboardHeaderProps) {
  const { data: notificationData } = useQuery<NotificationResponse>({
    queryKey: ['/api/notifications'],
    refetchInterval: 30000,
  });

  const notificationCount = notificationData?.count || 0;
  const notifications = notificationData?.notifications || [];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-gradient-to-r from-[#1e1b4b] via-[#312e81] to-[#1e3a8a] shadow-lg">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={platformLogo} alt="Platform" className="h-10 w-10 rounded-lg shadow-md" />
            <span className="font-semibold text-lg text-white">Enterprise Data Analytics Platform Support</span>
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
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
                  <Bell className="w-4 h-4" />
                  {notificationCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {notificationCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Recent Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length > 0 ? (
                  notifications.map((notification, idx) => (
                    <DropdownMenuItem key={idx} className="flex flex-col items-start py-3" data-testid={`notification-${idx}`}>
                      <div className="flex items-center gap-2 w-full">
                        <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {notification.run_name || `Job ${notification.job_id}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {notification.result_state} - {new Date(notification.period_end_time).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>
                    <span className="text-sm text-muted-foreground">No recent notifications</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
