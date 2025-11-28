import StefanLayout from "@/components/StefanLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Info, Shield, Copyright, Heart } from "lucide-react";

export default function About() {
  return (
    <StefanLayout>
      <div className="container max-w-4xl py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">O Systemie Stefan</h1>
          <p className="text-muted-foreground mt-2">
            Informacje o aplikacji, polityka prywatności i warunki użytkowania
          </p>
        </div>

        {/* System Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Informacje o systemie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">System Stefan v1.5</h3>
              <p className="text-sm text-muted-foreground">
                Stefan to zaawansowany asystent prawny oparty na sztucznej inteligencji, 
                który pomaga w codziennych sprawach prawnych. System wykorzystuje najnowsze 
                modele AI do analizy dokumentów, udzielania porad i generowania pism.
              </p>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold mb-2">Funkcje</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Chat z ekspertem prawnym AI</li>
                <li>Analiza dokumentów i wykrywanie ryzyk</li>
                <li>Gotowe szablony pism prawnych</li>
                <li>Osobiste notatki i archiwum</li>
                <li>Baza wiedzy prawnej</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* RODO & Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Polityka Prywatności (RODO)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Ochrona danych osobowych</h3>
              <p>
                System Stefan przetwarza dane osobowe zgodnie z Rozporządzeniem Parlamentu 
                Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. (RODO).
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Jakie dane zbieramy?</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Adres email (do celów uwierzytelnienia)</li>
                <li>Historia rozmów z AI (przechowywana lokalnie w przeglądarce)</li>
                <li>Notatki użytkownika (przechowywane lokalnie w przeglądarce)</li>
                <li>Przesłane dokumenty do analizy (przetwarzane tymczasowo, nie zapisywane)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Twoje prawa</h3>
              <p>Masz prawo do:</p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Dostępu do swoich danych osobowych</li>
                <li>Sprostowania nieprawidłowych danych</li>
                <li>Usunięcia danych ("prawo do bycia zapomnianym")</li>
                <li>Ograniczenia przetwarzania</li>
                <li>Przenoszenia danych</li>
                <li>Wniesienia sprzeciwu wobec przetwarzania</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Bezpieczeństwo</h3>
              <p>
                Wszystkie dane są szyfrowane podczas transmisji (HTTPS). Historia czatu 
                i notatki są przechowywane lokalnie w Twojej przeglądarce i nie są 
                wysyłane na serwer bez Twojej zgody.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Copyright */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Copyright className="w-5 h-5" />
              Prawa autorskie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              © 2025 System Stefan - Asystent Prawny AI. Wszelkie prawa zastrzeżone.
            </p>
            <p>
              Zawartość aplikacji, w tym teksty, grafika, logo, ikony i kod źródłowy, 
              są chronione prawem autorskim. Kopiowanie, modyfikowanie lub dystrybucja 
              bez zgody jest zabroniona.
            </p>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Licencje open source</h3>
              <p>
                System wykorzystuje biblioteki open source na licencjach MIT, Apache 2.0 
                i innych. Pełna lista dostępna w dokumentacji technicznej.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Credits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Podziękowania
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Technologia</h3>
              <p>
                System Stefan został zbudowany z wykorzystaniem platformy{" "}
                <a 
                  href="https://manus.im" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-semibold"
                >
                  Manus
                </a>
                {" "}— zaawansowanego narzędzia do tworzenia aplikacji AI.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Modele AI</h3>
              <p>
                Inteligencja systemu oparta jest na modelach Google Gemini, 
                zapewniających najwyższą jakość odpowiedzi i analizy dokumentów.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Stack technologiczny</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>React 19 + TypeScript</li>
                <li>Tailwind CSS 4</li>
                <li>tRPC (type-safe API)</li>
                <li>Google Gemini API</li>
                <li>Progressive Web App (PWA)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Ważne:</strong> System Stefan nie zastępuje profesjonalnej porady prawnej. 
              W sprawach wymagających wiążącej opinii prawnej zawsze skonsultuj się z uprawnionym 
              prawnikiem lub radcą prawnym.
            </p>
          </CardContent>
        </Card>
      </div>
    </StefanLayout>
  );
}
