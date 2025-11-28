import StefanLayout from "@/components/StefanLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { Loader2, Send, Trash2 } from "lucide-react";
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
        <div className="border-b p-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Chat z Ekspertem</h1>
            <p className="text-sm text-muted-foreground">
              Zadaj pytanie prawne i otrzymaj natychmiastową odpowiedź
            </p>
          </div>
          {messages.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleClear}>
              <Trash2 className="w-4 h-4 mr-2" />
              Wyczyść historię
            </Button>
          )}
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.length === 0 && (
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle>Witaj w Czacie z Ekspertem!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-muted-foreground">
                  <p>Jestem Stefan, Twój osobisty asystent prawny. Mogę pomóc Ci w:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Wyjaśnianiu przepisów prawnych</li>
                    <li>Interpretacji dokumentów</li>
                    <li>Udzielaniu porad w sprawach cywilnych i gospodarczych</li>
                    <li>Odpowiadaniu na pytania dotyczące prawa pracy</li>
                  </ul>
                  <p className="text-sm pt-2">
                    <strong>Pamiętaj:</strong> Moje odpowiedzi nie zastępują profesjonalnej porady prawnej.
                  </p>
                </CardContent>
              </Card>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <Card
                  className={`max-w-[80%] ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card"
                  }`}
                >
                  <CardContent className="p-4">
                    {msg.role === "assistant" ? (
                      <Streamdown>{msg.content}</Streamdown>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}

            {sendMessageMutation.isPending && (
              <div className="flex justify-start">
                <Card className="bg-card">
                  <CardContent className="p-4 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-muted-foreground">Stefan pisze...</span>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t p-4">
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
            >
              {sendMessageMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Wyślij
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </StefanLayout>
  );
}
