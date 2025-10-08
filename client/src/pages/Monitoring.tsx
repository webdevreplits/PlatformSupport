import { DashboardHeader } from "@/components/DashboardHeader";
import { GlassmorphicCard } from "@/components/GlassmorphicCard";
import { CircularProgress } from "@/components/CircularProgress";
import { MiniAreaChart } from "@/components/MiniAreaChart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Monitoring() {
  const [isDark, setIsDark] = useState(true);

  const handleThemeToggle = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  //todo: remove mock functionality
  const chartData1 = [30, 50, 40, 65, 55, 75, 70, 85];
  const chartData2 = [45, 40, 55, 50, 70, 60, 80, 75];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(235,50%,9%)] via-[hsl(240,45%,11%)] to-[hsl(250,40%,12%)]">
      <DashboardHeader onThemeToggle={handleThemeToggle} isDark={isDark} />

      <main className="container mx-auto px-4 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Workspace Monitoring</h1>
            <p className="text-muted-foreground">Real-time system performance and analytics</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" data-testid="button-citiire">Citiire</Button>
            <Button variant="outline" data-testid="button-status">Status</Button>
            <Button variant="outline" data-testid="button-flamine">Flamine</Button>
            <Button variant="default" data-testid="button-acknowliege">Acknowliege . Opel</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <GlassmorphicCard gradient="blue" className="p-6">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-foreground/70 mb-1">Aconrspace</h3>
              <p className="text-lg font-semibold">Job SiuXos Anline</p>
              <p className="text-xs text-muted-foreground">Rumilend • r.oom</p>
            </div>
            <Badge variant="outline" className="mb-4" data-testid="badge-dalse">Dalse</Badge>
            <div className="h-24 -mx-2 mb-4">
              <MiniAreaChart data={chartData1} color="stroke-white fill-white" />
            </div>
            <GlassmorphicCard gradient="light" className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">1.5. 29.22.</span>
                <span className="text-xs text-muted-foreground">100 . 46.</span>
              </div>
            </GlassmorphicCard>
            <div className="text-xs text-muted-foreground mt-3">
              <div>Id</div>
              <div>29565</div>
            </div>
          </GlassmorphicCard>

          <GlassmorphicCard gradient="light" className="p-6">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-foreground/70 mb-1">Workspace</h3>
              <p className="text-lg font-semibold">Job Smice Ivlnine</p>
              <p className="text-xs text-muted-foreground">Rumilend • r.oom</p>
            </div>
            <Badge className="mb-4 bg-chart-2/20 text-chart-2" data-testid="badge-datus">Datus</Badge>
            <div className="flex items-center justify-center my-6">
              <CircularProgress 
                value={10.9} 
                max={20} 
                size={120} 
                color="stroke-chart-1"
                showValue={true}
              />
            </div>
            <div className="text-xs text-muted-foreground text-center mb-3">Rumtime . Cmetty</div>
            <div className="flex gap-1 justify-center">
              {[1, 2, 3, 4, 5].map((i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-8 h-8 rounded",
                    i === 5 ? "bg-primary" : "bg-white/10"
                  )}
                />
              ))}
            </div>
          </GlassmorphicCard>

          <GlassmorphicCard gradient="mint" className="p-6">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-foreground/70 mb-1">Workspace</h3>
              <p className="text-lg font-semibold">Job Slicces Nmine</p>
              <p className="text-xs text-muted-foreground">Rumilened • r.oom</p>
            </div>
            <Badge variant="outline" className="mb-4" data-testid="badge-dalse-2">Dalse</Badge>
            <div className="h-24 -mx-2 mb-4">
              <MiniAreaChart data={chartData2} color="stroke-white fill-white" />
            </div>
            <GlassmorphicCard gradient="light" className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">1.5. 26.22.</span>
                <span className="text-xs text-muted-foreground">000. 44.</span>
              </div>
            </GlassmorphicCard>
            <div className="text-xs text-muted-foreground mt-3">
              <div>Id</div>
              <div>29940</div>
            </div>
          </GlassmorphicCard>

          <GlassmorphicCard gradient="light" className="p-6">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-foreground/70 mb-1">Workspace</h3>
              <p className="text-lg font-semibold">Job Sinces Nmine</p>
              <p className="text-xs text-muted-foreground">Rumilend • r.oom</p>
            </div>
            <Badge className="mb-4 bg-chart-3/20 text-chart-3" data-testid="badge-dulon">Dulon</Badge>
            <div className="flex items-center justify-center my-6">
              <CircularProgress 
                value={10.9} 
                max={20} 
                size={120} 
                color="stroke-chart-3"
                showValue={true}
              />
            </div>
            <div className="text-xs text-muted-foreground text-center mb-3">Successes Rely</div>
            <div className="flex gap-1 justify-center">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-8 h-8 rounded",
                    i === 3 ? "bg-primary" : "bg-white/10"
                  )}
                />
              ))}
              <div className="w-2 h-8 rounded bg-white/20" />
            </div>
          </GlassmorphicCard>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <GlassmorphicCard gradient="light" className="p-6">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-foreground/70 mb-1">Workspace</h3>
              <p className="text-lg font-semibold">JOOB Inses Anline</p>
              <p className="text-xs text-muted-foreground">Rumilend • r.oom</p>
            </div>
            <Badge className="bg-chart-2/20 text-chart-2" data-testid="badge-ccto">Ccto</Badge>
          </GlassmorphicCard>

          <GlassmorphicCard gradient="light" className="p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="text-sm font-medium text-foreground/70 mb-2">+ Xllatcus</div>
              <div className="text-xs text-muted-foreground mb-4">Sluge .Gct Riety</div>
              <Button className="w-full" data-testid="button-pipen">Pipen</Button>
            </div>
          </GlassmorphicCard>

          <GlassmorphicCard gradient="dark" className="p-6">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-foreground/70 mb-1">Workspace</h3>
              <p className="text-lg font-semibold">Job Slicces Nmine</p>
              <p className="text-xs text-muted-foreground">Rumilned • • .com</p>
            </div>
            <Badge variant="outline" className="mb-4" data-testid="badge-eacte">Eacte</Badge>
            <div className="flex items-center justify-center my-4">
              <CircularProgress 
                value={75} 
                max={100} 
                size={100} 
                color="stroke-chart-1"
                showValue={false}
              />
            </div>
          </GlassmorphicCard>

          <GlassmorphicCard gradient="light" className="p-6">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-foreground/70 mb-1">Worinspace</h3>
              <p className="text-lg font-semibold">2OOB Inese Anliine</p>
              <p className="text-xs text-muted-foreground">Irmilned • r.oom</p>
            </div>
            <Badge className="bg-chart-2/20 text-chart-2" data-testid="badge-open">Open</Badge>
          </GlassmorphicCard>
        </div>
      </main>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
