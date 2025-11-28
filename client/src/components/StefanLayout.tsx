import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Home, 
  MessageSquare, 
  FileText, 
  FileCheck, 
  StickyNote, 
  BookOpen,
  Scale
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { ReactNode } from "react";

interface StefanLayoutProps {
  children: ReactNode;
}

export default function StefanLayout({ children }: StefanLayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Strona główna" },
    { path: "/chat", icon: MessageSquare, label: "Chat z Ekspertem" },
    { path: "/analysis", icon: FileCheck, label: "Analiza Dokumentów" },
    { path: "/templates", icon: FileText, label: "Szablony Pism" },
    { path: "/notes", icon: StickyNote, label: "Moje Notatki" },
    { path: "/knowledge", icon: BookOpen, label: "Baza Wiedzy" },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Scale className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Stefan</h1>
            <p className="text-xs text-muted-foreground">Asystent Prawny AI</p>
          </div>
        </div>

        <Separator />

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        <Separator />

        {/* Footer */}
        <div className="p-4">
          <p className="text-xs text-muted-foreground text-center">
            System Stefan v2.0
            <br />
            © 2025 KancelariaAI
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
