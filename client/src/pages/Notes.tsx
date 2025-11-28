import StefanLayout from "@/components/StefanLayout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Save, Trash2, StickyNote } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("stefan_notes");
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load notes", e);
      }
    }
  }, []);

  useEffect(() => {
    if (notes.length >= 0) {
      localStorage.setItem("stefan_notes", JSON.stringify(notes));
    }
  }, [notes]);

  const handleNewNote = () => {
    setSelectedNote(null);
    setTitle("");
    setContent("");
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast.error("Podaj tytuł notatki");
      return;
    }

    if (selectedNote) {
      setNotes(prev =>
        prev.map(note =>
          note.id === selectedNote.id
            ? { ...note, title, content, updatedAt: new Date().toISOString() }
            : note
        )
      );
      queueAction("note_update", { id: selectedNote.id, title, content });
      toast.success(isOnline ? "Notatka zaktualizowana" : "Notatka zaktualizowana (offline)");
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        title,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setNotes(prev => [newNote, ...prev]);
      queueAction("note_create", newNote);
      toast.success(isOnline ? "Notatka utworzona" : "Notatka utworzona (offline)");
    }

    handleNewNote();
  };

  const handleDelete = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
    queueAction("note_delete", { id });
    if (selectedNote?.id === id) {
      handleNewNote();
    }
    toast.success("Notatka usunięta");
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <StefanLayout>
      <div className="flex h-screen">
        <div className="w-80 border-r flex flex-col">
          <div className="p-4 border-b">
            <Button onClick={handleNewNote} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Nowa notatka
            </Button>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-2">
            {notes.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <StickyNote className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Brak notatek</p>
              </div>
            )}

            {notes.map(note => (
              <Card
                key={note.id}
                className={`cursor-pointer transition-colors ${
                  selectedNote?.id === note.id ? "bg-accent" : "hover:bg-muted/50"
                }`}
                onClick={() => handleSelectNote(note)}
              >
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-medium truncate">
                    {note.title}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(note.updatedAt)}
                  </p>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              {selectedNote ? "Edytuj notatkę" : "Nowa notatka"}
            </h1>
            <div className="flex gap-2">
              {selectedNote && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(selectedNote.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Usuń
                </Button>
              )}
              <Button size="sm" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Zapisz
              </Button>
            </div>
          </div>

          <div className="flex-1 p-6 space-y-4 overflow-auto">
            <div>
              <label className="text-sm font-medium mb-2 block">Tytuł</label>
              <Input
                placeholder="Tytuł notatki..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Treść</label>
              <Textarea
                placeholder="Wpisz treść notatki..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={20}
                className="resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </StefanLayout>
  );
}
