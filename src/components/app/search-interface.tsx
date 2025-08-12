"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star, 
  X, 
  BookOpen, 
  Clock, 
  CheckCircle,
  MoreHorizontal,
  Play,
  Bookmark,
  Share
} from "lucide-react";

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

interface SearchFilters {
  genre: string;
  status: string;
  format: string;
  rating: string;
}

interface AdvancedBookSearchProps {
  books: Book[];
  onBookClick: (book: Book) => void;
}

export const AdvancedBookSearch = ({ books, onBookClick }: AdvancedBookSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({
    genre: "",
    status: "",
    format: "",
    rating: ""
  });
  const [sortBy, setSortBy] = useState("relevance");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Get unique values for filter options
  const uniqueGenres = useMemo(() => 
    [...new Set(books.map(book => book.genre))].sort(), [books]
  );

  // Search suggestions based on book titles and authors
  const suggestions = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    
    const titleSuggestions = books
      .filter(book => book.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .map(book => book.title)
      .slice(0, 3);
    
    const authorSuggestions = books
      .filter(book => book.author.toLowerCase().includes(searchQuery.toLowerCase()))
      .map(book => book.author)
      .slice(0, 2);
    
    return [...new Set([...titleSuggestions, ...authorSuggestions])];
  }, [searchQuery, books]);

  // Filter and search books
  const filteredBooks = useMemo(() => {
    let result = books;

    // Apply search query
    if (searchQuery) {
      result = result.filter(book => 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    if (filters.genre) {
      result = result.filter(book => book.genre === filters.genre);
    }
    if (filters.status) {
      result = result.filter(book => book.status === filters.status);
    }
    if (filters.format) {
      result = result.filter(book => book.format === filters.format);
    }
    if (filters.rating) {
      const minRating = parseInt(filters.rating);
      result = result.filter(book => book.rating >= minRating);
    }

    // Apply sorting
    switch (sortBy) {
      case "title":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "author":
        result.sort((a, b) => a.author.localeCompare(b.author));
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "relevance":
      default:
        // Keep original order for relevance
        break;
    }

    return result;
  }, [books, searchQuery, filters, sortBy]);

  // Active filters for pills
  const activeFilters = useMemo(() => {
    const active = [];
    if (filters.genre) active.push({ key: "genre", value: filters.genre, label: `Genre: ${filters.genre}` });
    if (filters.status) active.push({ key: "status", value: filters.status, label: `Status: ${filters.status}` });
    if (filters.format) active.push({ key: "format", value: filters.format, label: `Format: ${filters.format}` });
    if (filters.rating) active.push({ key: "rating", value: filters.rating, label: `Rating: ${filters.rating}+ stars` });
    return active;
  }, [filters]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowSuggestions(false);
    
    if (query && !recentSearches.includes(query)) {
      setRecentSearches(prev => [query, ...prev.slice(0, 4)]);
    }
  };

  const removeFilter = (filterKey: keyof SearchFilters) => {
    setFilters(prev => ({ ...prev, [filterKey]: "" }));
  };

  const clearAllFilters = () => {
    setFilters({ genre: "", status: "", format: "", rating: "" });
    setSearchQuery("");
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "reading":
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const BookCard = ({ book }: { book: Book }) => (
    <Card 
      className="group hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
      onClick={() => onBookClick(book)}
    >
      <CardContent className="p-4">
        <div className={`${viewMode === "grid" ? "space-y-3" : "flex gap-4"}`}>
          <div className={`${viewMode === "grid" ? "aspect-[3/4] w-full" : "w-16 h-20 flex-shrink-0"} relative overflow-hidden rounded-md bg-gradient-to-br from-blue-100 to-purple-100`}>
            {book.cover ? (
              <img 
                src={book.cover} 
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <BookOpen className="w-8 h-8" />
              </div>
            )}
            {book.progress > 0 && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1">
                {book.progress}% complete
              </div>
            )}
          </div>
          
          <div className={`${viewMode === "grid" ? "space-y-2" : "flex-1 min-w-0"}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                  {book.title}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {book.author}
                </p>
              </div>
              <Button
                variant="ghost" 
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2 text-xs">
              {getStatusIcon(book.status)}
              <Badge variant="secondary" className="text-xs px-2 py-0">
                {book.genre}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {renderStars(book.rating)}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Play className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Bookmark className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Share className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search books by title, author, or description..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="pl-10 pr-4"
          />
          
          {/* Search Suggestions */}
          {showSuggestions && (suggestions.length > 0 || recentSearches.length > 0) && (
            <Card className="absolute top-full left-0 right-0 mt-1 z-10 max-h-64 overflow-y-auto">
              <CardContent className="p-2">
                {suggestions.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground px-2 py-1">
                      Suggestions
                    </p>
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="w-full text-left px-2 py-1 text-sm hover:bg-accent rounded transition-colors"
                        onClick={() => handleSearch(suggestion)}
                      >
                        <Search className="inline w-3 h-3 mr-2 text-muted-foreground" />
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
                
                {recentSearches.length > 0 && (
                  <div className="space-y-1 mt-2">
                    <p className="text-xs font-medium text-muted-foreground px-2 py-1">
                      Recent Searches
                    </p>
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        className="w-full text-left px-2 py-1 text-sm hover:bg-accent rounded transition-colors"
                        onClick={() => handleSearch(search)}
                      >
                        <Clock className="inline w-3 h-3 mr-2 text-muted-foreground" />
                        {search}
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-2 items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFilters.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {activeFilters.length}
              </Badge>
            )}
          </Button>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder