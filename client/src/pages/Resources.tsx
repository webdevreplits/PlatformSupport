import { DashboardHeader } from "@/components/DashboardHeader";
import { GlassmorphicCard } from "@/components/GlassmorphicCard";
import { Button } from "@/components/ui/button";
import { Server, Database, HardDrive, Cpu } from "lucide-react";
import { useState } from "react";

export default function Resources() {
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
          <h1 className="text-3xl font-bold mb-2">Resources</h1>
          <p className="text-muted-foreground">System resources and infrastructure</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassmorphicCard gradient="blue" className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Servers</h3>
                <p className="text-3xl font-bold font-mono">24</p>
                <p className="text-sm text-muted-foreground mt-1">Active instances</p>
              </div>
              <Server className="w-10 h-10 text-chart-1" />
            </div>
            <Button className="w-full" data-testid="button-manage-servers">Manage Servers</Button>
          </GlassmorphicCard>

          <GlassmorphicCard gradient="mint" className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Databases</h3>
                <p className="text-3xl font-bold font-mono">8</p>
                <p className="text-sm text-muted-foreground mt-1">Connected databases</p>
              </div>
              <Database className="w-10 h-10 text-chart-2" />
            </div>
            <Button className="w-full" data-testid="button-manage-databases">Manage Databases</Button>
          </GlassmorphicCard>

          <GlassmorphicCard gradient="coral" className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Storage</h3>
                <p className="text-3xl font-bold font-mono">2.4TB</p>
                <p className="text-sm text-muted-foreground mt-1">Total capacity used</p>
              </div>
              <HardDrive className="w-10 h-10 text-chart-3" />
            </div>
            <Button className="w-full" data-testid="button-manage-storage">Manage Storage</Button>
          </GlassmorphicCard>

          <GlassmorphicCard gradient="purple" className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">CPU Usage</h3>
                <p className="text-3xl font-bold font-mono">68%</p>
                <p className="text-sm text-muted-foreground mt-1">Average utilization</p>
              </div>
              <Cpu className="w-10 h-10 text-chart-4" />
            </div>
            <Button className="w-full" data-testid="button-view-metrics">View Metrics</Button>
          </GlassmorphicCard>
        </div>
      </main>
    </div>
  );
}
