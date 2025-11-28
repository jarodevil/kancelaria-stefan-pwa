import StefanLayout from "@/components/StefanLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ExternalLink } from "lucide-react";

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

  return (
    <StefanLayout>
      <div className="container max-w-4xl py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Baza Wiedzy</h1>
          <p className="text-muted-foreground mt-2">
            Przydatne zasoby i linki do aktów prawnych
          </p>
        </div>

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
    </StefanLayout>
  );
}
