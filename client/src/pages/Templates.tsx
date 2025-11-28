import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Search } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";

const templates = [
  {
    id: 1,
    title: "Umowa o Dzieło",
    category: "Umowy Cywilnoprawne",
    description: "Standardowy wzór umowy o dzieło z przeniesieniem praw autorskich.",
    format: "DOCX"
  },
  {
    id: 2,
    title: "Wypowiedzenie Umowy o Pracę",
    category: "Prawo Pracy",
    description: "Wzór wypowiedzenia umowy o pracę za porozumieniem stron.",
    format: "PDF"
  },
  {
    id: 3,
    title: "Wezwanie do Zapłaty",
    category: "Windykacja",
    description: "Przedsądowe wezwanie do zapłaty z naliczeniem odsetek.",
    format: "DOCX"
  },
  {
    id: 4,
    title: "Pełnomocnictwo Ogólne",
    category: "Administracja",
    description: "Wzór pełnomocnictwa do reprezentowania przed urzędami.",
    format: "PDF"
  },
  {
    id: 5,
    title: "Umowa Najmu Lokalu",
    category: "Nieruchomości",
    description: "Bezpieczna umowa najmu okazjonalnego lokalu mieszkalnego.",
    format: "DOCX"
  },
  {
    id: 6,
    title: "Reklamacja Towaru",
    category: "Konsumenckie",
    description: "Pismo reklamacyjne z tytułu rękojmi za wady fizyczne.",
    format: "DOCX"
  }
];

export default function Templates() {
  return (
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col relative overflow-y-auto">
        {/* Header */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div>
            <h1 className="text-lg font-medium text-foreground">Szablony Pism</h1>
            <p className="text-xs text-muted-foreground">Baza zweryfikowanych wzorów dokumentów</p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto w-full space-y-8">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Szukaj szablonu (np. umowa, wezwanie)..." 
              className="pl-10 bg-card border-border"
            />
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="hover:border-primary/50 transition-colors cursor-pointer group">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground border border-border">
                      {template.format}
                    </span>
                  </div>
                  <CardTitle className="text-base">{template.title}</CardTitle>
                  <CardDescription className="text-xs">{template.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {template.description}
                  </p>
                  <Button variant="outline" className="w-full gap-2 group-hover:border-primary group-hover:text-primary">
                    <Download className="w-4 h-4" />
                    Pobierz Wzór
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
