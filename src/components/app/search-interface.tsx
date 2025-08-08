"use client"

import React, { useState, useMemo } from 'react'
import { Search, Filter, Grid, List, Clock, Star, BookOpen, FileText, Bookmark, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { motion } from 'motion/react'

interface Book {
  id: string
  title: string
  author: string
  genre: string
  description: string
  cover: string
  format: 'epub' | 'pdf' | 'mobi'
  status: 'unread' | 'reading' | 'completed'
  rating: number
  progress?: number
}

interface SearchInterfaceProps {
  books?: Book[]
  onBookClick?: (book: Book) => void
  onFilterChange?: (filters: any) => void
}

const mockBooks: Book[] = [
  {
    id: '1',
    title: 'Война и мир',
    author: 'Лев Толстой',
    genre: 'Классическая литература',
    description: 'Эпический роман о русском обществе во времена наполеоновских войн',
    cover: '/book-covers/war-peace.jpg',
    format: 'epub',
    status: 'reading',
    rating: 5,
    progress: 45
  },
  {
    id: '2',
    title: 'Мастер и Маргарита',
    author: 'Михаил Булгаков',
    genre: 'Фантастика',
    description: 'Философский роман о добре и зле, вере и неверии',
    cover: '/book-covers/master-margarita.jpg',
    format: 'pdf',
    status: 'completed',
    rating: 5
  },
  {
    id: '3',
    title: 'Преступление и наказание',
    author: 'Фёдор Достоевский',
    genre: 'Психологическая проза',
    description: 'История о моральных дилеммах и искуплении',
    cover: '/book-covers/crime-punishment.jpg',
    format: 'epub',
    status: 'unread',
    rating: 4
  }
]

const quickFilters = [
  { label: 'Читаю сейчас', value: 'reading', icon: BookOpen },
  { label: 'Избранное', value: 'favorites', icon: Star },
  { label: 'Новинки', value: 'new', icon: Bookmark },
  { label: 'Классика', value: 'classics', icon: FileText }
]

const formatOptions = [
  { value: 'all', label: 'Все форматы' },
  { value: 'epub', label: 'EPUB' },
  { value: 'pdf', label: 'PDF' },
  { value: 'mobi', label: 'MOBI' }
]

const genreOptions = [
  { value: 'all', label: 'Все жанры' },
  { value: 'classics', label: 'Классическая литература' },
  { value: 'fantasy', label: 'Фантастика' },
  { value: 'psychology', label: 'Психологическая проза' },
  { value: 'romance', label: 'Романтика' },
  { value: 'mystery', label: 'Детектив' }
]

const statusOptions = [
  { value: 'all', label: 'Все статусы' },
  { value: 'unread', label: 'Не прочитано' },
  { value: 'reading', label: 'Читаю' },
  { value: 'completed', label: 'Прочитано' }
]

const ratingOptions = [
  { value: 'all', label: 'Любой рейтинг' },
  { value: '5', label: '5 звёзд' },
  { value: '4', label: '4+ звёзд' },
  { value: '3', label: '3+ звёзд' }
]

export default function SearchInterface({ books = mockBooks, onBookClick, onFilterChange }: SearchInterfaceProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedQuickFilter, setSelectedQuickFilter] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    format: 'all',
    genre: 'all',
    status: 'all',
    rating: 'all'
  })
  const [searchHistory] = useState(['Толстой', 'Классика', 'Фантастика'])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearch = searchTerm === '' || 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.genre.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesFormat = filters.format === 'all' || book.format === filters.format
      const matchesGenre = filters.genre === 'all' || book.genre.toLowerCase().includes(filters.genre)
      const matchesStatus = filters.status === 'all' || book.status === filters.status
      const matchesRating = filters.rating === 'all' || book.rating >= parseInt(filters.rating)

      return matchesSearch && matchesFormat && matchesGenre && matchesStatus && matchesRating
    })
  }, [books, searchTerm, filters])

  const suggestions = useMemo(() => {
    if (!searchTerm) return []
    const allTerms = books.flatMap(book => [book.title, book.author, book.genre])
    return allTerms.filter(term => 
      term.toLowerCase().includes(searchTerm.toLowerCase()) && 
      term.toLowerCase() !== searchTerm.toLowerCase()
    ).slice(0, 5)
  }, [books, searchTerm])

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const handleQuickFilter = (value: string) => {
    setSelectedQuickFilter(selectedQuickFilter === value ? null : value)
  }

  const getStatusColor = (status: Book['status']) => {
    switch (status) {
      case 'reading': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'unread': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: Book['status']) => {
    switch (status) {
      case 'reading': return 'Читаю'
      case 'completed': return 'Прочитано'
      case 'unread': return 'Не прочитано'
      default: return status
    }
  }

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating 
              ? 'fill-yellow-400 text-yellow-400' 
              : 'text-gray-300 dark:text-gray-600'
          }`}
        />
      ))}
    </div>
  )

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto p-6 space-y-8">
        {/* Search Header */}
        <div className="space-y-6">
          {/* Main Search Bar */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Найти книгу, автора или жанр..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setShowSuggestions(e.target.value.length > 0)
                }}
                onFocus={() => setShowSuggestions(searchTerm.length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="pl-12 py-6 text-lg bg-card border-2 border-border focus:border-primary transition-colors"
              />
            </div>

            {/* Auto-complete suggestions */}
            {showSuggestions && (suggestions.length > 0 || searchHistory.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-10 overflow-hidden"
              >
                {suggestions.length > 0 && (
                  <div className="p-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Предложения</h4>
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSearchTerm(suggestion)
                          setShowSuggestions(false)
                        }}
                        className="block w-full text-left px-3 py-2 hover:bg-muted rounded-md text-sm"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                {searchHistory.length > 0 && (
                  <div className="p-4 border-t border-border">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      История поиска
                    </h4>
                    {searchHistory.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSearchTerm(item)
                          setShowSuggestions(false)
                        }}
                        className="block w-full text-left px-3 py-2 hover:bg-muted rounded-md text-sm text-muted-foreground"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            {quickFilters.map((filter) => {
              const Icon = filter.icon
              return (
                <Button
                  key={filter.value}
                  variant={selectedQuickFilter === filter.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleQuickFilter(filter.value)}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {filter.label}
                </Button>
              )
            })}
          </div>

          {/* Advanced Filters */}
          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Фильтры</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Формат файла</label>
                  <Select value={filters.format} onValueChange={(value) => handleFilterChange('format', value)}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {formatOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Жанр</label>
                  <Select value={filters.genre} onValueChange={(value) => handleFilterChange('genre', value)}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {genreOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Статус чтения</label>
                  <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Рейтинг</label>
                  <Select value={filters.rating} onValueChange={(value) => handleFilterChange('rating', value)}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ratingOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-display font-semibold">
              {filteredBooks.length === 0 ? 'Результаты поиска' : `Найдено ${filteredBooks.length} книг`}
            </h2>
            {searchTerm && (
              <p className="text-muted-foreground">
                Поиск по запросу: <span className="font-medium">"{searchTerm}"</span>
              </p>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Results */}
        {filteredBooks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 space-y-4"
          >
            <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Search className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-display font-semibold">Книги не найдены</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Попробуйте изменить параметры поиска или воспользуйтесь советами ниже
              </p>
            </div>
            
            <div className="max-w-md mx-auto text-left bg-card p-6 rounded-lg">
              <h4 className="font-medium mb-3">Советы по поиску:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Используйте ключевые слова из названия или имени автора</li>
                <li>• Попробуйте поиск по жанру</li>
                <li>• Проверьте правильность написания</li>
                <li>• Используйте менее конкретные термины</li>
              </ul>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}
          >
            {filteredBooks.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {viewMode === 'grid' ? (
                  <Card className="group hover:shadow-lg transition-shadow cursor-pointer bg-card" onClick={() => onBookClick?.(book)}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="w-16 h-24 bg-muted rounded-md flex-shrink-0 flex items-center justify-center">
                          <BookOpen className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div>
                            <h3 className="font-display font-semibold line-clamp-1">{book.title}</h3>
                            <p className="text-sm text-muted-foreground">{book.author}</p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {book.genre}
                          </Badge>
                          <p className="text-sm text-muted-foreground line-clamp-2">{book.description}</p>
                          <div className="flex items-center justify-between pt-2">
                            {renderStars(book.rating)}
                            <Badge className={getStatusColor(book.status)}>
                              {getStatusText(book.status)}
                            </Badge>
                          </div>
                          {book.progress && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Прогресс</span>
                                <span>{book.progress}%</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full transition-all"
                                  style={{ width: `${book.progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                          <div className="flex gap-2 pt-2">
                            <Button size="sm" className="flex-1">
                              Читать
                            </Button>
                            <Button size="sm" variant="outline">
                              Детали
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="group hover:shadow-lg transition-shadow cursor-pointer bg-card" onClick={() => onBookClick?.(book)}>
                    <CardContent className="p-4">
                      <div className="flex gap-6">
                        <div className="w-24 h-36 bg-muted rounded-md flex-shrink-0 flex items-center justify-center">
                          <BookOpen className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <div className="flex-1 space-y-3">
                          <div>
                            <h3 className="text-xl font-display font-semibold">{book.title}</h3>
                            <p className="text-muted-foreground">{book.author}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant="secondary">{book.genre}</Badge>
                            <Badge className={getStatusColor(book.status)}>
                              {getStatusText(book.status)}
                            </Badge>
                            <div className="flex items-center gap-2">
                              {renderStars(book.rating)}
                              <span className="text-sm text-muted-foreground">({book.rating})</span>
                            </div>
                          </div>
                          <p className="text-muted-foreground">{book.description}</p>
                          {book.progress && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Прогресс чтения</span>
                                <span>{book.progress}%</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full transition-all"
                                  style={{ width: `${book.progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                          <div className="flex gap-3 pt-2">
                            <Button>Читать</Button>
                            <Button variant="outline">Детали</Button>
                            <Button variant="outline" size="icon">
                              <Bookmark className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}