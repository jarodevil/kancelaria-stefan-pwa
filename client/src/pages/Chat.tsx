import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, History, LogOut, Square } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";

declare global {
  interface Window {
    hasRetried?: boolean;
  }
}

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function Chat() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    setUserEmail(email);
  }, []);

  const getStorageKey = (email: string | null) => `stefan_chat_history_${email || 'guest'}`;

  const [messages, setMessages] = useState<Message[]>([]);

  // Load messages once email is determined
  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    const key = getStorageKey(email);
    const saved = localStorage.getItem(key);
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved).map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
        setMessages(parsed);
      } catch (e) {
        console.error("Failed to parse chat history", e);
        setMessages([{
          id: 1,
          text: "Dzień dobry. Jestem Stefan, Starszy Partner. W czym mogę pomóc? Proszę przedstawić problem w sposób zwięzły i rzeczowy.",
          sender: 'bot',
          timestamp: new Date()
        }]);
      }
    } else {
      setMessages([{
        id: 1,
        text: "Dzień dobry. Jestem Stefan, Starszy Partner. W czym mogę pomóc? Proszę przedstawić problem w sposób zwięzły i rzeczowy.",
        sender: 'bot',
        timestamp: new Date()
      }]);
    }
  }, []);

  // Save messages whenever they change
  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    const key = getStorageKey(email);
    if (messages.length > 0) {
      localStorage.setItem(key, JSON.stringify(messages));
    }
  }, [messages]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      toast.info("Generowanie zatrzymane.");
    }
  };

  const handleLogout = () => {
    // We do NOT clear history on logout, so it persists for the user
    // localStorage.removeItem(getStorageKey(userEmail)); 
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPassword');
    setLocation('/');
    toast.success("Wylogowano pomyślnie");
  };

  const handleHistoryClick = () => {
    toast.info("Historia rozmów jest zapisywana lokalnie w Twojej przeglądarce.");
  };

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

    // Call Backend API
    setIsLoading(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: inputValue,
        history: messages // Send full history for context
      }),
      signal: controller.signal
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        throw new Error(data.error);
      }
      const botResponse: Message = {
        id: Date.now(),
        text: data.text || "Przepraszam, wystąpił błąd połączenia z systemem.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    })
    .catch(err => {
      if (err.name === 'AbortError') {
        console.log('Fetch aborted');
        return;
      }
      console.error("Chat Error:", err);
      
      let errorMessage = "Przepraszam, wystąpił nieoczekiwany błąd. Spróbuj ponownie.";
      
      if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
        // Auto-retry logic (Simple 1-time retry)
        if (!window.hasRetried) {
           window.hasRetried = true;
           console.log("Retrying connection in 3s...");
           toast.loading("Słabe połączenie. Ponawiam próbę...");
           
           setTimeout(() => {
             handleSendMessage(e); // Retry the same event
           }, 3000);
           return;
        }
        errorMessage = "Błąd połączenia. Sprawdź internet i spróbuj ponownie.";
      } else if (err.message.includes("500")) {
        errorMessage = "Serwer jest chwilowo niedostępny. Spróbuj za chwilę.";
      }

      window.hasRetried = false; // Reset retry flag after failure
      const errorResponse: Message = {
        id: Date.now(),
        text: errorMessage,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
      toast.error("Wystąpił błąd komunikacji");
    })
    .finally(() => {
      setIsLoading(false);
      abortControllerRef.current = null;
    });
  };

  return (
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col relative">
        {/* Top Bar */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card/50 backdrop-blur-sm">
          <div>
            <h1 className="text-lg font-medium text-foreground">Chat z Ekspertem</h1>
            <p className="text-xs text-muted-foreground">Stefan - Starszy Partner (v1.5)</p>
          </div>
          
            <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleHistoryClick}
              className="text-muted-foreground hover:text-foreground gap-2 border border-border h-8"
            >
              <History className="w-3 h-3" />
              Historia
            </Button>
            
            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-medium text-green-500 tracking-wide">ONLINE</span>
            </div>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive h-8 w-8 ml-2"
              title="Wyloguj się"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Chat Area */}
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-3xl mx-auto space-y-8">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                    : 'bg-card border border-border text-card-foreground rounded-tl-sm shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-6 bg-background border-t border-border">
          <div className="max-w-3xl mx-auto relative">
            <form onSubmit={handleSendMessage}>
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Wpisz wiadomość..."
                className="w-full bg-input/50 border border-input rounded-xl py-4 pl-5 pr-14 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
              {isLoading ? (
                <Button 
                  type="button"
                  size="icon"
                  onClick={handleStopGeneration}
                  className="absolute right-2 top-2 h-10 w-10 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors animate-pulse"
                  title="Zatrzymaj generowanie"
                >
                  <Square className="w-4 h-4 fill-current" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  size="icon"
                  className="absolute right-2 top-2 h-10 w-10 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors"
                  disabled={!inputValue.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              )}
            </form>
            <p className="text-center text-[10px] text-gray-600 mt-3">
              Analiza nie stanowi porady prawnej. W sprawach wymagających wiążącej opinii skonsultuj się z uprawnionym doradcą.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
