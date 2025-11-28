import { Download, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Help() {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/Stefan_Instrukcja_Obslugi.pdf';
    link.download = 'Stefan_Instrukcja_Obslugi.pdf';
    link.click();
  };

  const handleOpenPDF = () => {
    window.open('/Stefan_Instrukcja_Obslugi.pdf', '_blank');
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Pomoc i Dokumentacja
        </h1>
        <p className="text-muted-foreground">
          Kompletna instrukcja obsługi systemu Stefan - asystenta prawnego AI
        </p>
      </div>

      <Card className="p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-2">Instrukcja Użytkownika</h2>
            <p className="text-muted-foreground mb-4">
              Szczegółowy przewodnik po wszystkich funkcjach systemu Stefan, zawierający:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mb-4">
              <li>Opis wszystkich możliwości i funkcji</li>
              <li>Ograniczenia systemu (np. długość pytania)</li>
              <li>Instrukcje krok po kroku dla każdego modułu</li>
              <li>Certyfikaty, pozwolenia i zapewnienia prawne</li>
              <li>Polityka prywatności i zgodność z RODO</li>
              <li>Rozwiązywanie problemów i wsparcie techniczne</li>
            </ul>
            <div className="flex gap-3">
              <Button onClick={handleOpenPDF} className="gap-2">
                <ExternalLink className="w-4 h-4" />
                Otwórz w nowej karcie
              </Button>
              <Button onClick={handleDownload} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Pobierz PDF
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Podgląd Dokumentacji</h2>
        <div className="border rounded-lg overflow-hidden bg-muted/30">
          <iframe
            src="/Stefan_Instrukcja_Obslugi.pdf"
            className="w-full h-[600px]"
            title="Instrukcja obsługi Stefan"
          />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Szybkie Linki</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="#/chat"
            className="p-4 border rounded-lg hover:bg-accent transition-colors"
          >
            <h3 className="font-semibold mb-1">Chat z Ekspertem</h3>
            <p className="text-sm text-muted-foreground">
              Zadaj pytanie prawne i otrzymaj natychmiastową odpowiedź
            </p>
          </a>
          <a
            href="#/analysis"
            className="p-4 border rounded-lg hover:bg-accent transition-colors"
          >
            <h3 className="font-semibold mb-1">Analiza Dokumentów</h3>
            <p className="text-sm text-muted-foreground">
              Prześlij dokument i otrzymaj szczegółową analizę prawną
            </p>
          </a>
          <a
            href="#/templates"
            className="p-4 border rounded-lg hover:bg-accent transition-colors"
          >
            <h3 className="font-semibold mb-1">Szablony Pism</h3>
            <p className="text-sm text-muted-foreground">
              Pobierz gotowe wzory dokumentów prawnych
            </p>
          </a>
          <a
            href="#/settings"
            className="p-4 border rounded-lg hover:bg-accent transition-colors"
          >
            <h3 className="font-semibold mb-1">Ustawienia</h3>
            <p className="text-sm text-muted-foreground">
              Zarządzaj aplikacją, eksportuj dane, zainstaluj PWA
            </p>
          </a>
        </div>
      </Card>

      <div className="mt-8 p-6 bg-muted/50 rounded-lg">
        <h3 className="font-semibold mb-2">Potrzebujesz pomocy?</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Jeśli nie znalazłeś odpowiedzi w dokumentacji, skontaktuj się z naszym zespołem wsparcia:
        </p>
        <div className="flex flex-col gap-2 text-sm">
          <div>
            <span className="font-medium">Email:</span>{" "}
            <a href="mailto:support@kancelaria-stefan.pl" className="text-primary hover:underline">
              support@kancelaria-stefan.pl
            </a>
          </div>
          <div>
            <span className="font-medium">Strona:</span>{" "}
            <a href="https://kancelaria-stefan.pl" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              https://kancelaria-stefan.pl
            </a>
          </div>
          <div>
            <span className="font-medium">Telefon:</span> +48 123 456 789 (pon-pt 9:00-17:00)
          </div>
        </div>
      </div>
    </div>
  );
}
