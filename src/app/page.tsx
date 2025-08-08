"use client"

import React, { useState, useEffect } from 'react'
import SidebarNavigation from '@/components/app/sidebar-navigation'
import BookLibraryGrid from '@/components/app/book-library-grid'
import ReadingInterface from '@/components/app/reading-interface'
import SearchInterface from '@/components/app/search-interface'
import CollectionsManager from '@/components/app/collections-manager'
import { BookAddDialog } from '@/components/app/book-add-dialog'
import { useTextToSpeech } from '@/lib/hooks/useSpeechSynthesis'

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
    language: voiceSettings.language,
    voiceURI: voiceSettings.voice !== 'default' ? voiceSettings.voice : undefined,
    rate: voiceSettings.speed,
    pitch: voiceSettings.pitch,
    volume: voiceSettings.volume
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
    const languageVoices = tts.getVoicesByLanguage(voiceSettings.language)
    return [
      { id: 'default', name: 'Системный голос по умолчанию' },
      ...languageVoices.map(voice => ({
        id: voice.voiceURI,
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

  // Обновление TTS настроек при изменении voiceSettings
  useEffect(() => {
    tts.updateSettings({
      language: voiceSettings.language,
      voiceURI: voiceSettings.voice !== 'default' ? voiceSettings.voice : undefined,
      rate: voiceSettings.speed,
      pitch: voiceSettings.pitch,
      volume: voiceSettings.volume
    })
  }, [voiceSettings, tts])

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
    tts.testVoice(testText)
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

      case 'settings':
        return (
          <div className="flex-1 p-8">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-display font-bold text-foreground mb-2">
                Настройки
              </h1>
              <p className="text-muted-foreground mb-8">
                Персонализируйте ваш опыт чтения
              </p>
              
              <div className="space-y-8">
                {/* Внешний вид */}
                <div className="bg-card p-6 rounded-lg border">
                  <h2 className="text-xl font-display font-semibold mb-4">Внешний вид</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Темная тема</label>
                        <p className="text-xs text-muted-foreground">
                          Переключение между светлой и темной темой
                        </p>
                      </div>
                      <button
                        onClick={handleThemeToggle}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          isDarkMode ? 'bg-primary' : 'bg-muted'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                            isDarkMode ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Чтение */}
                <div className="bg-card p-6 rounded-lg border">
                  <h2 className="text-xl font-display font-semibold mb-4">Чтение</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Размер шрифта по умолчанию
                      </label>
                      <select className="w-full p-2 border border-border rounded-md bg-input">
                        <option>16px (Маленький)</option>
                        <option selected>18px (Средний)</option>
                        <option>20px (Большой)</option>
                        <option>22px (Очень большой)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Шрифт по умолчанию
                      </label>
                      <select className="w-full p-2 border border-border rounded-md bg-input">
                        <option selected>Georgia (Serif)</option>
                        <option>Inter (Sans-serif)</option>
                        <option>System Font</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Озвучивание книг */}
                <div className="bg-card p-6 rounded-lg border">
                  <h2 className="text-xl font-display font-semibold mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                    Озвучивание книг
                  </h2>
                  
                  {!tts.state.isSupported && (
                    <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        ⚠️ Озвучивание не поддерживается в вашем браузере
                      </p>
                    </div>
                  )}
                  
                  {tts.state.error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                      <p className="text-sm text-red-800 dark:text-red-200">
                        {tts.state.error}
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Включить озвучивание</label>
                        <p className="text-xs text-muted-foreground">
                          Автоматическое чтение текста вслух
                        </p>
                      </div>
                      <button
                        onClick={() => handleVoiceSettingsChange({ enabled: !voiceSettings.enabled })}
                        disabled={!tts.state.isSupported}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          voiceSettings.enabled && tts.state.isSupported ? 'bg-primary' : 'bg-muted'
                        } ${!tts.state.isSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                            voiceSettings.enabled && tts.state.isSupported ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {voiceSettings.enabled && tts.state.isSupported && (
                      <>
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Язык озвучивания
                          </label>
                          <select 
                            value={voiceSettings.language}
                            onChange={(e) => handleVoiceSettingsChange({ language: e.target.value, voice: 'default' })}
                            className="w-full p-2 border border-border rounded-md bg-input"
                          >
                            {availableLanguages.map(lang => (
                              <option key={lang.code} value={lang.code}>{lang.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Голос
                          </label>
                          <select 
                            value={voiceSettings.voice}
                            onChange={(e) => handleVoiceSettingsChange({ voice: e.target.value })}
                            className="w-full p-2 border border-border rounded-md bg-input"
                            disabled={tts.state.isLoading}
                          >
                            {getAvailableVoices().map(voice => (
                              <option key={voice.id} value={voice.id}>{voice.name}</option>
                            ))}
                          </select>
                          {tts.state.isLoading && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Загружаются доступные голоса...
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Скорость речи: {voiceSettings.speed}x
                          </label>
                          <input
                            type="range"
                            min="0.5"
                            max="2.0"
                            step="0.1"
                            value={voiceSettings.speed}
                            onChange={(e) => handleVoiceSettingsChange({ speed: parseFloat(e.target.value) })}
                            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>Медленно</span>
                            <span>Нормально</span>
                            <span>Быстро</span>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Тон голоса: {voiceSettings.pitch}
                          </label>
                          <input
                            type="range"
                            min="0.5"
                            max="1.5"
                            step="0.1"
                            value={voiceSettings.pitch}
                            onChange={(e) => handleVoiceSettingsChange({ pitch: parseFloat(e.target.value) })}
                            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>Низкий</span>
                            <span>Обычный</span>
                            <span>Высокий</span>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Громкость: {Math.round(voiceSettings.volume * 100)}%
                          </label>
                          <input
                            type="range"
                            min="0.1"
                            max="1.0"
                            step="0.1"
                            value={voiceSettings.volume}
                            onChange={(e) => handleVoiceSettingsChange({ volume: parseFloat(e.target.value) })}
                            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>Тихо</span>
                            <span>Громко</span>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-border">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={handleTestVoice}
                              disabled={tts.state.isSpeaking}
                              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {tts.state.isSpeaking ? (
                                <>
                                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                  Говорит...
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                  </svg>
                                  Протестировать голос
                                </>
                              )}
                            </button>
                            
                            {tts.state.isSpeaking && (
                              <button
                                onClick={tts.stop}
                                className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/90 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v4H9z" />
                                </svg>
                                Остановить
                              </button>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
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