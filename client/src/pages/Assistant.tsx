import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Sparkles, Code, AlertCircle, BarChart3, FileText, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your Azure Platform AI Assistant. I can help you with:\n\n• Generating ARM/Bicep templates\n• Analyzing cost and resource usage\n• Troubleshooting incidents\n• Creating automation scripts\n• Answering Azure-related questions\n\nHow can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const chatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const chatMessages = [
        { role: "system", content: "You are an expert Azure platform support assistant. Provide clear, actionable guidance for Azure infrastructure, DevOps, and cloud operations. Format code blocks with proper syntax highlighting." },
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: "user", content: userMessage }
      ];

      const response = await apiRequest("POST", "/api/ai/chat", { messages: chatMessages });
      return response.json().then((data: { response: string }) => data.response);
    },
    onSuccess: (aiResponse, userMessage) => {
      setMessages(prev => [
        ...prev,
        { role: "user", content: userMessage, timestamp: new Date() },
        { role: "assistant", content: aiResponse, timestamp: new Date() },
      ]);
      setInput("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatMutation.isPending) return;
    chatMutation.mutate(input);
  };

  const quickActions = [
    { icon: Code, label: "Generate ARM Template", prompt: "Generate an ARM template for a Linux VM with 2 vCPUs, 8GB RAM, and managed disk" },
    { icon: BarChart3, label: "Cost Analysis", prompt: "What are the top 5 ways to reduce Azure costs?" },
    { icon: AlertCircle, label: "Troubleshoot Issue", prompt: "How do I troubleshoot a failed Azure DevOps pipeline?" },
    { icon: FileText, label: "Create Runbook", prompt: "Create a runbook for scaling an AKS cluster" },
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">AI Assistant</h1>
          </div>
          <p className="text-muted-foreground">Your intelligent Azure platform copilot</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card className="shadow-sm h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle>Chat</CardTitle>
                  <Badge variant="default" className="gap-1">
                    <Sparkles className="h-3 w-3" />
                    GPT-4o-mini
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-4">
                    {messages.map((message, idx) => (
                      <div
                        key={idx}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-4 ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                          <div className="text-xs opacity-70 mt-2">
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                    {chatMutation.isPending && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-lg p-4">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      </div>
                    )}
                    <div ref={scrollRef} />
                  </div>
                </ScrollArea>
                <div className="border-t p-4">
                  <form onSubmit={handleSubmit} className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask me anything about Azure..."
                      disabled={chatMutation.isPending}
                      data-testid="input-ai-message"
                    />
                    <Button 
                      type="submit" 
                      size="icon" 
                      disabled={!input.trim() || chatMutation.isPending}
                      data-testid="button-send-message"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickActions.map((action, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => setInput(action.prompt)}
                    data-testid={`button-quick-${action.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <action.icon className="h-4 w-4" />
                    <span className="text-sm">{action.label}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Commands</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2 text-muted-foreground">
                  <p>• "Generate [resource] template"</p>
                  <p>• "Explain [Azure service]"</p>
                  <p>• "How to [task]?"</p>
                  <p>• "Troubleshoot [issue]"</p>
                  <p>• "Cost optimization tips"</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
