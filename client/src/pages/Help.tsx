import { DashboardHeader } from "@/components/DashboardHeader";
import { GlassmorphicCard } from "@/components/GlassmorphicCard";
import { Button } from "@/components/ui/button";
import { HelpCircle, Book, MessageCircle, Mail } from "lucide-react";
import { useState } from "react";

export default function Help() {
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
          <h1 className="text-3xl font-bold mb-2">Help & Support</h1>
          <p className="text-muted-foreground">Get assistance and learn more</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          <GlassmorphicCard gradient="blue" className="p-6">
            <HelpCircle className="w-12 h-12 text-chart-1 mb-4" />
            <h3 className="text-xl font-semibold mb-2">FAQ</h3>
            <p className="text-muted-foreground mb-4">Find answers to common questions</p>
            <Button variant="outline" className="w-full" data-testid="button-view-faq">View FAQ</Button>
          </GlassmorphicCard>

          <GlassmorphicCard gradient="mint" className="p-6">
            <Book className="w-12 h-12 text-chart-2 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Documentation</h3>
            <p className="text-muted-foreground mb-4">Comprehensive guides and tutorials</p>
            <Button variant="outline" className="w-full" data-testid="button-view-docs">View Docs</Button>
          </GlassmorphicCard>

          <GlassmorphicCard gradient="coral" className="p-6">
            <MessageCircle className="w-12 h-12 text-chart-3 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Live Chat</h3>
            <p className="text-muted-foreground mb-4">Chat with our support team</p>
            <Button variant="outline" className="w-full" data-testid="button-start-chat">Start Chat</Button>
          </GlassmorphicCard>

          <GlassmorphicCard gradient="purple" className="p-6">
            <Mail className="w-12 h-12 text-chart-4 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Email Support</h3>
            <p className="text-muted-foreground mb-4">Send us a detailed message</p>
            <Button variant="outline" className="w-full" data-testid="button-send-email">Send Email</Button>
          </GlassmorphicCard>
        </div>
      </main>
    </div>
  );
}
