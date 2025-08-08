"use client"

import { Book, BookOpen, MoreVertical, Search, Filter, ArrowUpDown, Plus } from "lucide-react"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

interface BookData {
  id: string
  title: string
  author: string
  genre: string
  progress: number
  coverUrl?: string
  dateAdded: Date
}

interface BookLibraryGridProps {
  books?: BookData[]
  isLoading?: boolean
  onBookRead?: (bookId: string) => void
  onBookDetails?: (bookId: string) => void
  onBookAdd?: () => void
  searchQuery?: string
  onSearchChange?: (query: string) => void
  sortBy?: 'dateAdded' | 'title' | 'author' | 'progress'
  onSortChange?: (sortBy: 'dateAdded' | 'title' | 'author' | 'progress') => void
}

// Skeleton component for loading state
function BookCardSkeleton() {
  return (
    <Card className="group bg-card border border-border rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/20">
      <div className="relative">
        <Skeleton className="w-full aspect-[2/3] bg-muted" />
      </div>
      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4 bg-muted" />
          <Skeleton className="h-4 w-1/2 bg-muted" />
        </div>
        <Skeleton className="h-5 w-16 bg-muted rounded-full" />
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Skeleton className="h-3 w-12 bg-muted" />
            <Skeleton className="h-3 w-8 bg-muted" />
          </div>
          <Skeleton className="h-2 w-full bg-muted rounded-full" />
        </div>
      </div>
    </Card>
  )
}

// Individual book card component
function BookCard({ book, onRead, onDetails }: { book: BookData; onRead?: (id: string) => void; onDetails?: (id: string) => void }) {
  const firstLetter = book.title.charAt(0).toUpperCase()

  return (
    <Card className="group bg-card border border-border rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/20">
      <div className="relative">
        {/* Book Cover */}
        <div className="aspect-[2/3] relative overflow-hidden bg-muted">
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={`Cover of ${book.title}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
              <span className="text-6xl font-display font-semibold text-primary">
                {firstLetter}
              </span>
            </div>
          )}
          
          {/* Hover overlay with action buttons */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2">
            <Button
              size="sm"
              onClick={() => onRead?.(book.id)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Читать
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDetails?.(book.id)}
              className="bg-background/80 backdrop-blur-sm border-border hover:bg-muted shadow-lg"
            >
              Подробнее
            </Button>
          </div>
        </div>

        {/* More actions dropdown */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="w-8 h-8 p-0 bg-background/80 backdrop-blur-sm hover:bg-muted"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onRead?.(book.id)}>
                <BookOpen className="w-4 h-4 mr-2" />
                Читать
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDetails?.(book.id)}>
                <Book className="w-4 h-4 mr-2" />
                Подробнее
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Book Information */}
      <div className="p-4 space-y-3">
        <div className="space-y-1">
          <h3 className="font-display font-semibold text-foreground leading-tight line-clamp-2">
            {book.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {book.author}
          </p>
        </div>

        <Badge variant="outline" className="text-xs">
          {book.genre}
        </Badge>

        {/* Reading Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>Прогресс</span>
            <span>{book.progress}%</span>
          </div>
          <Progress 
            value={book.progress} 
            className="h-2 bg-muted"
          />
        </div>
      </div>
    </Card>
  )
}

export default function BookLibraryGrid({
  books = [],
  isLoading = false,
  onBookRead,
  onBookDetails,
  onBookAdd,
  searchQuery = "",
  onSearchChange,
  sortBy = 'dateAdded',
  onSortChange,
}: BookLibraryGridProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)
  const [localSortBy, setLocalSortBy] = useState(sortBy)

  // Handle search change
  const handleSearchChange = (value: string) => {
    setLocalSearchQuery(value)
    onSearchChange?.(value)
  }

  // Handle sort change
  const handleSortChange = (value: 'dateAdded' | 'title' | 'author' | 'progress') => {
    setLocalSortBy(value)
    onSortChange?.(value)
  }

  // Filter and sort books
  const processedBooks = useMemo(() => {
    let filtered = books

    // Apply search filter
    if (localSearchQuery) {
      const query = localSearchQuery.toLowerCase()
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.genre.toLowerCase().includes(query)
      )
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (localSortBy) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'author':
          return a.author.localeCompare(b.author)
        case 'progress':
          return b.progress - a.progress
        case 'dateAdded':
        default:
          return b.dateAdded.getTime() - a.dateAdded.getTime()
      }
    })

    return sorted
  }, [books, localSearchQuery, localSortBy])

  return (
    <div className="bg-background min-h-screen">
      {/* Header with search and filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Поиск по названию, автору или жанру..."
                value={localSearchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 bg-input border-border"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={onBookAdd}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Добавить книгу
            </Button>
            
            <Select value={localSortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-48 bg-input border-border">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dateAdded">По дате добавления</SelectItem>
                <SelectItem value="title">По названию</SelectItem>
                <SelectItem value="author">По автору</SelectItem>
                <SelectItem value="progress">По прогрессу</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results info */}
        {!isLoading && (
          <div className="text-sm text-muted-foreground">
            {processedBooks.length === books.length
              ? `${books.length} книг`
              : `${processedBooks.length} из ${books.length} книг`}
          </div>
        )}
      </div>

      {/* Books Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <BookCardSkeleton key={index} />
          ))}
        </div>
      ) : processedBooks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {processedBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onRead={onBookRead}
              onDetails={onBookDetails}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Book className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground mb-2">
            {localSearchQuery ? 'Книги не найдены' : 'Ваша библиотека пуста'}
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            {localSearchQuery
              ? 'Попробуйте изменить поисковый запрос или проверьте правильность написания'
              : 'Добавьте первую книгу в свою библиотеку, чтобы начать читать'}
          </p>
          {!localSearchQuery && onBookAdd && (
            <Button
              onClick={onBookAdd}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Добавить первую книгу
            </Button>
          )}
        </div>
      )}
    </div>
  )
}