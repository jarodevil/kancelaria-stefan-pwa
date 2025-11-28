import { Home, MessageSquare, FileText, FileCode, BookOpen, StickyNote, Lock, History } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";

export function Sidebar() {
  const [location] = useLocation();

  const menuItems = [
    { icon: Home, label: "Strona główna", href: "/chat" }, // Redirects to chat for now as main dashboard
    { icon: MessageSquare, label: "Chat z Ekspertem", href: "/chat", active: true },
    { icon: FileText, label: "Analiza Dokumentów", href: "/analysis" },
    { icon: FileCode, label: "Szablony Pism", href: "/templates" },
    { icon: BookOpen, label: "Baza Wiedzy", href: "/knowledge" },
    { icon: StickyNote, label: "Moje Notatki", href: "/notes" },
  ];

  return (
    <div className="w-64 h-screen bg-[#0a0a0a] border-r border-white/10 flex flex-col text-gray-300">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2 text-orange-500 mb-1">
          <div className="w-6 h-6 border-2 border-orange-500 rounded flex items-center justify-center">
            <span className="text-xs font-bold">⚖️</span>
          </div>
          <span className="font-bold text-lg tracking-tight text-white">KancelariaAI</span>
        </div>
        <p className="text-[10px] text-gray-500 uppercase tracking-wider pl-8">System Stefan v1.0</p>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="px-2 space-y-1">
          {menuItems.map((item, index) => (
            <Link key={index} href={item.href}>
              <a className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                item.active 
                  ? "bg-orange-500/10 text-orange-500 border-l-2 border-orange-500" 
                  : "hover:bg-white/5 hover:text-white"
              }`}>
                <item.icon className="w-4 h-4" />
                {item.label}
              </a>
            </Link>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 space-y-4">
        <Link href="/privacy">
          <a className="flex items-center gap-3 px-3 py-2 text-xs text-gray-500 hover:text-white transition-colors">
            <Lock className="w-3 h-3" />
            Polityka Prywatności
          </a>
        </Link>
        
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-xs font-medium text-white mb-1">System Stefan</p>
          <p className="text-[10px] text-gray-500">Wersja Stabilna</p>
          <p className="text-[9px] text-gray-600 mt-2 leading-tight">
            Analiza nie stanowi porady prawnej
          </p>
        </div>
      </div>
    </div>
  );
}
