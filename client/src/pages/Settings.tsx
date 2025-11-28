import StefanLayout from "@/components/StefanLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Download, Users, Mail, Key, Smartphone } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function Settings() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [accessCode, setAccessCode] = useState("");

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for the beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Load saved credentials
    const savedEmail = localStorage.getItem("stefan_user_email");
    const savedCode = localStorage.getItem("stefan_access_code");
    if (savedEmail) setUserEmail(savedEmail);
    if (savedCode) setAccessCode(savedCode);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast.error("Instalacja niedostępna", {
        description: "Aplikacja jest już zainstalowana lub przeglądarka nie obsługuje PWA"
      });
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      toast.success("Aplikacja zainstalowana!");
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
  };

  const handleSaveCredentials = () => {
    if (!userEmail.trim() || !accessCode.trim()) {
      toast.error("Wypełnij wszystkie pola");
      return;
    }

    localStorage.setItem("stefan_user_email", userEmail);
    localStorage.setItem("stefan_access_code", accessCode);
    toast.success("Dane dostępu zapisane");
  };

  const generateShareLink = () => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}?email=${encodeURIComponent(userEmail)}&code=${encodeURIComponent(accessCode)}`;
    navigator.clipboard.writeText(link);
    toast.success("Link skopiowany do schowka!");
  };

  return (
    <StefanLayout>
      <div className="container max-w-4xl py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Ustawienia</h1>
          <p className="text-muted-foreground mt-2">
            Zarządzaj aplikacją, dostępem i instalacją
          </p>
        </div>

        {/* PWA Installation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Instalacja aplikacji
            </CardTitle>
            <CardDescription>
              Zainstaluj Stefan jako aplikację na swoim urządzeniu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isInstalled ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Download className="w-4 h-4 text-green-500" />
                <span>Aplikacja jest już zainstalowana</span>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Zainstaluj Stefan jako aplikację PWA, aby korzystać z niej offline 
                  i mieć szybszy dostęp z ekranu głównego.
                </p>
                <Button onClick={handleInstallClick} className="w-full sm:w-auto">
                  <Download className="w-4 h-4 mr-2" />
                  Zainstaluj aplikację
                </Button>
              </>
            )}
            
            <Separator />
            
            <div>
              <h4 className="font-semibold mb-2">Instalacja na innych urządzeniach</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Aby zainstalować aplikację na innym urządzeniu, otwórz ten link:
              </p>
              <div className="flex gap-2">
                <Input 
                  value={window.location.origin} 
                  readOnly 
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.origin);
                    toast.success("Link skopiowany!");
                  }}
                >
                  Kopiuj
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Access Control */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Kontrola dostępu
            </CardTitle>
            <CardDescription>
              Zarządzaj dostępem do aplikacji (maksymalnie 5 użytkowników)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                <Mail className="w-4 h-4 inline mr-2" />
                Adres email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="twoj@email.com"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">
                <Key className="w-4 h-4 inline mr-2" />
                Kod dostępu
              </Label>
              <Input
                id="code"
                type="text"
                placeholder="Wpisz kod dostępu"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveCredentials} className="flex-1">
                Zapisz dane
              </Button>
              <Button 
                variant="outline" 
                onClick={generateShareLink}
                disabled={!userEmail || !accessCode}
              >
                Generuj link
              </Button>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg text-sm">
              <p className="font-semibold mb-2">Informacje o dostępie:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Maksymalnie 5 użytkowników może korzystać z aplikacji</li>
                <li>• Każdy użytkownik potrzebuje unikalnego adresu email i kodu</li>
                <li>• Link z danymi dostępu można udostępnić innym osobom</li>
                <li>• Dane są przechowywane lokalnie w przeglądarce</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>Zarządzanie danymi</CardTitle>
            <CardDescription>
              Eksportuj lub usuń swoje dane z aplikacji
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  const data = {
                    chatHistory: localStorage.getItem("stefan_chat_history"),
                    notes: localStorage.getItem("stefan_notes"),
                    theme: localStorage.getItem("stefan_theme"),
                    email: localStorage.getItem("stefan_user_email"),
                  };
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `stefan-backup-${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                  toast.success("Backup pobrany!");
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Eksportuj dane
              </Button>
              <Button 
                variant="destructive" 
                className="flex-1"
                onClick={() => {
                  if (confirm("Czy na pewno chcesz usunąć wszystkie dane? Ta operacja jest nieodwracalna.")) {
                    localStorage.clear();
                    toast.success("Wszystkie dane zostały usunięte");
                    window.location.reload();
                  }
                }}
              >
                Usuń wszystkie dane
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </StefanLayout>
  );
}
