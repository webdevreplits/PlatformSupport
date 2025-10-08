import { DashboardHeader } from "@/components/DashboardHeader";
import { GlassmorphicCard } from "@/components/GlassmorphicCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function Settings() {
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
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <div className="max-w-2xl">
          <GlassmorphicCard gradient="light" className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  defaultValue="admin@azure.com" 
                  className="bg-white/5 border-white/10"
                  data-testid="input-username"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  defaultValue="admin@azure.com" 
                  className="bg-white/5 border-white/10"
                  data-testid="input-email"
                />
              </div>
              <Button data-testid="button-save-account">Save Changes</Button>
            </div>
          </GlassmorphicCard>

          <GlassmorphicCard gradient="light" className="p-6">
            <h2 className="text-xl font-semibold mb-4">Preferences</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="language">Language</Label>
                <Input 
                  id="language" 
                  defaultValue="English" 
                  className="bg-white/5 border-white/10"
                  data-testid="input-language"
                />
              </div>
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Input 
                  id="timezone" 
                  defaultValue="UTC-8 (Pacific Time)" 
                  className="bg-white/5 border-white/10"
                  data-testid="input-timezone"
                />
              </div>
              <Button data-testid="button-save-preferences">Save Preferences</Button>
            </div>
          </GlassmorphicCard>
        </div>
      </main>
    </div>
  );
}
