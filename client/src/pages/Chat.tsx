import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Menu, LogOut } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Witaj. Jestem Stefan, Twój asystent prawny. Jak mogę Ci dzisiaj pomóc?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [, setLocation] = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (!email) {
      setLocation('/login');
      return;
    }
    setUserEmail(email);
  }, [setLocation]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newUserMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputValue("");

    // Simulate AI response
    setTimeout(() => {
      const botResponse: Message = {
        id: messages.length + 2,
        text: `Przyjąłem zgłoszenie dla konta: ${userEmail}. Analizuję zapytanie: "${newUserMessage.text}"... (To jest wersja demonstracyjna)`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    setLocation('/login');
  };

  return (
    <div className="flex h-screen flex-col bg-background text-foreground overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-secondary/5 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <header className="h-16 border-b border-white/10 bg-card/30 backdrop-blur-md flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 shadow-[0_0_15px_-5px_var(--primary)]">
            <img src="/icon-192.png" alt="Stefan" className="w-6 h-6 object-contain" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight glow-text">STEFAN</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">Online</span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout} className="hover:bg-white/5">
          <LogOut className="w-5 h-5 text-muted-foreground" />
        </Button>
      </header>

      {/* Chat Area */}
      <ScrollArea className="flex-1 p-4 z-10">
        <div className="max-w-3xl mx-auto space-y-6 pb-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.sender === 'user' 
                  ? 'bg-secondary/20 text-secondary border border-secondary/30' 
                  : 'bg-primary/20 text-primary border border-primary/30'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              
              <div className={`flex flex-col max-w-[80%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-3 rounded-2xl text-sm shadow-lg backdrop-blur-sm ${
                  msg.sender === 'user'
                    ? 'bg-secondary/10 border border-secondary/20 text-foreground rounded-tr-none'
                    : 'bg-card/60 border border-white/10 text-foreground rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 px-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 bg-card/30 backdrop-blur-md border-t border-white/10 z-20">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Napisz wiadomość do Stefana..."
              className="pr-12 bg-black/40 border-white/10 focus:border-primary/50 h-12 rounded-xl shadow-inner"
            />
            <Button 
              type="submit" 
              size="icon"
              className="absolute right-1 top-1 h-10 w-10 bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_-5px_var(--primary)] rounded-lg"
              disabled={!inputValue.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <div className="text-center mt-2">
            <p className="text-[10px] text-muted-foreground/50">
              Zalogowany jako: {userEmail} • Stefan AI może popełniać błędy. Sprawdź ważne informacje.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
