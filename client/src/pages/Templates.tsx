import StefanLayout from "@/components/StefanLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  content: string;
}

const templates: Template[] = [
  {
    id: "umowa-najmu",
    title: "Umowa najmu lokalu mieszkalnego",
    description: "Standardowa umowa najmu mieszkania z wszystkimi niezbędnymi klauzulami",
    category: "Prawo cywilne",
    content: `UMOWA NAJMU LOKALU MIESZKALNEGO

zawarta w dniu ........................ pomiędzy:

WYNAJMUJĄCYM: ................................................
zamieszkałym: ................................................
PESEL: ................................................

a

NAJEMCĄ: ................................................
zamieszkałym: ................................................
PESEL: ................................................

§ 1. PRZEDMIOT UMOWY
Wynajmujący oddaje Najemcy w najem lokal mieszkalny położony w ................................................
o powierzchni ......... m², składający się z ......... pokoi, kuchni i łazienki.

§ 2. CZAS TRWANIA UMOWY
Umowa zostaje zawarta na czas określony od dnia ........................ do dnia ........................

§ 3. CZYNSZ
1. Czynsz najmu wynosi ......... zł miesięcznie.
2. Czynsz płatny jest z góry do ......... dnia każdego miesiąca.
3. Opłaty za media (prąd, gaz, woda) pokrywa Najemca.

§ 4. KAUCJA
Najemca wpłaca kaucję zabezpieczającą w wysokości ......... zł.

§ 5. OBOWIĄZKI STRON
1. Najemca zobowiązuje się do używania lokalu zgodnie z jego przeznaczeniem.
2. Wynajmujący zapewnia sprawność instalacji i urządzeń.

§ 6. POSTANOWIENIA KOŃCOWE
W sprawach nieuregulowanych zastosowanie mają przepisy Kodeksu cywilnego.

................................................
(podpis Wynajmującego)

................................................
(podpis Najemcy)`,
  },
  {
    id: "umowa-sprzedazy",
    title: "Umowa sprzedaży rzeczy ruchomej",
    description: "Prosta umowa kupna-sprzedaży dla rzeczy ruchomych",
    category: "Prawo cywilne",
    content: `UMOWA SPRZEDAŻY

zawarta w dniu ........................ pomiędzy:

SPRZEDAJĄCYM: ................................................
zamieszkałym: ................................................
PESEL: ................................................

a

KUPUJĄCYM: ................................................
zamieszkałym: ................................................
PESEL: ................................................

§ 1. PRZEDMIOT UMOWY
Sprzedający sprzedaje, a Kupujący kupuje:
................................................
(dokładny opis przedmiotu sprzedaży)

§ 2. CENA
Strony ustalają cenę sprzedaży na kwotę ......... zł (słownie: ................................................).

§ 3. PŁATNOŚĆ
Płatność następuje gotówką/przelewem w dniu podpisania umowy.

§ 4. WYDANIE RZECZY
Rzecz zostaje wydana Kupującemu w dniu podpisania umowy.

§ 5. GWARANCJA
Sprzedający oświadcza, że rzecz jest wolna od wad prawnych i fizycznych.

................................................
(podpis Sprzedającego)

................................................
(podpis Kupującego)`,
  },
  {
    id: "pelnomocnictwo",
    title: "Pełnomocnictwo ogólne",
    description: "Pełnomocnictwo do reprezentowania w różnych sprawach",
    category: "Prawo cywilne",
    content: `PEŁNOMOCNICTWO

Ja, niżej podpisany/a:
................................................
zamieszkały/a: ................................................
PESEL: ................................................

niniejszym udzielam pełnomocnictwa:

Pan/Pani: ................................................
zamieszkały/a: ................................................
PESEL: ................................................

do reprezentowania mnie we wszystkich sprawach związanych z:
................................................
................................................

Pełnomocnik jest uprawniony do:
- składania oświadczeń woli w moim imieniu
- podpisywania dokumentów
- odbioru korespondencji
- ................................................

Pełnomocnictwo obowiązuje od dnia ........................ do dnia ........................

................................................
(data i podpis mocodawcy)

Oświadczam, że przyjmuję pełnomocnictwo.

................................................
(data i podpis pełnomocnika)`,
  },
  {
    id: "oswiadczenie-pracownika",
    title: "Oświadczenie pracownika o poufności",
    description: "Zobowiązanie do zachowania tajemnicy przedsiębiorstwa",
    category: "Prawo pracy",
    content: `OŚWIADCZENIE O ZACHOWANIU POUFNOŚCI

Ja, niżej podpisany/a:
................................................
zatrudniony/a na stanowisku: ................................................
w firmie: ................................................

oświadczam, że:

1. Zobowiązuję się do zachowania w tajemnicy wszelkich informacji poufnych dotyczących działalności pracodawcy, w tym:
   - danych klientów i kontrahentów
   - informacji technicznych i technologicznych
   - strategii biznesowej
   - danych finansowych

2. Zobowiązanie to obowiązuje zarówno w trakcie zatrudnienia, jak i po jego zakończeniu.

3. Zobowiązuję się nie wykorzystywać informacji poufnych dla celów prywatnych lub na rzecz osób trzecich.

4. Jestem świadomy/a konsekwencji prawnych naruszenia niniejszego zobowiązania.

................................................
(data i podpis pracownika)`,
  },
];

export default function Templates() {
  const handleDownload = (template: Template) => {
    const blob = new Blob([template.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${template.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Pobrano szablon: ${template.title}`);
  };

  const categories = Array.from(new Set(templates.map(t => t.category)));

  return (
    <StefanLayout>
      <div className="container max-w-6xl py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Szablony Pism</h1>
          <p className="text-muted-foreground mt-2">
            Gotowe szablony dokumentów prawnych do pobrania i edycji
          </p>
        </div>

        {/* Templates by Category */}
        {categories.map(category => (
          <div key={category} className="space-y-4">
            <h2 className="text-xl font-semibold">{category}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {templates
                .filter(t => t.category === category)
                .map(template => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            {template.title}
                          </CardTitle>
                          <CardDescription className="mt-2">
                            {template.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={() => handleDownload(template)}
                        className="w-full"
                        variant="outline"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Pobierz szablon
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}

        {/* Info Card */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Uwaga:</strong> Szablony mają charakter informacyjny. Przed użyciem
              dostosuj je do swojej sytuacji i skonsultuj z prawnikiem.
            </p>
          </CardContent>
        </Card>
      </div>
    </StefanLayout>
  );
}
