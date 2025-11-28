import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Analysis() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = () => {
    if (!file) return;
    setIsAnalyzing(true);
    // Simulate analysis for now
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col relative overflow-y-auto">
        {/* Header */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div>
            <h1 className="text-lg font-medium text-foreground">Analiza Dokumentów</h1>
            <p className="text-xs text-muted-foreground">Weryfikacja umów i pism pod kątem ryzyk prawnych</p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </header>

        <div className="p-8 max-w-5xl mx-auto w-full space-y-8">
          {/* Upload Section */}
          <Card className="border-dashed border-2 border-border bg-card/50">
            <CardContent className="p-12">
              <div 
                className={`flex flex-col items-center justify-center text-center space-y-4 transition-colors ${
                  isDragging ? "text-primary" : "text-muted-foreground"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className={`p-4 rounded-full ${isDragging ? "bg-primary/10" : "bg-muted"}`}>
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground">
                    {file ? file.name : "Przeciągnij i upuść dokument tutaj"}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    lub kliknij, aby wybrać plik (PDF, DOCX, TXT)
                  </p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileSelect}
                />
                {!file && (
                  <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                    Wybierz plik
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Analysis Action */}
          {file && (
            <div className="flex justify-end">
              <Button 
                size="lg" 
                onClick={handleAnalyze} 
                disabled={isAnalyzing}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isAnalyzing ? "Analizowanie..." : "Rozpocznij Analizę"}
              </Button>
            </div>
          )}

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  Wykrywanie Ryzyk
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Automatyczna identyfikacja klauzul niedozwolonych i niekorzystnych zapisów w umowach.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="w-4 h-4 text-blue-500" />
                  Streszczenie
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Generowanie zwięzłych podsumowań długich dokumentów prawnych w prostym języku.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Weryfikacja Formalna
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Sprawdzanie kompletności danych, podpisów i wymogów formalnych pisma.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
