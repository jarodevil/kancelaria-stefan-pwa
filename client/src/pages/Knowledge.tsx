import StefanLayout from "@/components/StefanLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ExternalLink, Rss } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Knowledge() {
  const resources = [
    {
      title: "Kodeks cywilny",
      description: "Podstawowe przepisy prawa cywilnego w Polsce",
      url: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19640160093",
    },
    {
      title: "Kodeks pracy",
      description: "Przepisy regulujące stosunki pracy",
      url: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19740240141",
    },
    {
      title: "Kodeks postępowania cywilnego",
      description: "Zasady prowadzenia spraw w sądach cywilnych",
      url: "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19640430296",
    },
  ];

  const newsItems = [
    {
      title: "Nowe przepisy o ochronie danych osobowych - zmiany w RODO",
      date: "28 listopada 2025",
      source: "Gazeta Prawna",
      excerpt: "Parlament Europejski przyjął nowelizację rozporządzenia RODO, wprowadzającą nowe obowiązki dla administratorów danych...",
      url: "#",
    },
    {
      title: "Zmiany w Kodeksie pracy - nowe uprawnienia pracowników",
      date: "27 listopada 2025",
      source: "Rzeczpospolita",
      excerpt: "Sejm uchwalił nowelizację Kodeksu pracy, która wprowadza prawo do pracy zdalnej oraz nowe zasady rozwiązywania umów...",
      url: "#",
    },
    {
      title: "Ważne orzeczenie SN w sprawie umów deweloperskich",
      date: "26 listopada 2025",
      source: "Prawo.pl",
      excerpt: "Sąd Najwyższy wydał przełomowe orzeczenie dotyczące odpowiedzialności deweloperów za opóźnienia w oddaniu mieszkań...",
      url: "#",
    },
  ];

  return (
    <StefanLayout>
      <div className="container max-w-4xl py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Baza Wiedzy</h1>
          <p className="text-muted-foreground mt-2">
            Przydatne zasoby, akty prawne i aktualności
          </p>
        </div>

        {/* Legal Resources */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Akty prawne</h2>
          <div className="space-y-4">
            {resources.map((resource, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    {resource.title}
                  </CardTitle>
                  <CardDescription>{resource.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-2"
                  >
                    Otwórz dokument
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* RSS Feed - Legal News */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Rss className="w-5 h-5" />
            Aktualności prawne
          </h2>
          <Card>
            <CardHeader>
              <CardDescription>
                Najnowsze zmiany w prawie i orzecznictwie
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {newsItems.map((item, idx) => (
                <div key={idx}>
                  {idx > 0 && <Separator className="my-4" />}
                  <div className="border-l-2 border-primary pl-4 py-2">
                    <h4 className="font-semibold text-sm mb-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      {item.date} • {item.source}
                    </p>
                    <p className="text-sm text-muted-foreground mb-2">
                      {item.excerpt}
                    </p>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="p-0 h-auto"
                      onClick={() => window.open(item.url, '_blank')}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Czytaj więcej
                    </Button>
                  </div>
                </div>
              ))}

              <Separator />

              <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground">
                <p>
                  <strong>Uwaga:</strong> Powyższe aktualności są przykładowe. 
                  W pełnej wersji systemu można zintegrować prawdziwe źródła RSS 
                  (Gazeta Prawna, Rzeczpospolita, Prawo.pl) dla automatycznych aktualizacji.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </StefanLayout>
  );
}
