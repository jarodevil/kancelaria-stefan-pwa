import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, History, MoreVertical } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('stefan_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved).map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
      } catch (e) {
        console.error("Failed to parse chat history", e);
      }
    }
    return [{
      id: 1,
      text: "Dzień dobry. Jestem Stefan, Starszy Partner. W czym mogę pomóc? Proszę przedstawić problem w sposób zwięzły i rzeczowy.",
      sender: 'bot',
      timestamp: new Date()
    }];
  });

  useEffect(() => {
    localStorage.setItem('stefan_chat_history', JSON.stringify(messages));
  }, [messages]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
    
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: inputValue,
        history: messages // Send full history for context
      })
    })
    .then(res => res.json())
    .then(data => {
      const botResponse: Message = {
        id: Date.now(),
        text: data.text || "Przepraszam, wystąpił błąd połączenia z systemem.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    })
    .catch(err => {
      console.error(err);
      const errorResponse: Message = {
        id: Date.now(),
        text: "Przepraszam, nie udało się połączyć z serwerem.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    })
    .finally(() => setIsLoading(false));
  };

  return (
    <div className="flex h-screen bg-[#050505] text-gray-100 font-sans overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col relative">
        {/* Top Bar */}
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#0a0a0a]">
          <div>
            <h1 className="text-lg font-medium text-white">Chat z Ekspertem</h1>
            <p className="text-xs text-gray-500">Stefan - Starszy Partner</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white gap-2 border border-white/10 h-8">
              <History className="w-3 h-3" />
              Historia (30 dni)
            </Button>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-medium text-green-500 tracking-wide">ONLINE</span>
            </div>
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
                    ? 'bg-orange-600 text-white rounded-tr-sm'
                    : 'bg-[#1a1a1a] border border-white/5 text-gray-300 rounded-tl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-6 bg-[#0a0a0a] border-t border-white/10">
          <div className="max-w-3xl mx-auto relative">
            <form onSubmit={handleSendMessage}>
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Wpisz wiadomość..."
                className="w-full bg-[#151515] border border-white/10 rounded-xl py-4 pl-5 pr-14 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 transition-colors"
              />
              <Button 
                type="submit" 
                size="icon"
                className="absolute right-2 top-2 h-10 w-10 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors"
                disabled={!inputValue.trim() || isLoading}
              >
                <Send className="w-4 h-4" />
              </Button>
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
