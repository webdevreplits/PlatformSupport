import { useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { MetricCard } from "@/components/MetricCard";
import { GlassmorphicCard } from "@/components/GlassmorphicCard";
import { PhoneMockup } from "@/components/PhoneMockup";
import { CircularProgress } from "@/components/CircularProgress";
import { MiniAreaChart } from "@/components/MiniAreaChart";
import { StatusToggle } from "@/components/StatusToggle";
import { Activity, Users, TrendingUp, DollarSign, AlertCircle, CheckCircle2 } from "lucide-react";

export default function Dashboard() {
  const [isDark, setIsDark] = useState(true);
  const [toggles, setToggles] = useState({
    policy1: true,
    policy2: true,
  });

  //todo: remove mock functionality
  const chartData = [30, 45, 35, 60, 55, 70, 65, 80, 75, 90];

  const handleToggle = (key: keyof typeof toggles) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
    console.log(`Toggle ${key} changed to ${!toggles[key]}`);
  };

  const handleThemeToggle = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
    console.log("Theme toggled to", !isDark ? "dark" : "light");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(235,50%,9%)] via-[hsl(240,45%,11%)] to-[hsl(250,40%,12%)]">
      <DashboardHeader onThemeToggle={handleThemeToggle} isDark={isDark} />

      <main className="container mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <PhoneMockup>
              <div className="p-4 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs text-white/70">09:41</div>
                  <div className="flex gap-1">
                    <div className="w-4 h-3 border border-white/30 rounded-sm" />
                    <div className="w-1 h-3 bg-white/30 rounded-sm" />
                  </div>
                </div>

                <div className="text-xs text-white/70 mb-2">ACUM'ISO FIatFORN1 EATIO ONCO</div>
                
                <GlassmorphicCard gradient="blue" className="p-4 mb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-white/70">Nimetie</div>
                      <div className="text-sm font-semibold">Sapus.Cloam</div>
                    </div>
                    <div className="text-lg font-bold">$1190</div>
                  </div>
                </GlassmorphicCard>

                <GlassmorphicCard gradient="light" className="p-3 mb-3">
                  <div className="text-xs text-white/70">Ctanda Reminio</div>
                  <div className="flex gap-2 mt-2">
                    <div className="flex-1 bg-white/10 rounded-lg p-2 text-xs text-center">Migratilor</div>
                    <div className="flex-1 bg-white/10 rounded-lg p-2 text-xs text-center">Placet</div>
                  </div>
                </GlassmorphicCard>

                <GlassmorphicCard gradient="light" className="p-3 flex-1">
                  <div className="text-xs text-white/70 mb-2">Estancia Ons. Tera/Bls/Statio</div>
                  <div className="flex gap-2 items-center justify-center h-12">
                    <div className="w-8 h-8 rounded-full bg-chart-2" />
                    <div className="w-8 h-8 rounded-full bg-chart-1" />
                    <div className="w-8 h-8 rounded-full bg-chart-3" />
                  </div>
                </GlassmorphicCard>
              </div>
            </PhoneMockup>
          </div>

          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <MetricCard
                title="Incleberes Jlobs"
                value="13,820,604"
                subtitle="Eveo.Remijo"
                gradient="dark"
                badge={{ text: "452 E.N.D", variant: "default" }}
                actionButton={{ text: "Al.Allegr", onClick: () => console.log("View details") }}
                trend={{ value: "01", isPositive: true }}
              />
              <MetricCard
                title="Incidenties"
                value="011,672,904"
                subtitle="Eveo.Clnse.U Incluses"
                gradient="blue"
                badge={{ text: "725", variant: "success" }}
                actionButton={{ text: "Al.Clew", onClick: () => console.log("View incidents") }}
                trend={{ value: "01", isPositive: true }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <GlassmorphicCard gradient="light" className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-medium text-foreground/70">Coplexe Halts</h3>
                    <p className="text-3xl font-bold font-mono mt-2">076,391%</p>
                  </div>
                  <AlertCircle className="w-5 h-5 text-chart-3" />
                </div>
                <div className="text-xs text-muted-foreground mb-2">Daes.R Alo</div>
                <button className="w-full px-3 py-1.5 rounded-lg bg-white/10 text-sm font-medium hover-elevate active-elevate-2" data-testid="button-ban-face">
                  Ban face
                </button>
              </GlassmorphicCard>

              <GlassmorphicCard gradient="blue" className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-medium text-foreground/70">Search Health</h3>
                  </div>
                  <Activity className="w-5 h-5 text-chart-1" />
                </div>
                <div className="h-20 -mx-2">
                  <MiniAreaChart data={chartData} color="stroke-chart-1 fill-chart-1" />
                </div>
              </GlassmorphicCard>

              <MetricCard
                title="Recopliclineel"
                value="10+680.00"
                subtitle="Benol.Bro.Prosentir"
                gradient="mint"
                badge={{ text: "280,2120" }}
                actionButton={{ text: "Bt.Contiger", onClick: () => console.log("Configure") }}
                icon={CheckCircle2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <GlassmorphicCard gradient="mint" className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-foreground/70">Resonlianel</h3>
                    <p className="text-2xl font-bold font-mono mt-2">08,208,001</p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-chart-2" />
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Placs 941</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>4,107,920</span>
                    <button className="ml-auto px-2 py-1 rounded bg-white/10 hover-elevate text-xs" data-testid="button-cb-bam">
                      CB Bam
                    </button>
                  </div>
                </div>
              </GlassmorphicCard>

              <GlassmorphicCard gradient="purple" className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-foreground/70">Compliancce</h3>
                    <p className="text-2xl font-bold font-mono mt-2">001.44</p>
                  </div>
                  <Users className="w-5 h-5 text-chart-4" />
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Base.R.610</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>580,5,1300</span>
                    <button className="ml-auto px-2 py-1 rounded bg-white/10 hover-elevate text-xs" data-testid="button-chba-bee">
                      Chba.bee
                    </button>
                  </div>
                </div>
              </GlassmorphicCard>

              <GlassmorphicCard gradient="dark" className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-foreground/70">Resourmce</h3>
                    <p className="text-2xl font-bold font-mono mt-2">008,C39,00</p>
                  </div>
                  <DollarSign className="w-5 h-5 text-chart-5" />
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Beneft_810</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>400,120</span>
                    <button className="ml-auto px-2 py-1 rounded bg-white/10 hover-elevate text-xs" data-testid="button-bao-elarm">
                      Bao.Elarm
                    </button>
                  </div>
                </div>
              </GlassmorphicCard>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <GlassmorphicCard gradient="coral" className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-foreground/70">Policane Drift</h3>
                    <p className="text-sm text-muted-foreground mt-1">Bienusectleg.heis.Pesch.Part.treple</p>
                  </div>
                </div>
                <StatusToggle
                  enabled={toggles.policy1}
                  onToggle={() => handleToggle("policy1")}
                  label="Enable Policy"
                />
                <div className="mt-4 flex items-center gap-3">
                  <CircularProgress value={19} max={50} size={80} color="stroke-chart-3" />
                  <div>
                    <div className="text-sm font-medium">5,010,010</div>
                    <div className="text-xs text-muted-foreground">Current usage</div>
                  </div>
                </div>
              </GlassmorphicCard>

              <GlassmorphicCard gradient="light" className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-foreground/70">Policyan Drift</h3>
                    <p className="text-sm text-muted-foreground mt-1">Bireinecetleg.fush.Proolt.Pert.Implie</p>
                  </div>
                </div>
                <StatusToggle
                  enabled={toggles.policy2}
                  onToggle={() => handleToggle("policy2")}
                  label="Enable Monitor"
                />
                <div className="mt-4 flex items-center gap-3">
                  <CircularProgress value={13} max={30} size={80} color="stroke-chart-1" />
                  <div>
                    <div className="text-sm font-medium">100,00110</div>
                    <div className="text-xs text-muted-foreground">Monitoring active</div>
                  </div>
                </div>
              </GlassmorphicCard>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
