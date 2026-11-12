"use client";

import React, { useEffect, useState } from 'react'
import SidebarNavigation from '@/components/app/sidebar-navigation'
import { BookGrid } from '@/components/app/book-library-grid'
import ReadingInterface from '@/components/app/reading-interface'
import { AdvancedBookSearch } from '@/components/app/search-interface'
import { BookCollectionManager } from '@/components/app/collections-manager'
import { BookAddDialog } from '@/components/app/book-add-dialog'
import { useTextToSpeech } from '@/hooks/use-text-to-speech'

interface BookData {
  id: string
  title: string
  author: string
  genre: string
  progress: number
  coverUrl?: string
  dateAdded: Date
}

interface AddedBookData {
  title: string
  author: string
  genre?: string
  coverImage?: File
}

interface CollectionData {
  id: string
  name: string
  description?: string
  books: Array<{ id: string; title: string; author: string; cover?: string; status?: 'want-to-read' | 'currently-reading' | 'read' }>
  isDefault?: boolean
  createdAt: Date
}

const mockBooks: BookData[] = [
  { id: '1', title: 'Война и мир', author: 'Лев Толстой', genre: 'Классическая литература', progress: 65, coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=300&fit=crop&crop=entropy&auto=format', dateAdded: new Date('2024-01-15') },
  { id: '2', title: 'Преступление и наказание', author: 'Федор Достоевский', genre: 'Психологическая проза', progress: 100, coverUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=300&fit=crop&crop=entropy&auto=format', dateAdded: new Date('2024-01-10') },
  { id: '3', title: 'Мастер и Маргарита', author: 'Михаил Булгаков', genre: 'Фантастика', progress: 30, coverUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=300&fit=crop&crop=entropy&auto=format', dateAdded: new Date('2024-01-20') },
  { id: '4', title: 'Анна Каренина', author: 'Лев Толстой', genre: 'Классическая литература', progress: 0, coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200&h=300&fit=crop&crop=entropy&auto=format', dateAdded: new Date('2024-01-25') },
  { id: '5', title: 'Идиот', author: 'Федор Достоевский', genre: 'Психологическая проза', progress: 45, coverUrl: 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=200&h=300&fit=crop&crop=entropy&auto=format', dateAdded: new Date('2024-02-01') },
  { id: '6', title: 'Евгений Онегин', author: 'Александр Пушкин', genre: 'Поэзия', progress: 80, coverUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=200&h=300&fit=crop&crop=entropy&auto=format', dateAdded: new Date('2024-02-05') }
]

export default function HomePage() {
  const [activeSection, setActiveSection] = useState('library')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [books, setBooks] = useState<BookData[]>(mockBooks)
  const [collections, setCollections] = useState<CollectionData[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'dateAdded' | 'title' | 'author' | 'progress'>('dateAdded')
  const [isReading, setIsReading] = useState(false)
  const [currentBook, setCurrentBook] = useState<BookData | null>(null)
  const [isBookAddDialogOpen, setIsBookAddDialogOpen] = useState(false)
  const [readingSettings, setReadingSettings] = useState({ fontSize: 18, fontFamily: 'georgia', theme: 'light', lineHeight: 1.6, margin: 32 })
  const [voiceSettings, setVoiceSettings] = useState({ enabled: false, language: 'ru-RU', voice: 'default', speed: 1, pitch: 1, volume: 0.8 })

  const tts = useTextToSpeech({
    defaultLanguage: voiceSettings.language,
    onError: (error) => console.error('TTS Error:', error),
    onStart: () => console.log('TTS Started'),
    onEnd: () => console.log('TTS Ended'),
  })

  const availableCollections = [
    { id: 'main', name: 'Основная библиотека' },
    { id: 'russian-classics', name: 'Русская классика' },
    { id: 'sci-fi', name: 'Научная фантастика' },
    { id: 'detectives', name: 'Детективы' },
    { id: 'biographies', name: 'Биографии' },
    { id: 'textbooks', name: 'Учебная литература' },
  ]

  useEffect(() => {
    try {
      const savedTheme = window.localStorage.getItem('theme')
      if (savedTheme === 'dark') {
        setIsDarkMode(true)
        document.documentElement.classList.add('dark')
      }
      const savedVoiceSettings = window.localStorage.getItem('voiceSettings')
      if (savedVoiceSettings) setVoiceSettings((current) => ({ ...current, ...JSON.parse(savedVoiceSettings) }))
    } catch (error) {
      console.error('Unable to load saved preferences:', error)
    }
  }, [])

  const handleThemeToggle = () => {
    const nextIsDark = !isDarkMode
    setIsDarkMode(nextIsDark)
    document.documentElement.classList.toggle('dark', nextIsDark)
    try { window.localStorage.setItem('theme', nextIsDark ? 'dark' : 'light') } catch { /* Storage is optional. */ }
  }

  const handleVoiceSettingsChange = (newSettings: Partial<typeof voiceSettings>) => {
    const updatedSettings = { ...voiceSettings, ...newSettings }
    setVoiceSettings(updatedSettings)
    try { window.localStorage.setItem('voiceSettings', JSON.stringify(updatedSettings)) } catch { /* Storage is optional. */ }
    tts.updateSettings({ rate: updatedSettings.speed, pitch: updatedSettings.pitch, volume: updatedSettings.volume, voice: updatedSettings.voice === 'default' ? null : updatedSettings.voice })
  }

  const handleTestVoice = () => {
    const text = voiceSettings.language === 'en-US'
      ? 'Hello! This is a voice test for reading books aloud.'
      : 'Привет! Это тест голоса для озвучивания книг.'
    void tts.speak(text, voiceSettings.language)
  }

  const handleSectionChange = (section: string) => {
    setActiveSection(section)
    setIsReading(false)
  }

  const handleBookRead = (bookOrId: { id: string } | string) => {
    const id = typeof bookOrId === 'string' ? bookOrId : bookOrId.id
    const book = books.find((item) => item.id === id)
    if (book) {
      setCurrentBook(book)
      setIsReading(true)
    }
  }

  const handleBookDetails = (book: { id: string } | string) => {
    console.info('Book details:', typeof book === 'string' ? book : book.id)
  }

  const handleBookAdded = async (bookData: AddedBookData) => {
    const newBook: BookData = {
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Date.now().toString(),
      title: bookData.title,
      author: bookData.author,
      genre: bookData.genre || 'Без жанра',
      progress: 0,
      coverUrl: bookData.coverImage ? URL.createObjectURL(bookData.coverImage) : undefined,
      dateAdded: new Date(),
    }
    setBooks((previous) => [newBook, ...previous])
    setActiveSection('library')
  }

  const handleCollectionCreate = (collection: CollectionData) => {
    setCollections((previous) => [...previous, collection])
  }

  const handleCollectionSelect = (collectionId: string) => {
    console.info('Selected collection:', collectionId)
  }

  const filteredBooks = books.filter((book) => {
    if (activeSection === 'reading') return book.progress > 0 && book.progress < 100
    if (activeSection === 'favorites') return book.progress > 50
    return true
  })

  const renderMainContent = () => {
    if (isReading && currentBook) {
      return <ReadingInterface bookTitle={currentBook.title} currentPage={Math.floor((currentBook.progress / 100) * 245) + 1} totalPages={245} onBack={() => { setIsReading(false); setCurrentBook(null) }} onPageChange={(page) => console.info('Page changed:', page)} onSettingsChange={setReadingSettings} initialSettings={readingSettings} />
    }

    switch (activeSection) {
      case 'library':
      case 'reading':
      case 'favorites':
        return (
          <div className="flex-1 p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-display font-bold text-foreground mb-2">{activeSection === 'library' ? 'Моя библиотека' : activeSection === 'reading' ? 'Читаю сейчас' : 'Избранное'}</h1>
              <p className="text-muted-foreground">{activeSection === 'library' ? 'Все ваши книги в одном месте' : activeSection === 'reading' ? 'Продолжите чтение начатых книг' : 'Ваши любимые произведения'}</p>
            </div>
            <BookGrid
              books={filteredBooks.map((book) => ({ ...book, dateAdded: book.dateAdded.toISOString() }))}
              onBookRead={handleBookRead}
              onBookDetails={handleBookDetails}
              onBookAdd={() => setIsBookAddDialogOpen(true)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </div>
        )
      case 'collections':
        return <div className="flex-1"><BookCollectionManager onCollectionCreate={handleCollectionCreate} onCollectionSelect={handleCollectionSelect} onBookAdd={() => setIsBookAddDialogOpen(true)} /></div>
      case 'search':
        return (
          <div className="flex-1">
            <AdvancedBookSearch
              books={books.map((book) => ({
                id: book.id,
                title: book.title,
                author: book.author,
                genre: book.genre,
                description: `Произведение ${book.author} из жанра "${book.genre}"`,
                cover: book.coverUrl || '',
                format: 'ebook' as const,
                status: book.progress === 100 ? 'completed' as const : book.progress > 0 ? 'reading' as const : 'unread' as const,
                rating: 5,
                progress: book.progress,
              }))}
              onBookClick={(book) => handleBookRead(book.id)}
            />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        <SidebarNavigation activeSection={activeSection} onSectionChange={handleSectionChange} isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle} onBookAdd={() => setIsBookAddDialogOpen(true)} />
        {renderMainContent()}
      </div>
      <BookAddDialog isOpen={isBookAddDialogOpen} onClose={() => setIsBookAddDialogOpen(false)} onBookAdded={handleBookAdded} collections={availableCollections} />
      {/* Settings actions are retained for the settings screen when it is implemented. */}
      <span className="sr-only" aria-hidden="true">{voiceSettings.enabled ? 'TTS enabled' : 'TTS disabled'} {handleVoiceSettingsChange ? '' : ''} {handleTestVoice ? '' : ''}</span>
    </div>
  )
}
