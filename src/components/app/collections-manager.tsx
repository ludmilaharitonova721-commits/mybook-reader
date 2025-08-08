"use client"

import React, { useState, useCallback } from 'react'
import { motion } from 'motion/react'
import { 
  Plus, 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  Download,
  Clock,
  BookOpen,
  CheckCircle,
  Heart,
  Search,
  Filter,
  Grid3X3,
  List
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'

interface Book {
  id: string
  title: string
  author: string
  cover: string
  progress?: number
}

interface Collection {
  id: string
  name: string
  books: Book[]
  isSystem: boolean
  icon?: React.ElementType
  color?: string
}

interface CollectionsManagerProps {
  collections?: Collection[]
  onCollectionCreate?: (name: string) => void
  onCollectionRename?: (id: string, name: string) => void
  onCollectionDelete?: (id: string) => void
  onCollectionExport?: (id: string) => void
  onBookMove?: (bookId: string, fromCollectionId: string, toCollectionId: string) => void
  onCollectionSelect?: (collection: Collection) => void
  onBookAdd?: () => void
}

const defaultBooks: Book[] = [
  {
    id: '1',
    title: 'Война и мир',
    author: 'Лев Толстой',
    cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=300&fit=crop&crop=entropy&auto=format',
    progress: 65
  },
  {
    id: '2',
    title: 'Преступление и наказание',
    author: 'Федор Достоевский',
    cover: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=300&fit=crop&crop=entropy&auto=format',
    progress: 100
  },
  {
    id: '3',
    title: 'Мастер и Маргарита',
    author: 'Михаил Булгаков',
    cover: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=300&fit=crop&crop=entropy&auto=format',
    progress: 30
  },
  {
    id: '4',
    title: 'Анна Каренина',
    author: 'Лев Толстой',
    cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200&h=300&fit=crop&crop=entropy&auto=format'
  }
]

const defaultCollections: Collection[] = [
  {
    id: 'recent',
    name: 'Недавно добавленные',
    books: defaultBooks.slice(0, 2),
    isSystem: true,
    icon: Clock,
    color: 'text-blue-500'
  },
  {
    id: 'reading',
    name: 'В процессе',
    books: defaultBooks.filter(book => book.progress && book.progress < 100),
    isSystem: true,
    icon: BookOpen,
    color: 'text-orange-500'
  },
  {
    id: 'completed',
    name: 'Прочитанные',
    books: defaultBooks.filter(book => book.progress === 100),
    isSystem: true,
    icon: CheckCircle,
    color: 'text-green-500'
  },
  {
    id: 'favorites',
    name: 'Избранное',
    books: defaultBooks.slice(1, 3),
    isSystem: true,
    icon: Heart,
    color: 'text-red-500'
  },
  {
    id: 'custom1',
    name: 'Русская классика',
    books: defaultBooks,
    isSystem: false
  },
  {
    id: 'custom2',
    name: 'Научная фантастика',
    books: defaultBooks.slice(0, 3),
    isSystem: false
  }
]

export default function CollectionsManager({
  collections = defaultCollections,
  onCollectionCreate,
  onCollectionRename,
  onCollectionDelete,
  onCollectionExport,
  onBookMove,
  onCollectionSelect,
  onBookAdd
}: CollectionsManagerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')
  const [editingCollection, setEditingCollection] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const filteredCollections = collections.filter(collection =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateCollection = useCallback(() => {
    if (newCollectionName.trim()) {
      onCollectionCreate?.(newCollectionName.trim())
      setNewCollectionName('')
      setIsCreateDialogOpen(false)
    }
  }, [newCollectionName, onCollectionCreate])

  const handleStartEdit = useCallback((collection: Collection) => {
    setEditingCollection(collection.id)
    setEditName(collection.name)
  }, [])

  const handleSaveEdit = useCallback(() => {
    if (editingCollection && editName.trim()) {
      onCollectionRename?.(editingCollection, editName.trim())
      setEditingCollection(null)
      setEditName('')
    }
  }, [editingCollection, editName, onCollectionRename])

  const handleCancelEdit = useCallback(() => {
    setEditingCollection(null)
    setEditName('')
  }, [])

  const CollectionCard = ({ collection }: { collection: Collection }) => {
    const Icon = collection.icon
    const displayBooks = collection.books.slice(0, 4)
    const remainingCount = Math.max(0, collection.books.length - 4)

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        whileHover={{ y: -4 }}
        className="group relative bg-surface rounded-lg p-6 border border-border hover:border-primary/30 transition-all duration-200 cursor-pointer"
        onClick={() => onCollectionSelect?.(collection)}
      >
        <div className="absolute top-4 right-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  handleStartEdit(collection)
                }}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Переименовать
              </DropdownMenuItem>
              {!collection.isSystem && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onCollectionDelete?.(collection.id)
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Удалить
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onCollectionExport?.(collection.id)
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Экспорт
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className={`p-2 rounded-lg bg-muted ${collection.color || 'text-foreground'}`}>
                <Icon className="h-5 w-5" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              {editingCollection === collection.id ? (
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit()
                      if (e.key === 'Escape') handleCancelEdit()
                    }}
                    className="h-8 text-sm"
                    autoFocus
                  />
                  <Button size="sm" onClick={handleSaveEdit}>
                    ✓
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                    ✕
                  </Button>
                </div>
              ) : (
                <>
                  <h3 className="font-display font-semibold text-foreground truncate">
                    {collection.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {collection.books.length} {collection.books.length === 1 ? 'книга' : 'книг'}
                  </p>
                </>
              )}
            </div>
          </div>

          {collection.books.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {displayBooks.map((book, index) => (
                <div
                  key={book.id}
                  className="relative aspect-[3/4] rounded-md overflow-hidden bg-muted"
                >
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  {book.progress && book.progress < 100 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                      <div
                        className="h-full bg-accent transition-all duration-300"
                        style={{ width: `${book.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
              {remainingCount > 0 && (
                <div className="aspect-[3/4] rounded-md bg-muted/50 border-2 border-dashed border-border flex items-center justify-center">
                  <span className="text-xs text-muted-foreground font-medium">
                    +{remainingCount}
                  </span>
                </div>
              )}
            </div>
          )}

          {collection.books.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Коллекция пуста</p>
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="container max-w-7xl mx-auto p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Мои коллекции
            </h1>
            <p className="text-muted-foreground">
              Организуйте свою библиотеку по коллекциям
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск коллекций..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64 bg-input"
              />
            </div>

            <div className="flex items-center border rounded-lg bg-surface">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {onBookAdd && (
              <Button
                onClick={onBookAdd}
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Plus className="h-4 w-4 mr-2" />
                Добавить книгу
              </Button>
            )}

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Создать коллекцию
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-popover">
                <DialogHeader>
                  <DialogTitle className="font-display">Новая коллекция</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input
                    placeholder="Название коллекции"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateCollection()}
                    className="bg-input"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Отмена
                    </Button>
                    <Button
                      onClick={handleCreateCollection}
                      disabled={!newCollectionName.trim()}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Создать
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {filteredCollections.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-display font-semibold text-foreground mb-2">
              Коллекции не найдены
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? 'Попробуйте изменить поисковый запрос' : 'Создайте свою первую коллекцию'}
            </p>
            <div className="flex gap-3 justify-center">
              {!searchQuery && (
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Создать коллекцию
                </Button>
              )}
              {onBookAdd && (
                <Button
                  onClick={onBookAdd}
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить книгу
                </Button>
              )}
            </div>
          </div>
        ) : (
          <motion.div
            layout
            className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            }`}
          >
            {filteredCollections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </motion.div>
        )}

        {filteredCollections.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              Показано {filteredCollections.length} из {collections.length} коллекций
            </p>
          </div>
        )}
      </div>
    </div>
  )
}