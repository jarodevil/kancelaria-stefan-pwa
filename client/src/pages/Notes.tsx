import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Note {
  id: number;
  title: string;
  content: string;
  date: string;
}

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentNote, setCurrentNote] = useState<Partial<Note>>({});

  useEffect(() => {
    const savedNotes = localStorage.getItem('stefan_user_notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  const saveNotes = (updatedNotes: Note[]) => {
    setNotes(updatedNotes);
    localStorage.setItem('stefan_user_notes', JSON.stringify(updatedNotes));
  };

  const handleAddNote = () => {
    setIsEditing(true);
    setCurrentNote({
      title: "",
      content: ""
    });
  };

  const handleSaveNote = () => {
    if (!currentNote.title || !currentNote.content) {
      toast.error("Tytuł i treść są wymagane");
      return;
    }

    const newNote: Note = {
      id: Date.now(),
      title: currentNote.title,
      content: currentNote.content,
      date: new Date().toLocaleDateString('pl-PL')
    };

    const updatedNotes = [newNote, ...notes];
    saveNotes(updatedNotes);
    setIsEditing(false);
    toast.success("Notatka zapisana");
  };

  const handleDeleteNote = (id: number) => {
    const updatedNotes = notes.filter(n => n.id !== id);
    saveNotes(updatedNotes);
    toast.success("Notatka usunięta");
  };

  return (
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col relative overflow-y-auto">
        {/* Header */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div>
            <h1 className="text-lg font-medium text-foreground">Moje Notatki</h1>
            <p className="text-xs text-muted-foreground">Prywatny notatnik prawny</p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button onClick={handleAddNote} size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Nowa Notatka
            </Button>
          </div>
        </header>

        <div className="p-8 max-w-4xl mx-auto w-full space-y-6">
          {isEditing && (
            <Card className="animate-in fade-in slide-in-from-top-4">
              <CardHeader>
                <CardTitle>Nowa Notatka</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input 
                  placeholder="Tytuł notatki..." 
                  value={currentNote.title}
                  onChange={(e) => setCurrentNote({...currentNote, title: e.target.value})}
                />
                <Textarea 
                  placeholder="Treść notatki..." 
                  className="min-h-[150px]"
                  value={currentNote.content}
                  onChange={(e) => setCurrentNote({...currentNote, content: e.target.value})}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>Anuluj</Button>
                  <Button onClick={handleSaveNote} className="gap-2">
                    <Save className="w-4 h-4" />
                    Zapisz
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.length === 0 && !isEditing && (
              <div className="col-span-2 text-center py-12 text-muted-foreground">
                Brak notatek. Kliknij "Nowa Notatka" aby dodać pierwszą.
              </div>
            )}
            
            {notes.map((note) => (
              <Card key={note.id} className="group hover:border-primary/50 transition-colors">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium line-clamp-1">
                    {note.title}
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                    onClick={() => handleDeleteNote(note.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">
                    {note.content}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-4 pt-2 border-t border-border">
                    Utworzono: {note.date}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
