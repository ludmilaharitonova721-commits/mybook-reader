"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, Grid, List, Star, X, BookOpen, Clock, CheckCircle, MoreHorizontal, Play, Bookmark, Share } from "lucide-react";

interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  description: string;
  cover: string;
  format: "ebook" | "audiobook" | "physical";
  status: "unread" | "reading" | "completed";
  rating: number;
  progress: number;
}

interface SearchFilters { genre: string; status: string; format: string; rating: string }
interface AdvancedBookSearchProps { books: Book[]; onBookClick: (book: Book) => void }

export const AdvancedBookSearch = ({ books, onBookClick }: AdvancedBookSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({ genre: "", status: "", format: "", rating: "" });
  const [sortBy, setSortBy] = useState("relevance");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const uniqueGenres = useMemo(() => [...new Set(books.map((book) => book.genre))].sort(), [books]);
  const suggestions = useMemo(() => {
    if (searchQuery.length < 2) return [];
    const query = searchQuery.toLowerCase();
    return [...new Set([...books.filter((book) => book.title.toLowerCase().includes(query)).map((book) => book.title).slice(0, 3), ...books.filter((book) => book.author.toLowerCase().includes(query)).map((book) => book.author).slice(0, 2)])];
  }, [searchQuery, books]);
  const filteredBooks = useMemo(() => {
    let result = books.filter((book) => !searchQuery || book.title.toLowerCase().includes(searchQuery.toLowerCase()) || book.author.toLowerCase().includes(searchQuery.toLowerCase()) || book.genre.toLowerCase().includes(searchQuery.toLowerCase()) || book.description.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filters.genre) result = result.filter((book) => book.genre === filters.genre);
    if (filters.status) result = result.filter((book) => book.status === filters.status);
    if (filters.format) result = result.filter((book) => book.format === filters.format);
    if (filters.rating) result = result.filter((book) => book.rating >= Number.parseInt(filters.rating, 10));
    if (sortBy === "title") result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    if (sortBy === "author") result = [...result].sort((a, b) => a.author.localeCompare(b.author));
    if (sortBy === "rating") result = [...result].sort((a, b) => b.rating - a.rating);
    return result;
  }, [books, searchQuery, filters, sortBy]);
  const activeFilters = useMemo(() => Object.entries(filters).filter(([, value]) => value).map(([key, value]) => ({ key: key as keyof SearchFilters, value, label: `${key}: ${value}` })), [filters]);
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowSuggestions(false);
    if (query && !recentSearches.includes(query)) setRecentSearches((previous) => [query, ...previous.slice(0, 4)]);
  };
  const removeFilter = (key: keyof SearchFilters) => setFilters((previous) => ({ ...previous, [key]: "" }));
  const clearAllFilters = () => { setFilters({ genre: "", status: "", format: "", rating: "" }); setSearchQuery(""); };
  const renderStars = (rating: number) => Array.from({ length: 5 }, (_, index) => <Star key={index} className={`w-4 h-4 ${index < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />);
  const getStatusIcon = (status: string) => status === "reading" ? <BookOpen className="w-4 h-4 text-blue-500" /> : status === "completed" ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Clock className="w-4 h-4 text-gray-400" />;
  const BookCard = ({ book }: { book: Book }) => <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1" onClick={() => onBookClick(book)}><CardContent className="p-4"><div className={viewMode === "grid" ? "space-y-3" : "flex gap-4"}><div className={`${viewMode === "grid" ? "aspect-[3/4] w-full" : "w-16 h-20 flex-shrink-0"} relative overflow-hidden rounded-md bg-gradient-to-br from-blue-100 to-purple-100`}>{book.cover ? <img src={book.cover} alt={book.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground"><BookOpen className="w-8 h-8" /></div>}{book.progress > 0 && <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1">{book.progress}% завершено</div>}</div><div className={viewMode === "grid" ? "space-y-2" : "flex-1 min-w-0"}><div className="flex items-start justify-between gap-2"><div className="min-w-0 flex-1"><h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary">{book.title}</h3><p className="text-sm text-muted-foreground truncate">{book.author}</p></div><Button variant="ghost" size="sm" className="p-1 h-auto" aria-label="Дополнительные действия" onClick={(event) => event.stopPropagation()}><MoreHorizontal className="w-4 h-4" /></Button></div><div className="flex items-center gap-2 text-xs">{getStatusIcon(book.status)}<Badge variant="secondary">{book.genre}</Badge></div><div className="flex items-center justify-between"><div className="flex items-center gap-1">{renderStars(book.rating)}</div><div className="flex gap-1"><Button variant="ghost" size="sm" onClick={(event) => { event.stopPropagation(); onBookClick(book); }} aria-label="Открыть книгу"><Play className="w-3 h-3" /></Button><Button variant="ghost" size="sm" onClick={(event) => event.stopPropagation()} aria-label="В избранное"><Bookmark className="w-3 h-3" /></Button><Button variant="ghost" size="sm" onClick={(event) => event.stopPropagation()} aria-label="Поделиться"><Share className="w-3 h-3" /></Button></div></div></div></div></CardContent></Card>;

  return <div className="space-y-6"><div className="space-y-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Поиск по названию, автору или описанию..." value={searchQuery} onChange={(event) => { setSearchQuery(event.target.value); setShowSuggestions(true); }} onFocus={() => setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} className="pl-10 pr-4" />{showSuggestions && (suggestions.length > 0 || recentSearches.length > 0) && <Card className="absolute top-full left-0 right-0 mt-1 z-10 max-h-64 overflow-y-auto"><CardContent className="p-2">{suggestions.map((suggestion) => <button key={suggestion} className="w-full text-left px-2 py-1 text-sm hover:bg-accent rounded" onClick={() => handleSearch(suggestion)}><Search className="inline w-3 h-3 mr-2" />{suggestion}</button>)}{recentSearches.map((search) => <button key={search} className="w-full text-left px-2 py-1 text-sm hover:bg-accent rounded" onClick={() => handleSearch(search)}><Clock className="inline w-3 h-3 mr-2" />{search}</button>)}</CardContent></Card>}</div>
    <div className="flex flex-wrap gap-2 items-center"><Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-2"><Filter className="w-4 h-4" />Фильтры{activeFilters.length > 0 && <Badge variant="secondary">{activeFilters.length}</Badge>}</Button><Select value={sortBy} onValueChange={setSortBy}><SelectTrigger className="w-40"><SelectValue placeholder="Сортировка" /></SelectTrigger><SelectContent><SelectItem value="relevance">По релевантности</SelectItem><SelectItem value="title">По названию</SelectItem><SelectItem value="author">По автору</SelectItem><SelectItem value="rating">По рейтингу</SelectItem></SelectContent></Select><div className="flex border rounded-md"><Button variant={viewMode === "grid" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("grid")} aria-label="Сетка"><Grid className="w-4 h-4" /></Button><Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("list")} aria-label="Список"><List className="w-4 h-4" /></Button></div></div>
    {showFilters && <Card><CardContent className="p-4"><div className="grid grid-cols-1 sm:grid-cols-4 gap-3"><Select value={filters.genre || "all"} onValueChange={(value) => setFilters((previous) => ({ ...previous, genre: value === "all" ? "" : value }))}><SelectTrigger><SelectValue placeholder="Жанр" /></SelectTrigger><SelectContent><SelectItem value="all">Все жанры</SelectItem>{uniqueGenres.map((genre) => <SelectItem key={genre} value={genre}>{genre}</SelectItem>)}</SelectContent></Select><Select value={filters.status || "all"} onValueChange={(value) => setFilters((previous) => ({ ...previous, status: value === "all" ? "" : value }))}><SelectTrigger><SelectValue placeholder="Статус" /></SelectTrigger><SelectContent><SelectItem value="all">Любой статус</SelectItem><SelectItem value="unread">Не прочитано</SelectItem><SelectItem value="reading">Читаю</SelectItem><SelectItem value="completed">Завершено</SelectItem></SelectContent></Select><Select value={filters.rating || "all"} onValueChange={(value) => setFilters((previous) => ({ ...previous, rating: value === "all" ? "" : value }))}><SelectTrigger><SelectValue placeholder="Рейтинг" /></SelectTrigger><SelectContent><SelectItem value="all">Любой рейтинг</SelectItem>{[4, 3, 2, 1].map((rating) => <SelectItem key={rating} value={String(rating)}>{rating}+ звезд</SelectItem>)}</SelectContent></Select><Button variant="outline" onClick={clearAllFilters}>Сбросить фильтры</Button></div>{activeFilters.length > 0 && <div className="flex flex-wrap gap-2 mt-3">{activeFilters.map((filter) => <Badge key={filter.key} variant="secondary">{filter.label}<button className="ml-2" onClick={() => removeFilter(filter.key)} aria-label="Удалить фильтр"><X className="inline h-3 w-3" /></button></Badge>)}</div>}</CardContent></Card>}</div>
    {filteredBooks.length ? <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" : "space-y-3"}>{filteredBooks.map((book) => <BookCard key={book.id} book={book} />)}</div> : <Card><CardContent className="p-10 text-center"><BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-3" /><h3 className="font-semibold">Книги не найдены</h3><p className="text-muted-foreground">Измените запрос или сбросьте фильтры.</p><Button className="mt-4" variant="outline" onClick={clearAllFilters}>Сбросить фильтры</Button></CardContent></Card>}</div>;
};
