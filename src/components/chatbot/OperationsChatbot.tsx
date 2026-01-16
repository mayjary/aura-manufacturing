import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/ui/glass-card";
import { apiFetch } from "@/lib/api";
import { MessageCircle, X, Send } from "lucide-react";

export const OperationsChatbot = ({ projectId }: { projectId?: string }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, `You: ${input}`]);
    setLoading(true);

    try {
      const res = await apiFetch("/chatbot/chat", {
        method: "POST",
        body: JSON.stringify({ message: input, projectId }),
      });

      setMessages(prev => [
        ...prev,
        ...res.reply.map((r: string) => `Bot: ${r}`)
      ]);
    } catch {
      setMessages(prev => [...prev, "Bot: Failed to fetch insights"]);
    }

    setInput("");
    setLoading(false);
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-105 transition"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-6 right-6 w-96 z-50">
          <GlassCard className="flex flex-col h-[420px]">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-border">
              <div className="font-semibold">Operations Assistant</div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
              {messages.length === 0 && (
                <div className="text-muted-foreground">
                  Ask about production, quality, or inventory.
                </div>
              )}

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={
                    m.startsWith("You:")
                      ? "text-right text-foreground"
                      : "text-left text-muted-foreground"
                  }
                >
                  {m.replace(/^You: |^Bot: /, "")}
                </div>
              ))}

              {loading && (
                <div className="text-muted-foreground">
                  Bot is thinking...
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border flex gap-2">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask something..."
                onKeyDown={e => e.key === "Enter" && sendMessage()}
              />
              <Button onClick={sendMessage}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </GlassCard>
        </div>
      )}
    </>
  );
};
