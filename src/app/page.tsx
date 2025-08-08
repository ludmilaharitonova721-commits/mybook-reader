"use client";

import React, { useState, useEffect } from 'react'
import SidebarNavigation from '@/components/app/sidebar-navigation'
import BookLibraryGrid from '@/components/app/book-library-grid'
import ReadingInterface from '@/components/app/reading-interface'
import SearchInterface from '@/components/app/search-interface'
import CollectionsManager from '@/components/app/collections-manager'
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

const mockBooks: BookData[] = [
  {
    id: '1',
    title: 'Война и мир',
    author: 'Лев Толстой',
    genre: 'Классическая литература',
    progress: 65,
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=300&fit=crop&crop=entropy&auto=format',
    dateAdded: new Date('2024-01-15')
  },
  {
    id: '2',
    title: 'Преступление и наказание',
    author: 'Федор Достоевский',
    genre: 'Психологическая проза',
    progress: 100,
    coverUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=300&fit=crop&crop=entropy&auto=format',
    dateAdded: new Date('2024-01-10')
  },
  {
    id: '3',
    title: 'Мастер и Маргарита',
    author: 'Михаил Булгаков',
    genre: 'Фантастика',
    progress: 30,
    coverUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=300&fit=crop&crop=entropy&auto=format',
    dateAdded: new Date('2024-01-20')
  },
  {
    id: '4',
    title: 'Анна Каренина',
    author: 'Лев Толстой',
    genre: 'Классическая литература',
    progress: 0,
    coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200&h=300&fit=crop&crop=entropy&auto=format',
    dateAdded: new Date('2024-01-25')
  },
  {
    id: '5',
    title: 'Идиот',
    author: 'Федор Достоевский',
    genre: 'Психологическая проза',
    progress: 45,
    coverUrl: 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=200&h=300&fit=crop&crop=entropy&auto=format',
    dateAdded: new Date('2024-02-01')
  },
  {
    id: '6',
    title: 'Евгений Онегин',
    author: 'Александр Пушкин',
    genre: 'Поэзия',
    progress: 80,
    coverUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=200&h=300&fit=crop&crop=entropy&auto=format',
    dateAdded: new Date('2024-02-05')
  }
]

