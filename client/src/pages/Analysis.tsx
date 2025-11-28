import StefanLayout from "@/components/StefanLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { FileText, Loader2, Upload } from "lucide-react";
import { useState } from "react";
import { Streamdown } from "streamdown";
import { toast } from "sonner";

export default function Analysis() {
  const [content, setContent] = useState("");
  const [filename, setFilename] = useState("");
  const [analysis, setAnalysis] = useState("");

  const analyzeMutation = trpc.analysis.analyzeDocument.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setAnalysis(data.analysis);
        toast.success("Analiza zakończona pomyślnie");
      } else {
        toast.error("Błąd analizy", { description: data.analysis });
      }
    },
    onError: (error) => {
      toast.error("Błąd połączenia", { description: error.message });
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFilename(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setContent(text);
      toast.success(`Plik "${file.name}" został wczytany`);
    };
    reader.onerror = () => {
      toast.error("Nie udało się wczytać pliku");
    };
    reader.readAsText(file);
  };

  const handleAnalyze = () => {
    if (!content.trim()) {
      toast.error("Wprowadź treść dokumentu do analizy");
      return;
    }

    setAnalysis("");
    analyzeMutation.mutate({
      content: content.trim(),
      filename,
    });
  };

  return (
    <StefanLayout>
      <div className="container max-w-6xl py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Analiza Dokumentów</h1>
          <p className="text-muted-foreground mt-2">
            Prześlij dokument lub wklej jego treść, aby otrzymać szczegółową analizę prawną
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Dokument do analizy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* File Upload */}
                <div>
                  <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Kliknij, aby wybrać plik (TXT, MD, JSON)</span>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".txt,.md,.json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {filename && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Wczytano: <strong>{filename}</strong>
                    </p>
                  )}
                </div>

                {/* Text Input */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Lub wklej treść dokumentu:
                  </label>
                  <Textarea
                    placeholder="Wklej tutaj treść umowy, pisma lub innego dokumentu..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={12}
                    className="resize-none"
                  />
                </div>

                {/* Analyze Button */}
                <Button
                  onClick={handleAnalyze}
                  disabled={!content.trim() || analyzeMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  {analyzeMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analizuję dokument...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Przeanalizuj dokument
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Wyniki analizy</CardTitle>
              </CardHeader>
              <CardContent>
                {!analysis && !analyzeMutation.isPending && (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Wyniki analizy pojawią się tutaj</p>
                  </div>
                )}

                {analyzeMutation.isPending && (
                  <div className="text-center py-12">
                    <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
                    <p className="text-muted-foreground">
                      Analizuję dokument pod kątem prawnym...
                    </p>
                  </div>
                )}

                {analysis && (
                  <div className="prose prose-sm max-w-none">
                    <Streamdown>{analysis}</Streamdown>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Info Card */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Uwaga:</strong> Analiza nie stanowi porady prawnej. W sprawach
              wymagających większej opinii skonsultuj się z uprawnionym doradcą.
            </p>
          </CardContent>
        </Card>
      </div>
    </StefanLayout>
  );
}
