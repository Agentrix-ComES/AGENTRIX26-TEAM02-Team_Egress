import { useState } from "react";
import { MessageCircle, Phone, Send, Video } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BotMsg {
  id: string;
  from: "me" | "bot";
  text: string;
  time: string;
}

const initial: BotMsg[] = [
  { id: "1", from: "bot", text: "Hello! I'm watching your trip 'Sri Lanka Heritage & Hills'. How can I help?", time: "08:14" },
  { id: "2", from: "me", text: "Train running late?", time: "13:42" },
  {
    id: "3",
    from: "bot",
    text: "Yes — ~25 min delay near Rambukkana. I've pushed the Temple of the Tooth to the 17:30 puja and dropped the tea tasting. Want me to apply?",
    time: "13:43",
  },
];

export function BotPreviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Bot preview</h1>
        <p className="text-muted-foreground">
          Travelers can also reach Egress through WhatsApp and Telegram — same orchestrator,
          different surface.
        </p>
      </div>

      <Tabs defaultValue="whatsapp">
        <TabsList>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="telegram">Telegram</TabsTrigger>
        </TabsList>
        <TabsContent value="whatsapp">
          <div className="grid gap-4 lg:grid-cols-[420px_1fr]">
            <PhoneFrame variant="whatsapp" />
            <Card>
              <CardHeader>
                <CardTitle>WhatsApp Business integration</CardTitle>
                <CardDescription>Egress sits behind the platform's WhatsApp Business number.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Row k="Webhook" v="/api/messaging/whatsapp" />
                <Row k="Templates" v="trip-confirmation, disruption-alert, recovery-options" />
                <Row k="Locale" v="en-LK / si-LK / ta-LK" />
                <Row k="Status" v={<Badge variant="success">Connected</Badge>} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="telegram">
          <div className="grid gap-4 lg:grid-cols-[420px_1fr]">
            <PhoneFrame variant="telegram" />
            <Card>
              <CardHeader>
                <CardTitle>Telegram bot integration</CardTitle>
                <CardDescription>@egress_travel_bot — backed by the same orchestrator.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Row k="Webhook" v="/api/messaging/telegram" />
                <Row k="Inline keyboard" v="apply / postpone / decline" />
                <Row k="Locale" v="auto via Accept-Language" />
                <Row k="Status" v={<Badge variant="success">Connected</Badge>} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 border-b pb-2 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}

function PhoneFrame({ variant }: { variant: "whatsapp" | "telegram" }) {
  const [msgs, setMsgs] = useState<BotMsg[]>(initial);
  const [text, setText] = useState("");
  const send = () => {
    if (!text.trim()) return;
    setMsgs([...msgs, { id: String(msgs.length + 1), from: "me", text, time: "now" }]);
    setText("");
  };
  const headerBg = variant === "whatsapp" ? "bg-emerald-600" : "bg-sky-600";
  return (
    <div className="rounded-[2.5rem] border bg-card shadow-xl overflow-hidden mx-auto w-full max-w-[400px]">
      <div className={cn("text-white px-4 py-3 flex items-center gap-3", headerBg)}>
        <div className="h-9 w-9 rounded-full bg-white/20 grid place-items-center">
          <MessageCircle className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="font-medium text-sm">Egress Travel</div>
          <div className="text-[10px] opacity-80">online · 4 agents</div>
        </div>
        <Video className="h-4 w-4 opacity-80" />
        <Phone className="h-4 w-4 opacity-80" />
      </div>
      <div className="h-[420px] overflow-y-auto p-3 bg-muted/40 space-y-2">
        {msgs.map((m) => (
          <div
            key={m.id}
            className={cn(
              "max-w-[78%] rounded-2xl px-3 py-2 text-sm",
              m.from === "me"
                ? "ml-auto bg-primary text-primary-foreground rounded-tr-sm"
                : "bg-background border rounded-tl-sm",
            )}
          >
            <div>{m.text}</div>
            <div className="text-[10px] opacity-70 mt-1 text-right">{m.time}</div>
          </div>
        ))}
      </div>
      <div className="border-t p-2 flex gap-2 bg-background">
        <Input
          placeholder="Message"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <Button size="icon" onClick={send}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
