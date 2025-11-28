import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Share2, Shield, Zap, Brain, CheckCircle, Lock, Mail, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Home() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  // Check for saved credentials and standalone mode on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('userEmail');
    const savedPassword = localStorage.getItem('userPassword'); // We store this locally to auto-login
    
    if (savedEmail) setEmail(savedEmail);
    if (savedPassword) setPassword(savedPassword);

    // Check if running in standalone mode (installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      
      // Auto-redirect if we have valid credentials saved
      if (savedEmail && savedPassword === 'xxxx') {
        handleRedirect(savedEmail);
      }
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      toast.success("Aplikacja została zainstalowana!");
      // If we have credentials, try to redirect (though usually browser closes/opens app)
      if (email && password === 'xxxx') {
         handleRedirect(email);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [email, password]);

  const handleRedirect = (userEmail: string) => {
    setIsLoading(true);
    toast.success("Weryfikacja pomyślna. Łączenie z kancelarią...");
    
    // Redirect to internal chat
    setTimeout(() => {
        setLocation('/chat');
    }, 800);
  };

  const handleActionClick = async () => {
    // 1. Validate Inputs
    if (!email || !password) {
      toast.error("Proszę podać email i kod dostępu.");
      return;
    }

    if (password !== 'xxxx') {
      toast.error("Błędny kod dostępu.");
      return;
    }

    // 2. Save Credentials
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userPassword', password);

    // 3. If already installed, just redirect
    if (isInstalled) {
      handleRedirect(email);
      return;
    }

    // 4. If not installed, try to install
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        // The appinstalled event will trigger, but we can also redirect here if needed
        // However, usually the browser might close the tab or open the app.
        // We'll let the standalone check handle the redirect when the app opens.
        toast.success("Instalacja rozpoczęta. Otwórz aplikację, aby się połączyć.");
      }
    } else {
      // Fallback if install prompt not available (e.g. already installed but not detected, or unsupported)
      // Just redirect as a web user
      handleRedirect(email);
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
          <div className="relative w-24 h-24 mx-auto mb-4 group">
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
            <img 
              src="/icon-192.png" 
              alt="Stefan Logo" 
              className="relative w-full h-full object-contain drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]"
            />
          </div>
          
          <h1 className="text-3xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-primary-foreground to-white/80 glow-text">
            STEFAN
          </h1>
          <p className="text-sm text-muted-foreground font-light tracking-wide">
            Twój Asystent Prawny AI
          </p>
        </div>

        {/* Main Card */}
        <Card className="glass border-white/5 overflow-hidden backdrop-blur-xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-lg font-medium">Konfiguracja Dostępu</CardTitle>
            <CardDescription>Wprowadź dane, aby połączyć się z kancelarią.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            
            {/* Login Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="twoj@email.pl" 
                    className="pl-9 bg-black/20 border-white/10 focus:border-primary/50 transition-colors"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Kod dostępu</Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="xxxx"
                    className="pl-9 bg-black/20 border-white/10 focus:border-primary/50 transition-colors"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <Button 
                size="lg" 
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold shadow-[0_0_20px_-5px_var(--primary)] transition-all hover:scale-[1.02]"
                onClick={handleActionClick}
                disabled={isLoading}
              >
                {isLoading ? (
                   <div className="flex items-center justify-center gap-2">
                     <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                     <span>Łączenie...</span>
                   </div>
                ) : isInstalled ? (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Połącz z Kancelarią
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-5 w-5" />
                    Zainstaluj i Połącz
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
          <p className="mt-1">PWA Ready • Auto-Login Enabled • v1.5</p>
        </div>

      </main>
    </div>
  );
}
