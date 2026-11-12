"use client";

import { useState, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Book, Grid3X3, Search, ArrowLeft, BookOpen, Check, Clock } from "lucide-react";

interface Book { id: string; title: string; author: string; cover?: string; status?: "want-to-read" | "currently-reading" | "read" }
interface Collection { id: string; name: string; description?: string; books: Book[]; isDefault?: boolean; createdAt: Date }
interface BookCollectionManagerProps {
  onCollectionCreate?: (collection: Collection) => void
  onCollectionSelect?: (collectionId: string) => void
  onBookAdd?: (collectionId: string, book: Book) => void
}

const initialCollections: Collection[] = [
  { id: "want-to-read", name: "Хочу прочитать", description: "Книги в планах", books: [], isDefault: true, createdAt: new Date() },
  { id: "currently-reading", name: "Читаю сейчас", description: "Книги, которые читаю", books: [], isDefault: true, createdAt: new Date() },
  { id: "read", name: "Прочитано", description: "Завершённые книги", books: [], isDefault: true, createdAt: new Date() },
]

export const BookCollectionManager = ({ onCollectionCreate, onCollectionSelect, onBookAdd }: BookCollectionManagerProps) => {
  const [collections, setCollections] = useState<Collection[]>(initialCollections)
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isAddBookDialogOpen, setIsAddBookDialogOpen] = useState(false)
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null)
  const [newCollectionName, setNewCollectionName] = useState("")
  const [newCollectionDescription, setNewCollectionDescription] = useState("")
  const [newBookTitle, setNewBookTitle] = useState("")
  const [newBookAuthor, setNewBookAuthor] = useState("")
  const filteredCollections = useMemo(() => collections.filter((collection) => collection.name.toLowerCase().includes(searchQuery.toLowerCase()) || collection.description?.toLowerCase().includes(searchQuery.toLowerCase())), [collections, searchQuery])

  const createCollection = useCallback(() => {
    if (!newCollectionName.trim()) return
    const collection: Collection = { id: crypto.randomUUID(), name: newCollectionName.trim(), description: newCollectionDescription.trim(), books: [], createdAt: new Date() }
    setCollections((previous) => [...previous, collection])
    onCollectionCreate?.(collection)
    setNewCollectionName(""); setNewCollectionDescription(""); setIsCreateDialogOpen(false)
  }, [newCollectionName, newCollectionDescription, onCollectionCreate])
  const updateCollection = useCallback(() => {
    if (!editingCollection || !newCollectionName.trim()) return
    setCollections((previous) => previous.map((collection) => collection.id === editingCollection.id ? { ...collection, name: newCollectionName.trim(), description: newCollectionDescription.trim() } : collection))
    setEditingCollection(null); setNewCollectionName(""); setNewCollectionDescription(""); setIsCreateDialogOpen(false)
  }, [editingCollection, newCollectionName, newCollectionDescription])
  const deleteCollection = useCallback((id: string) => {
    setCollections((previous) => previous.filter((collection) => collection.id !== id))
    if (selectedCollection === id) setSelectedCollection(null)
  }, [selectedCollection])
  const addBook = useCallback(() => {
    if (!selectedCollection || !newBookTitle.trim() || !newBookAuthor.trim()) return
    const book: Book = { id: crypto.randomUUID(), title: newBookTitle.trim(), author: newBookAuthor.trim(), status: selectedCollection === "want-to-read" ? "want-to-read" : selectedCollection === "currently-reading" ? "currently-reading" : "read" }
    setCollections((previous) => previous.map((collection) => collection.id === selectedCollection ? { ...collection, books: [...collection.books, book] } : collection))
    onBookAdd?.(selectedCollection, book)
    setNewBookTitle(""); setNewBookAuthor(""); setIsAddBookDialogOpen(false)
  }, [selectedCollection, newBookTitle, newBookAuthor, onBookAdd])

  const selectedData = collections.find((collection) => collection.id === selectedCollection)
  if (selectedData) return <div className="space-y-6 p-6 max-w-7xl mx-auto"><div className="flex items-center justify-between"><div><Button variant="ghost" onClick={() => setSelectedCollection(null)}><ArrowLeft className="h-4 w-4 mr-2" />Назад к коллекциям</Button><h1 className="text-3xl font-bold mt-2">{selectedData.name}</h1>{selectedData.description && <p className="text-muted-foreground">{selectedData.description}</p>}</div><Dialog open={isAddBookDialogOpen} onOpenChange={setIsAddBookDialogOpen}><DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Добавить книгу</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Добавить в «{selectedData.name}»</DialogTitle></DialogHeader><div className="space-y-4"><Input placeholder="Название книги" value={newBookTitle} onChange={(event) => setNewBookTitle(event.target.value)} /><Input placeholder="Автор" value={newBookAuthor} onChange={(event) => setNewBookAuthor(event.target.value)} /><Button onClick={addBook} className="w-full">Добавить</Button></div></DialogContent></Dialog></div><div className="grid gap-3">{selectedData.books.length === 0 ? <Card><CardContent className="p-8 text-center"><BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" /><p>В этой коллекции пока нет книг.</p></CardContent></Card> : selectedData.books.map((book) => <Card key={book.id}><CardContent className="p-4 flex items-center justify-between"><div><h3 className="font-semibold">{book.title}</h3><p className="text-sm text-muted-foreground">{book.author}</p></div><Button variant="ghost" onClick={() => setCollections((previous) => previous.map((collection) => collection.id === selectedCollection ? { ...collection, books: collection.books.filter((item) => item.id !== book.id) } : collection))} aria-label="Удалить книгу"><Trash2 className="h-4 w-4" /></Button></CardContent></Card>)}</div></div>

  return <div className="space-y-6 p-6 max-w-7xl mx-auto"><div className="flex items-center justify-between"><div><h1 className="text-3xl font-bold">Мои коллекции</h1><p className="text-muted-foreground mt-1">Организуйте книги по коллекциям</p></div><Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}><DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Новая коллекция</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>{editingCollection ? "Изменить коллекцию" : "Создать коллекцию"}</DialogTitle></DialogHeader><div className="space-y-4"><Input placeholder="Название коллекции" value={newCollectionName} onChange={(event) => setNewCollectionName(event.target.value)} /><Textarea placeholder="Описание (необязательно)" value={newCollectionDescription} onChange={(event) => setNewCollectionDescription(event.target.value)} /><div className="flex gap-2"><Button className="flex-1" onClick={editingCollection ? updateCollection : createCollection}>{editingCollection ? "Сохранить" : "Создать"}</Button><Button className="flex-1" variant="outline" onClick={() => { setIsCreateDialogOpen(false); setEditingCollection(null); }}>Отмена</Button></div></div></DialogContent></Dialog></div><div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Поиск коллекций..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="pl-10" /></div><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{filteredCollections.map((collection) => <Card key={collection.id} className="cursor-pointer hover:shadow-md" onClick={() => { setSelectedCollection(collection.id); onCollectionSelect?.(collection.id); }}><CardContent className="p-5"><div className="flex justify-between"><div><h2 className="font-semibold text-lg">{collection.name}</h2><p className="text-sm text-muted-foreground">{collection.description}</p></div><Book className="h-5 w-5 text-primary" /></div><p className="mt-4 text-sm">{collection.books.length} книг</p><div className="flex justify-end gap-1 mt-2"><Button variant="ghost" size="sm" onClick={(event) => { event.stopPropagation(); setEditingCollection(collection); setNewCollectionName(collection.name); setNewCollectionDescription(collection.description ?? ""); setIsCreateDialogOpen(true); }} aria-label="Редактировать"><Edit className="h-4 w-4" /></Button>{!collection.isDefault && <Button variant="ghost" size="sm" onClick={(event) => { event.stopPropagation(); deleteCollection(collection.id); }} aria-label="Удалить"><Trash2 className="h-4 w-4" /></Button>}<Badge variant="secondary"><Grid3X3 className="h-3 w-3 mr-1" />{collection.books.length}</Badge><Check className="sr-only" /><Clock className="sr-only" /></div></CardContent></Card>)}</div></div>
}
