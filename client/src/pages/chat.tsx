import { useEffect, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { mockChat, mockTrip } from "@/data/mock";
import type { ChatMessage } from "@/types/trip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const agentMeta: Record<string, { color: string; label: string }> = {
  orchestrator: { color: "bg-primary/15 text-primary", label: "Orchestrator" },
  planner: { color: "bg-emerald-500/15 text-emerald-600", label: "Planner" },
  logistics: { color: "bg-sky-500/15 text-sky-600", label: "Logistics" },
  disruption: { color: "bg-rose-500/15 text-rose-600", label: "Disruption" },
  culture: { color: "bg-amber-500/15 text-amber-600", label: "Culture" },
};

export function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(mockChat);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const id = `m${messages.length + 1}`;
    setMessages([
      ...messages,
      { id, role: "user", content: input, timestamp: new Date().toISOString() },
    ]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          id: `m${m.length + 1}`,
          role: "agent",
          agent: "orchestrator",
          content:
            "Got it. Resolving active node and routing to relevant agents…",
          timestamp: new Date().toISOString(),
        },
      ]);
    }, 500);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px] h-[calc(100vh-9rem)]">
      <Card className="flex flex-col overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> Trip assistant
              </CardTitle>
              <CardDescription>
                Context: {mockTrip.title} · active node n3 (Train → Kandy)
              </CardDescription>
            </div>
            <Badge variant="success">4 agents online</Badge>
          </div>
        </CardHeader>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => (
            <MessageBubble key={m.id} m={m} />
          ))}
        </div>
        <form onSubmit={send} className="border-t p-3 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about delays, recovery, culture, food…"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </Card>

      <aside className="space-y-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active context</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <Row k="Trip" v={mockTrip.title} />
            <Row k="Day" v="Mon, Jul 13" />
            <Row k="Active node" v="Train CMB→Kandy (n3)" />
            <Row k="Next node" v="Temple of the Tooth (n4)" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Suggestions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Suggest text="Move temple to 17:30 puja slot" />
            <Suggest text="Find vegetarian dinner near Kandy lake" />
            <Suggest text="What should I wear at the temple?" />
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium text-right">{v}</span>
    </div>
  );
}

function Suggest({ text }: { text: string }) {
  return (
    <button className="w-full text-left rounded-md border px-3 py-2 hover:bg-accent transition-colors">
      {text}
    </button>
  );
}

function MessageBubble({ m }: { m: ChatMessage }) {
  const isUser = m.role === "user";
  const meta = m.agent ? agentMeta[m.agent] : null;
  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <Avatar className="h-8 w-8">
        <AvatarFallback className={cn("text-xs", meta?.color ?? "bg-secondary")}>
          {isUser ? "U" : (meta?.label[0] ?? "A")}
        </AvatarFallback>
      </Avatar>
      <div className={cn("max-w-[75%] space-y-1", isUser && "items-end flex flex-col")}>
        {meta && (
          <Badge variant="outline" className="text-[10px]">
            {meta.label} agent
          </Badge>
        )}
        <div
          className={cn(
            "rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-muted rounded-tl-sm",
          )}
        >
          {m.content}
        </div>
      </div>
    </div>
  );
}
