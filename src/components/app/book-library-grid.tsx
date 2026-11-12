"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Search, Plus, BookOpen, Info, ImageIcon } from 'lucide-react';

interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  progress: number;
  coverUrl?: string;
  dateAdded: string;
}

interface BookGridProps {
  books: Book[];
  onBookRead: (book: Book) => void;
  onBookDetails: (book: Book) => void;
  onBookAdd: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: 'dateAdded' | 'title' | 'author' | 'progress';
  onSortChange: (sortBy: 'dateAdded' | 'title' | 'author' | 'progress') => void;
}

export const BookGrid: React.FC<BookGridProps> = ({ books, onBookRead, onBookDetails, onBookAdd, searchQuery, onSearchChange, sortBy, onSortChange }) => {
  const [imageLoadStates, setImageLoadStates] = useState<Record<string, 'loading' | 'loaded' | 'error'>>({});
  const filteredAndSortedBooks = useMemo(() => {
    const filtered = books.filter((book) => book.title.toLowerCase().includes(searchQuery.toLowerCase()) || book.author.toLowerCase().includes(searchQuery.toLowerCase()) || book.genre.toLowerCase().includes(searchQuery.toLowerCase()));
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'title': return a.title.localeCompare(b.title);
        case 'author': return a.author.localeCompare(b.author);
        case 'progress': return b.progress - a.progress;
        default: return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      }
    });
  }, [books, searchQuery, sortBy]);

  const CircularProgress = ({ progress }: { progress: number }) => {
    const safeProgress = Math.max(0, Math.min(100, progress));
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    return <div className="relative w-12 h-12"><svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 50 50"><circle cx="25" cy="25" r={radius} stroke="currentColor" strokeWidth="3" fill="transparent" className="text-muted/20" /><circle cx="25" cy="25" r={radius} stroke="currentColor" strokeWidth="3" fill="transparent" strokeDasharray={circumference} strokeDashoffset={circumference - (safeProgress / 100) * circumference} className="text-primary transition-all duration-500 ease-in-out" strokeLinecap="round" /></svg><div className="absolute inset-0 flex items-center justify-center"><span className="text-xs font-medium text-foreground">{safeProgress}%</span></div></div>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
          <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" /><Input placeholder="Поиск книг..." value={searchQuery} onChange={(event) => onSearchChange(event.target.value)} className="pl-10" /></div>
          <Select value={sortBy} onValueChange={onSortChange}><SelectTrigger className="w-[180px]"><SelectValue placeholder="Сортировка" /></SelectTrigger><SelectContent><SelectItem value="dateAdded">Дата добавления</SelectItem><SelectItem value="title">Название</SelectItem><SelectItem value="author">Автор</SelectItem><SelectItem value="progress">Прогресс</SelectItem></SelectContent></Select>
        </div>
        <Button onClick={onBookAdd} className="flex items-center gap-2"><Plus className="h-4 w-4" />Добавить книгу</Button>
      </div>
      {filteredAndSortedBooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center"><BookOpen className="h-16 w-16 text-muted-foreground mb-4" /><h3 className="text-lg font-semibold text-foreground mb-2">{searchQuery ? 'Книги не найдены' : 'Библиотека пока пуста'}</h3><p className="text-muted-foreground mb-6 max-w-md">{searchQuery ? `Нет книг по запросу «${searchQuery}».` : 'Добавьте первую книгу в библиотеку.'}</p>{!searchQuery && <Button onClick={onBookAdd}><Plus className="h-4 w-4 mr-2" />Добавить книгу</Button>}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
          {filteredAndSortedBooks.map((book) => (
            <Card key={book.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"><CardContent className="p-0"><div className="relative aspect-[3/4] bg-muted overflow-hidden">
              {book.coverUrl && imageLoadStates[book.id] !== 'error' ? <><img src={book.coverUrl} alt={book.title} className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoadStates[book.id] === 'loaded' ? 'opacity-100' : 'opacity-0'}`} onLoad={() => setImageLoadStates((previous) => ({ ...previous, [book.id]: 'loaded' }))} onError={() => setImageLoadStates((previous) => ({ ...previous, [book.id]: 'error' }))} /><span className="absolute inset-0 -z-0 flex items-center justify-center bg-muted"><ImageIcon className="h-12 w-12 text-muted-foreground" /></span></> : <div className="w-full h-full flex items-center justify-center bg-muted"><ImageIcon className="h-12 w-12 text-muted-foreground" /></div>}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2"><Button size="sm" onClick={() => onBookRead(book)}><BookOpen className="h-4 w-4 mr-1" />Читать</Button><Button size="sm" variant="secondary" onClick={() => onBookDetails(book)}><Info className="h-4 w-4 mr-1" />Детали</Button></div>
              <div className="absolute top-3 right-3"><CircularProgress progress={book.progress} /></div>
            </div><div className="p-4 space-y-3"><div><h3 className="font-semibold text-foreground line-clamp-2 leading-tight">{book.title}</h3><p className="text-sm text-muted-foreground mt-1">{book.author}</p></div><div><span className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full">{book.genre}</span></div><div className="space-y-2"><div className="flex justify-between items-center"><span className="text-xs text-muted-foreground">Прогресс</span><span className="text-xs font-medium text-foreground">{book.progress}%</span></div><Progress value={book.progress} className="h-2" /></div></div></CardContent></Card>
          ))}
        </div>
      )}
    </div>
  );
};
