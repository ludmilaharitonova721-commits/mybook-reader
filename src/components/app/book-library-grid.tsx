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

export const BookGrid: React.FC<BookGridProps> = ({
  books,
  onBookRead,
  onBookDetails,
  onBookAdd,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}) => {
  const [imageLoadStates, setImageLoadStates] = useState<Record<string, 'loading' | 'loaded' | 'error'>>({});

  const filteredAndSortedBooks = useMemo(() => {
    let filtered = books.filter(book =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.genre.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return a.author.localeCompare(b.author);
        case 'progress':
          return b.progress - a.progress;
        case 'dateAdded':
        default:
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      }
    });
  }, [books, searchQuery, sortBy]);

  const handleImageLoad = (bookId: string) => {
    setImageLoadStates(prev => ({ ...prev, [bookId]: 'loaded' }));
  };

  const handleImageError = (bookId: string) => {
    setImageLoadStates(prev => ({ ...prev, [bookId]: 'error' }));
  };

  const handleImageLoadStart = (bookId: string) => {
    setImageLoadStates(prev => ({ ...prev, [bookId]: 'loading' }));
  };

  const getImageLoadState = (bookId: string) => {
    return imageLoadStates[bookId] || 'loading';
  };

  const CircularProgress = ({ progress }: { progress: number }) => {
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 50 50">
          <circle
            cx="25"
            cy="25"
            r={radius}
            stroke="currentColor"
            strokeWidth="3"
            fill="transparent"
            className="text-muted/20"
          />
          <circle
            cx="25"
            cy="25"
            r={radius}
            stroke="currentColor"
            strokeWidth="3"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="text-primary transition-all duration-500 ease-in-out"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-foreground">{progress}%</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Sort Select */}
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dateAdded">Date Added</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="author">Author</SelectItem>
              <SelectItem value="progress">Progress</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Add Book Button */}
        <Button onClick={onBookAdd} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Book
        </Button>
      </div>

      {/* Books Grid */}
      {filteredAndSortedBooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {searchQuery ? 'No books found' : 'No books yet'}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            {searchQuery
              ? `No books match "${searchQuery}". Try adjusting your search terms.`
              : 'Start building your library by adding your first book.'}
          </p>
          {!searchQuery && (
            <Button onClick={onBookAdd} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Book
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
          {filteredAndSortedBooks.map((book) => (
            <Card
              key={book.id}
              className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-0">
                {/* Book Cover */}
                <div className="relative aspect-[3/4] bg-muted overflow-hidden">
                  {book.coverUrl && getImageLoadState(book.id) !== 'error' ? (
                    <>
                      {getImageLoadState(book.id) === 'loading' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      )}
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${
                          getImageLoadState(book.id) === 'loaded' ? 'opacity-100' : 'opacity-0'
                        }`}
                        onLoad={() => handleImageLoad(book.id)}
                        onError={() => handleImageError(book.id)}
                        onLoadStart={() => handleImageLoadStart(book.id)}
                      />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => onBookRead(book)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <BookOpen className="h-4 w-4 mr-1" />
                      Read
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onBookDetails(book)}
                    >
                      <Info className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                  </div>

                  {/* Progress Indicator */}
                  <div className="absolute top-3 right-3">
                    <CircularProgress progress={book.progress} />
                  </div>
                </div>

                {/* Book Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-foreground line-clamp-2 leading-tight">
                      {book.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      by {book.author}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full">
                      {book.genre}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Progress</span>
                      <span className="text-xs font-medium text-foreground">{book.progress}%</span>
                    </div>
                    <Progress value={book.progress} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};