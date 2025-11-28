import StefanLayout from "@/components/StefanLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { trpc } from "@/lib/trpc";
import { Loader2, Send, Trash2, Scale, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Streamdown } from "streamdown";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load chat history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("stefan_chat_history");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load chat history", e);
      }
    }
  }, []);

  // Save chat history to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("stefan_chat_history", JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessageMutation = trpc.chat.sendMessage.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setMessages(prev => [...prev, { role: "assistant", content: data.message }]);
      } else {
        toast.error("Błąd", { description: data.message });
      }
    },
    onError: (error) => {
      toast.error("Błąd połączenia", { description: error.message });
    },
  });

  const handleSend = () => {
    if (!input.trim() || sendMessageMutation.isPending) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);

    // Filter history to only include valid messages with role and content
    const validHistory = messages.filter(
      msg => msg.role && msg.content && (msg.role === "user" || msg.role === "assistant")
    );

    sendMessageMutation.mutate({
      message: userMessage,
      history: validHistory,
    });
  };

  const handleClear = () => {
    setMessages([]);
    localStorage.removeItem("stefan_chat_history");
    toast.success("Historia czatu została wyczyszczona");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <StefanLayout>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="border-b p-4 flex items-center justify-between bg-card">
          <div>
            <h1 className="text-2xl font-bold">Chat z Ekspertem</h1>
            <p className="text-sm text-muted-foreground">
              Zadaj pytanie prawne i otrzymaj natychmiastową odpowiedź
            </p>
          </div>
          {messages.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleClear}>
              <Trash2 className="w-4 h-4 mr-2" />
              Wyczyść
            </Button>
          )}
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4 bg-muted/20" ref={scrollRef}>
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 && (
              <Card className="bg-card border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-primary" />
                    Witaj w Czacie z Ekspertem!
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-muted-foreground">
                  <p>Jestem Stefan, Twój osobisty asystent prawny. Mogę pomóc Ci w:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Wyjaśnianiu przepisów prawnych</li>
                    <li>Interpretacji dokumentów</li>
                    <li>Udzielaniu porad w sprawach cywilnych i gospodarczych</li>
                    <li>Odpowiadaniu na pytania dotyczące prawa pracy</li>
                  </ul>
                  <p className="text-sm pt-2 font-semibold text-foreground">
                    Pamiętaj: Moje odpowiedzi nie zastępują profesjonalnej porady prawnej.
                  </p>
                </CardContent>
              </Card>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <Avatar className="w-8 h-8 mt-1 flex-shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <Scale className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-primary/90 text-primary-foreground shadow-sm"
                      : "bg-card border shadow-sm"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <p className="text-xs font-semibold text-primary mb-2">Stefan</p>
                  )}
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <Streamdown>{msg.content}</Streamdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                  )}
                </div>

                {msg.role === "user" && (
                  <Avatar className="w-8 h-8 mt-1 flex-shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {sendMessageMutation.isPending && (
              <div className="flex gap-3 justify-start">
                <Avatar className="w-8 h-8 mt-1 flex-shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <Scale className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-card border shadow-sm rounded-2xl px-4 py-3">
                  <p className="text-xs font-semibold text-primary mb-2">Stefan</p>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Piszę odpowiedź...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t p-4 bg-card">
          <div className="max-w-4xl mx-auto flex gap-2">
            <Input
              placeholder="Wpisz swoje pytanie prawne..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sendMessageMutation.isPending}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || sendMessageMutation.isPending}
              size="lg"
            >
              {sendMessageMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </StefanLayout>
  );
}
