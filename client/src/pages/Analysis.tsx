import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

export default function Analysis() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

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
      setAnalysisResult(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setAnalysisResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      // Read file content
      const text = await file.text();
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setAnalysisResult(data.analysis);
      toast.success("Analiza zakończona pomyślnie");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Wystąpił błąd podczas analizy dokumentu");
    } finally {
      setIsAnalyzing(false);
    }
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

        <div className="p-8 max-w-5xl mx-auto w-full space-y-8 pb-20">
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
                    lub kliknij, aby wybrać plik (TXT, MD, JSON)
                  </p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  id="file-upload"
                  accept=".txt,.md,.json,.csv"
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
          {file && !analysisResult && (
            <div className="flex justify-end">
              <Button 
                size="lg" 
                onClick={handleAnalyze} 
                disabled={isAnalyzing}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analizowanie...
                  </>
                ) : (
                  "Rozpocznij Analizę"
                )}
              </Button>
            </div>
          )}

          {/* Analysis Result */}
          {analysisResult && (
            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Wynik Analizy
                </CardTitle>
                <CardDescription>
                  Szczegółowy raport wygenerowany przez system Stefan AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{analysisResult}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Features Grid (only show when no result) */}
          {!analysisResult && (
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
          )}
        </div>
      </div>
    </div>
  );
}