export default function HomePage() {
  const [activeSection, setActiveSection] = useState('library')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [books, setBooks] = useState<BookData[]>(mockBooks)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'dateAdded' | 'title' | 'author' | 'progress'>('dateAdded')
  const [isReading, setIsReading] = useState(false)
  const [currentBook, setCurrentBook] = useState<BookData | null>(null)
  const [isBookAddDialogOpen, setIsBookAddDialogOpen] = useState(false)
  const [readingSettings, setReadingSettings] = useState({
    fontSize: 18,
    fontFamily: 'georgia',
    theme: 'light',
    lineHeight: 1.6,
    margin: 32
  })

  // Настройки озвучивания
  const [voiceSettings, setVoiceSettings] = useState({
    enabled: false,
    language: 'ru-RU',
    voice: 'default',
    speed: 1.0,
    pitch: 1.0,
    volume: 0.8
  })

  // Инициализация text-to-speech
  const tts = useTextToSpeech({
    onError: (error) => console.error('TTS Error:', error),
    onStart: () => console.log('TTS Started'),
    onEnd: () => console.log('TTS Ended')
  })

  // Available collections for book assignment
  const collections = [
    'Основная библиотека',
    'Русская классика',
    'Научная фантастика',
    'Детективы',
    'Биографии',
    'Учебная литература'
  ]

  // Доступные языки и голоса
  const availableLanguages = [
    { code: 'ru-RU', name: 'Русский' },
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Español' },
    { code: 'fr-FR', name: 'Français' },
    { code: 'de-DE', name: 'Deutsch' },
    { code: 'it-IT', name: 'Italiano' },
    { code: 'pt-BR', name: 'Português (Brasil)' },
    { code: 'zh-CN', name: '中文 (简体)' },
    { code: 'ja-JP', name: '日本語' },
    { code: 'ko-KR', name: '한국어' }
  ]

  // Получение голосов для выбранного языка
  const getAvailableVoices = () => {
    const languageVoices = tts.getVoicesForLanguage(voiceSettings.language)
    return [
      { id: 'default', name: 'Системный голос по умолчанию' },
      ...languageVoices.map(voice => ({
        id: voice.voice.name,
        name: voice.name
      }))
    ]
  }

  // Theme management
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      setIsDarkMode(true)
      document.documentElement.classList.add('dark')
    }

    // Загрузка настроек озвучивания
    const savedVoiceSettings = localStorage.getItem('voiceSettings')
    if (savedVoiceSettings) {
      setVoiceSettings(JSON.parse(savedVoiceSettings))
    }
  }, [])

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode)
    if (!isDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  // Обработчик изменения настроек озвучивания
  const handleVoiceSettingsChange = (newSettings: Partial<typeof voiceSettings>) => {
    const updatedSettings = { ...voiceSettings, ...newSettings }
    setVoiceSettings(updatedSettings)
    localStorage.setItem('voiceSettings', JSON.stringify(updatedSettings))
    
    // Update TTS settings
    tts.updateSettings({
      rate: updatedSettings.speed,
      pitch: updatedSettings.pitch,
      volume: updatedSettings.volume,
      voice: updatedSettings.voice !== 'default' ? updatedSettings.voice : null
    })
  }

  // Обработчик тестирования голоса
  const handleTestVoice = () => {
    const testTexts = {
      'ru-RU': 'Привет! Это тест голоса для озвучивания книг. Как вам звучит этот голос?',
      'en-US': 'Hello! This is a voice test for reading books aloud. How does this voice sound to you?',
      'en-GB': 'Hello! This is a voice test for reading books aloud. How does this voice sound to you?',
      'es-ES': '¡Hola! Esta es una prueba de voz para leer libros en voz alta. ¿Cómo te suena esta voz?',
      'fr-FR': 'Bonjour! Ceci est un test de voix pour lire des livres à haute voix. Comment cette voix vous sonne-t-elle?',
      'de-DE': 'Hallo! Dies ist ein Stimmtest zum Vorlesen von Büchern. Wie klingt diese Stimme für Sie?',
      'it-IT': 'Ciao! Questo è un test vocale per leggere libri ad alta voce. Come ti suona questa voce?',
      'pt-BR': 'Olá! Este é um teste de voz para ler livros em voz alta. Como esta voz soa para você?',
      'zh-CN': '你好！这是朗读书籍的语音测试。这个声音听起来怎么样？',
      'ja-JP': 'こんにちは！これは本を音読するための音声テストです。この声はいかがですか？',
      'ko-KR': '안녕하세요! 이것은 책을 소리 내어 읽기 위한 음성 테스트입니다. 이 목소리가 어떻게 들리나요?'
    }

    const testText = testTexts[voiceSettings.language as keyof typeof testTexts] || testTexts['en-US']
    tts.speak(testText, voiceSettings.language)
  }

  // Navigation handling
  const handleSectionChange = (section: string) => {
    setActiveSection(section)
    setIsReading(false)
  }

  // Book interaction handlers
  const handleBookRead = (bookId: string) => {
    const book = books.find(b => b.id === bookId)
    if (book) {
      setCurrentBook(book)
      setIsReading(true)
    }
  }

  const handleBookDetails = (bookId: string) => {
    console.log('Showing details for book:', bookId)
    // This could open a book details modal or navigate to a details page
  }

  const handleBookAdd = () => {
    setIsBookAddDialogOpen(true)
  }

  const handleBookAdded = (bookData: any) => {
    // Generate a unique ID for the new book
    const newId = Date.now().toString()
    
    // Create new book object
    const newBook: BookData = {
      id: newId,
      title: bookData.title,
      author: bookData.author,
      genre: bookData.genre || 'Без жанра',
      progress: 0,
      coverUrl: bookData.cover instanceof File 
        ? URL.createObjectURL(bookData.cover) 
        : bookData.cover,
      dateAdded: new Date()
    }

    // Add to books collection
    setBooks(prevBooks => [newBook, ...prevBooks])
    
    // Show success notification (you could implement a toast system)
    console.log('Книга добавлена:', newBook)
    
    // Optionally switch to library view to show the new book
    if (activeSection !== 'library') {
      setActiveSection('library')
    }
  }

  // Search and sorting handlers
  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
  }

  const handleSortChange = (newSortBy: 'dateAdded' | 'title' | 'author' | 'progress') => {
    setSortBy(newSortBy)
  }

  // Reading interface handlers
  const handleBackFromReading = () => {
    setIsReading(false)
    setCurrentBook(null)
  }

  const handlePageChange = (page: number) => {
    console.log('Page changed to:', page)
    // Update reading progress if needed
  }

  const handleReadingSettingsChange = (newSettings: typeof readingSettings) => {
    setReadingSettings(newSettings)
  }

  // Collection handlers
  const handleCollectionCreate = (name: string) => {
    console.log('Creating collection:', name)
    // Add collection creation logic
  }

  const handleCollectionSelect = (collection: any) => {
    console.log('Selected collection:', collection)
    // Show collection contents
  }

  // Filter books based on active section
  const getFilteredBooks = () => {
    switch (activeSection) {
      case 'reading':
        return books.filter(book => book.progress > 0 && book.progress < 100)
      case 'favorites':
        // For now, showing high-rated books as favorites
        return books.filter(book => book.progress > 50)
      default:
        return books
    }
  }

  // Main content renderer
  const renderMainContent = () => {
    if (isReading && currentBook) {
      return (
        <ReadingInterface
          bookTitle={currentBook.title}
          currentPage={Math.floor((currentBook.progress / 100) * 245) + 1}
          totalPages={245}
          onBack={handleBackFromReading}
          onPageChange={handlePageChange}
          onSettingsChange={handleReadingSettingsChange}
          initialSettings={readingSettings}
        />
      )
    }

    switch (activeSection) {
      case 'library':
      case 'reading':
      case 'favorites':
        return (
          <div className="flex-1 p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-display font-bold text-foreground mb-2">
                {activeSection === 'library' && 'Моя библиотека'}
                {activeSection === 'reading' && 'Читаю сейчас'}
                {activeSection === 'favorites' && 'Избранное'}
              </h1>
              <p className="text-muted-foreground">
                {activeSection === 'library' && 'Все ваши книги в одном месте'}
                {activeSection === 'reading' && 'Продолжите чтение начатых книг'}
                {activeSection === 'favorites' && 'Ваши любимые произведения'}
              </p>
            </div>
            <BookLibraryGrid
              books={getFilteredBooks()}
              onBookRead={handleBookRead}
              onBookDetails={handleBookDetails}
              onBookAdd={handleBookAdd}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              sortBy={sortBy}
              onSortChange={handleSortChange}
            />
          </div>
        )

      case 'collections':
        return (
          <div className="flex-1">
            <CollectionsManager
              onCollectionCreate={handleCollectionCreate}
              onCollectionSelect={handleCollectionSelect}
              onBookAdd={handleBookAdd}
            />
          </div>
        )

      case 'search':
        return (
          <div className="flex-1">
            <SearchInterface
              books={books.map(book => ({
                id: book.id,
                title: book.title,
                author: book.author,
                genre: book.genre,
                description: `Произведение ${book.author} из жанра "${book.genre}"`,
                cover: book.coverUrl || '',
                format: 'epub' as const,
                status: book.progress === 100 ? 'completed' as const : 
                        book.progress > 0 ? 'reading' as const : 'unread' as const,
                rating: Math.floor(Math.random() * 2) + 4,
                progress: book.progress
              }))}
              onBookClick={(book) => handleBookRead(book.id)}
            />
          </div>
        )

      default:
        return (
          <div className="flex-1 p-8">
            <BookLibraryGrid
              books={books}
              onBookRead={handleBookRead}
              onBookDetails={handleBookDetails}
              onBookAdd={handleBookAdd}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              sortBy={sortBy}
              onSortChange={handleSortChange}
            />
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        <SidebarNavigation
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          isDarkMode={isDarkMode}
          onThemeToggle={handleThemeToggle}
          onBookAdd={handleBookAdd}
        />
        {renderMainContent()}
      </div>

      {/* Book Add Dialog */}
      <BookAddDialog
        isOpen={isBookAddDialogOpen}
        onClose={() => setIsBookAddDialogOpen(false)}
        onBookAdded={handleBookAdded}
        collections={collections}
      />
    </div>
  )
}