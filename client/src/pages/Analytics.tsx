import { DashboardHeader } from "@/components/DashboardHeader";
import { GlassmorphicCard } from "@/components/GlassmorphicCard";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Users, DollarSign } from "lucide-react";
import { useState } from "react";

export default function Analytics() {
  const [isDark, setIsDark] = useState(true);

  const handleThemeToggle = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(235,50%,9%)] via-[hsl(240,45%,11%)] to-[hsl(250,40%,12%)]">
      <DashboardHeader onThemeToggle={handleThemeToggle} isDark={isDark} />

      <main className="container mx-auto px-4 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Performance metrics and insights</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <GlassmorphicCard gradient="blue" className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold font-mono mt-2">24,567</p>
              </div>
              <Users className="w-8 h-8 text-chart-1" />
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-chart-2" />
              <span className="text-sm text-chart-2">+12.5%</span>
            </div>
          </GlassmorphicCard>

          <GlassmorphicCard gradient="mint" className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-3xl font-bold font-mono mt-2">$89.2K</p>
              </div>
              <DollarSign className="w-8 h-8 text-chart-2" />
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-chart-2" />
              <span className="text-sm text-chart-2">+8.3%</span>
            </div>
          </GlassmorphicCard>

          <GlassmorphicCard gradient="coral" className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Active Sessions</p>
                <p className="text-3xl font-bold font-mono mt-2">1,842</p>
              </div>
              <TrendingUp className="w-8 h-8 text-chart-3" />
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-chart-3" />
              <span className="text-sm text-chart-3">-3.2%</span>
            </div>
          </GlassmorphicCard>

          <GlassmorphicCard gradient="purple" className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Conversion</p>
                <p className="text-3xl font-bold font-mono mt-2">4.2%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-chart-4" />
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-chart-2" />
              <span className="text-sm text-chart-2">+1.8%</span>
            </div>
          </GlassmorphicCard>
        </div>

        <div className="mt-8 flex justify-center">
          <Button variant="outline" size="lg" data-testid="button-view-details">
            View Detailed Analytics
          </Button>
        </div>
      </main>
    </div>
  );
}
