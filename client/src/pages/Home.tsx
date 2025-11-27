import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Share2, Shield, Zap, Brain, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Home() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Check if running in standalone mode (installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      // Automatically redirect to login if already installed and opened
      setLocation('/login');
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      toast.success("Aplikacja została zainstalowana!");
      // Redirect to login shortly after installation
      setTimeout(() => {
        setLocation('/login');
      }, 2000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [setLocation]);

  const handleInstallClick = async () => {
    if (isInstalled) {
      // If already installed/detected, allow manual navigation to login
      setLocation('/login');
      return;
    }

    if (!deferredPrompt) {
      toast.info("Aplikacja jest już zainstalowana lub Twoja przeglądarka nie wspiera automatycznej instalacji. Sprawdź menu przeglądarki.");
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      // The appinstalled event will handle the redirect
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'KancelariAI - Stefan',
          text: 'Zainstaluj swojego osobistego asystenta prawnego AI.',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link skopiowany do schowka!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[100px]" />
        <div className="absolute top-[20%] right-[20%] w-[2px] h-[100px] bg-gradient-to-b from-transparent via-primary to-transparent opacity-50 rotate-45" />
        <div className="absolute bottom-[30%] left-[10%] w-[100px] h-[2px] bg-gradient-to-r from-transparent via-secondary to-transparent opacity-30" />
      </div>

      <main className="w-full max-w-md z-10 space-y-8">
        
        {/* Header / Logo Area */}
        <div className="text-center space-y-4 animate-in fade-in zoom-in duration-700">
          <div className="relative w-32 h-32 mx-auto mb-6 group">
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
            <img 
              src="/icon-192.png" 
              alt="Stefan Logo" 
              className="relative w-full h-full object-contain drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]"
            />
          </div>
          
          <h1 className="text-4xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-primary-foreground to-white/80 glow-text">
            STEFAN
          </h1>
          <p className="text-lg text-muted-foreground font-light tracking-wide">
            Twój Asystent Prawny AI
          </p>
        </div>

        {/* Main Card */}
        <Card className="glass border-white/5 overflow-hidden backdrop-blur-xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl font-medium">Witaj w przyszłości prawa</CardTitle>
            <CardDescription>Zainstaluj aplikację, aby mieć Stefana zawsze pod ręką.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            
            {/* Features Grid */}
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                <div className="p-2 rounded-md bg-primary/20 text-primary">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Błyskawiczne Analizy</h3>
                  <p className="text-xs text-muted-foreground">Odpowiedzi w czasie rzeczywistym</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                <div className="p-2 rounded-md bg-secondary/20 text-secondary">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Bezpieczeństwo Danych</h3>
                  <p className="text-xs text-muted-foreground">Szyfrowanie klasy bankowej</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                <div className="p-2 rounded-md bg-accent/20 text-accent-foreground">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Zaawansowane AI</h3>
                  <p className="text-xs text-muted-foreground">Oparte na najnowszych modelach</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <Button 
                size="lg" 
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold shadow-[0_0_20px_-5px_var(--primary)] transition-all hover:scale-[1.02]"
                onClick={handleInstallClick}
              >
                {isInstalled ? (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Otwórz Aplikację
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-5 w-5" />
                    Zainstaluj Aplikację
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full border-white/10 hover:bg-white/5 hover:text-white"
                onClick={handleShare}
              >
                <Share2 className="mr-2 h-5 w-5" />
                Udostępnij Wizytówkę
              </Button>
            </div>

          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground/50">
          <p>KancelariAI © 2025. Wszystkie prawa zastrzeżone.</p>
          <p className="mt-1">Działa w trybie offline • PWA Ready</p>
        </div>

      </main>
    </div>
  );
}
