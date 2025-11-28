import StefanLayout from "@/components/StefanLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, FileCheck, FileText, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const quickActions = [
    {
      title: "Chat z Ekspertem",
      description: "Zadaj pytanie prawne i otrzymaj natychmiastową odpowiedź",
      icon: MessageSquare,
      href: "/chat",
      color: "text-blue-500",
    },
    {
      title: "Analiza Dokumentów",
      description: "Prześlij dokument i otrzymaj szczegółową analizę prawną",
      icon: FileCheck,
      href: "/analysis",
      color: "text-green-500",
    },
    {
      title: "Szablony Pism",
      description: "Pobierz gotowe szablony dokumentów prawnych",
      icon: FileText,
      href: "/templates",
      color: "text-purple-500",
    },
  ];

  return (
    <StefanLayout>
      <div className="container max-w-6xl py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Witaj w Systemie Stefan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Twój osobisty asystent prawny AI. Szybki, precyzyjny i zawsze dostępny.
            Zadaj pytanie, przeanalizuj dokument lub pobierz szablon pisma.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4 ${action.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <CardTitle>{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="w-full justify-between">
                      Przejdź
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Info Section */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle>O Systemie Stefan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Stefan to zaawansowany asystent prawny oparty na sztucznej inteligencji,
              który pomaga w codziennych sprawach prawnych. System wykorzystuje najnowsze
              modele AI do analizy dokumentów, udzielania porad i generowania pism.
            </p>
            <p>
              <strong>Ważne:</strong> Analiza nie stanowi porady prawnej. W sprawach
              wymagających większej opinii skonsultuj się z uprawnionym doradcą.
            </p>
          </CardContent>
        </Card>
      </div>
    </StefanLayout>
  );
}
