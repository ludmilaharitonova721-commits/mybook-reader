"use client";

import { useState } from "react";
import { BookOpen, Plus, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

interface CollectionBook {
  id: string;
  title: string;
  author: string;
  cover?: string;
  status?: "want-to-read" | "currently-reading" | "read";
}

interface Collection {
  id: string;
  name: string;
  description?: string;
  books: CollectionBook[];
  bookIds?: string[];
  isDefault?: boolean;
  createdAt: Date;
}

interface BookCollectionManagerProps {
  initialCollections?: Collection[];
  onCollectionCreate?: (collection: Collection) => void;
  onCollectionSelect?: (collectionId: string) => void;
  onBookAdd?: (collectionId: string, book: CollectionBook) => void;
}

const defaultCollections: Collection[] = [
  { id: "want-to-read", name: "Хочу прочитать", description: "Книги в планах", books: [], isDefault: true, createdAt: new Date() },
  { id: "currently-reading", name: "Читаю сейчас", description: "Книги, которые читаю", books: [], isDefault: true, createdAt: new Date() },
  { id: "read", name: "Прочитано", description: "Завершённые книги", books: [], isDefault: true, createdAt: new Date() },
];

export const BookCollectionManager = ({ initialCollections = defaultCollections, onCollectionCreate, onCollectionSelect, onBookAdd }: BookCollectionManagerProps) => {
  const [collections, setCollections] = useState<Collection[]>(initialCollections);
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");

  const selected = collections.find((collection) => collection.id === selectedId);
  const filtered = collections.filter((collection) => `${collection.name} ${collection.description ?? ""}`.toLowerCase().includes(query.toLowerCase()));

  const createCollection = () => {
    if (!name.trim()) return;
    const collection: Collection = {
      id: globalThis.crypto?.randomUUID?.() ?? String(Date.now()),
      name: name.trim(),
      description: description.trim(),
      books: [],
      createdAt: new Date(),
    };

    setCollections((previous) => [...previous, collection]);
    onCollectionCreate?.(collection);
    setName("");
    setDescription("");
  };

  const addBook = () => {
    if (!selected || !bookTitle.trim() || !bookAuthor.trim()) return;

    const book: CollectionBook = {
      id: globalThis.crypto?.randomUUID?.() ?? String(Date.now()),
      title: bookTitle.trim(),
      author: bookAuthor.trim(),
      status: selected.id === "want-to-read" ? "want-to-read" : selected.id === "currently-reading" ? "currently-reading" : "read",
    };

    setCollections((previous) => previous.map((collection) => collection.id === selected.id ? { ...collection, books: [...collection.books, book], bookIds: [...(collection.bookIds ?? []), book.id] } : collection));
    onBookAdd?.(selected.id, book);
    setBookTitle("");
    setBookAuthor("");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 pb-8 sm:p-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Ваша библиотека</p>
          <h1 className="text-3xl font-bold tracking-tight">Коллекции</h1>
          <p className="mt-2 text-sm text-muted-foreground">Собирайте книги по настроению, жанру или планам.</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="rounded-xl">
              <Plus className="mr-2 h-4 w-4" />
              Новая коллекция
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Создать коллекцию</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Название коллекции" value={name} onChange={(event) => setName(event.target.value)} />
              <Textarea placeholder="Короткое описание" value={description} onChange={(event) => setDescription(event.target.value)} />
              <Button className="w-full" onClick={createCollection}>Создать коллекцию</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {selected ? (
        <section className="space-y-5">
          <button type="button" onClick={() => setSelectedId(null)} className="text-sm font-medium text-primary hover:underline">← Все коллекции</button>

          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold">{selected.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{selected.description}</p>
            </div>
            <Badge variant="secondary">{selected.books.length} книг</Badge>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {selected.books.map((book) => (
              <Card key={book.id} className="rounded-2xl">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-12 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{book.title}</p>
                    <p className="truncate text-sm text-muted-foreground">{book.author}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="max-w-xl rounded-2xl border bg-card p-4">
            <h3 className="mb-3 font-semibold">Добавить книгу в подборку</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input placeholder="Название книги" value={bookTitle} onChange={(event) => setBookTitle(event.target.value)} />
              <Input placeholder="Автор" value={bookAuthor} onChange={(event) => setBookAuthor(event.target.value)} />
            </div>
            <Button onClick={addBook} className="mt-3" disabled={!bookTitle.trim() || !bookAuthor.trim()}>
              <Plus className="mr-2 h-4 w-4" /> Добавить
            </Button>
          </div>
        </section>
      ) : (
        <>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="rounded-xl pl-10" placeholder="Найти коллекцию..." value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((collection, index) => (
              <button type="button" key={collection.id} onClick={() => { setSelectedId(collection.id); onCollectionSelect?.(collection.id); }} className="text-left">
                <Card className="group h-full overflow-hidden rounded-2xl transition duration-200 hover:-translate-y-1 hover:shadow-lg">
                  <div className={`h-2 ${["bg-violet-500", "bg-amber-500", "bg-emerald-500", "bg-sky-500"][index % 4]}`} />
                  <CardContent className="p-5">
                    <div className="mb-5 flex items-start justify-between">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-primary">
                        <BookOpen className="h-5 w-5" />
                      </span>
                      <Badge variant="secondary">{collection.books.length} книг</Badge>
                    </div>
                    <h2 className="text-lg font-semibold group-hover:text-primary">{collection.name}</h2>
                    <p className="mt-1 min-h-10 text-sm text-muted-foreground">{collection.description || "Ваша личная подборка книг."}</p>
                    <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">Открыть подборку →</p>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">Коллекции не найдены.</div>
          )}
        </>
      )}
    </div>
  );
};
