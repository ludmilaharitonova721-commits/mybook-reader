"use client"

import React, { useState, useRef, useEffect } from 'react'
import { motion, useTransform, useScroll, AnimatePresence } from 'motion/react'
import { ArrowLeft, Settings, ChevronLeft, ChevronRight, Minus, Plus, Type, Palette, AlignLeft, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TextToSpeechControls } from '@/components/app/text-to-speech-controls'
import { useLanguage } from '@/contexts/language-context'

interface ReadingSettings {
  fontSize: number
  fontFamily: string
  theme: string
  lineHeight: number
  margin: number
}

interface ReadingInterfaceProps {
  bookTitle?: string
  content?: string
  currentPage?: number
  totalPages?: number
  onBack?: () => void
  onPageChange?: (page: number) => void
  onSettingsChange?: (settings: ReadingSettings) => void
  initialSettings?: ReadingSettings
}

export default function ReadingInterface({
  bookTitle = "Война и мир",
  content = "Глава I\n\n— Eh bien, mon prince, Gênes et Lucques ne sont plus que des apanages, des поместья, de la famille Buonaparte. Non, je vous préviens, que si vous ne me dites pas que nous avons la guerre, si vous vous permettez encore de pallier toutes les infamies, toutes les atrocités de cet Antichrist (ma parole, j'y crois) — je ne vous connais plus, vous n'êtes plus mon ami, vous n'êtes plus мой верный раб, comme vous dites. Ну, здравствуйте, здравствуйте. Je vois que je vous fais peur, садитесь и рассказывайте.\n\nТак говорила в июле 1805 года известная Анна Павловна Шерер, фрейлина и приближенная императрицы, встречая важного и чиновного князя Василия, первого приехавшего на ее вечер. Анна Павловна кашляла несколько дней, у ней был грипп, как она говорила (грипп был тогда новое слово, употреблявшееся только редкими).\n\nНа лице у Анны Павловны было то особенное выражение элегантной скуки, которое бывает только на лице надоевших светских женщин. Она подошла к князю лениво, как подходят светские женщины, — не уменьшая шага и как будто невольно.",
  currentPage = 1,
  totalPages = 245,
  onBack,
  onPageChange,
  onSettingsChange,
  initialSettings = {
    fontSize: 18,
    fontFamily: 'georgia',
    theme: 'light',
    lineHeight: 1.6,
    margin: 32
  }
}: ReadingInterfaceProps) {
  const [settings, setSettings] = useState<ReadingSettings>(initialSettings)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [highlightedWord, setHighlightedWord] = useState<{word: string, index: number} | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)
  const { t } = useLanguage()
  
  const { scrollYProgress } = useScroll({ container: contentRef })
  const progress = useTransform(scrollYProgress, [0, 1], [0, 100])

  useEffect(() => {
    onSettingsChange?.(settings)
  }, [settings, onSettingsChange])

  useEffect(() => {
    let timeout: NodeJS.Timeout
    const resetTimeout = () => {
      clearTimeout(timeout)
      setShowControls(true)
      timeout = setTimeout(() => setShowControls(false), 3000)
    }

    const handleMouseMove = () => resetTimeout()
    const handleTouchStart = () => resetTimeout()
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('touchstart', handleTouchStart)
    
    resetTimeout()

    return () => {
      clearTimeout(timeout)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('touchstart', handleTouchStart)
    }
  }, [])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX
    const diff = touchStartX.current - touchEndX.current
    
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentPage < totalPages) {
        onPageChange?.(currentPage + 1)
      } else if (diff < 0 && currentPage > 1) {
        onPageChange?.(currentPage - 1)
      }
    }
  }

  const updateSetting = <K extends keyof ReadingSettings>(key: K, value: ReadingSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleWordHighlight = (word: string, index: number) => {
    setHighlightedWord({ word, index })
  }

  const fontFamilyOptions = [
    { value: 'georgia', label: 'Georgia', style: 'font-serif' },
    { value: 'times', label: 'Times New Roman', style: 'font-serif' },
    { value: 'inter', label: 'Inter', style: 'font-[var(--font-display)]' },
    { value: 'system', label: 'System', style: 'font-sans' }
  ]

  const themeOptions = [
    { value: 'light', label: t('reader.lightTheme'), bg: 'bg-background', text: 'text-foreground' },
    { value: 'sepia', label: t('reader.sepiaTheme'), bg: 'bg-amber-50', text: 'text-amber-950' },
    { value: 'dark', label: t('reader.darkTheme'), bg: 'bg-slate-900', text: 'text-slate-50' },
    { value: 'night', label: 'Ночь', bg: 'bg-black', text: 'text-green-400' }
  ]

  const getThemeClasses = () => {
    switch (settings.theme) {
      case 'sepia': return 'bg-amber-50 text-amber-950'
      case 'dark': return 'bg-slate-900 text-slate-50'
      case 'night': return 'bg-black text-green-400'
      default: return 'bg-background text-foreground'
    }
  }

  const getFontClass = () => {
    const font = fontFamilyOptions.find(f => f.value === settings.fontFamily)
    return font?.style || 'font-reading'
  }

  // Function to highlight words during TTS
  const highlightTextContent = (text: string) => {
    if (!highlightedWord) return text

    const words = text.split(' ')
    return words.map((word, index) => {
      if (index === highlightedWord.index) {
        return `<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 py-0.5 rounded">${word}</mark>`
      }
      return word
    }).join(' ')
  }

  return (
    <div className={`fixed inset-0 z-50 ${getThemeClasses()} flex flex-col`}>
      {/* Верхняя панель */}
      <AnimatePresence>
        {showControls && (
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center justify-between p-4 border-b border-border/10 backdrop-blur-sm bg-background/80"
          >
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('common.back')}
            </Button>
            
            <h1 className="font-[var(--font-display)] font-semibold text-lg truncate max-w-md text-center">
              {bookTitle}
            </h1>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsSettingsOpen(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Основная область чтения */}
      <div 
        ref={contentRef}
        className="flex-1 overflow-y-auto px-4 py-8 scrollbar-hide"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <article 
          className={`max-w-[65ch] mx-auto ${getFontClass()}`}
          style={{
            fontSize: `${settings.fontSize}px`,
            lineHeight: settings.lineHeight,
            paddingLeft: `${settings.margin}px`,
            paddingRight: `${settings.margin}px`
          }}
        >
          {content.split('\n').map((paragraph, index) => (
            paragraph.trim() ? (
              <p 
                key={index} 
                className="mb-4 text-justify leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: highlightTextContent(paragraph)
                }}
              />
            ) : (
              <div key={index} className="h-4" />
            )
          ))}
        </article>
      </div>

      {/* Нижняя панель */}
      <AnimatePresence>
        {showControls && (
          <motion.footer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="p-4 border-t border-border/10 backdrop-blur-sm bg-background/80"
          >
            <div className="flex items-center justify-between mb-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => currentPage > 1 && onPageChange?.(currentPage - 1)}
                disabled={currentPage <= 1}
                className="text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="font-[var(--font-display)] text-sm text-muted-foreground">
                {currentPage} из {totalPages}
              </span>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => currentPage < totalPages && onPageChange?.(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <motion.div 
                className="h-full bg-primary rounded-full"
                style={{ width: `${(currentPage / totalPages) * 100}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${(currentPage / totalPages) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.footer>
        )}
      </AnimatePresence>

      {/* Text-to-Speech Controls */}
      <TextToSpeechControls 
        text={content}
        onWordHighlight={handleWordHighlight}
      />

      {/* Панель настроек */}
      <AnimatePresence>
        {isSettingsOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsSettingsOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-80 bg-card border-l border-border z-50 overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-[var(--font-display)] font-semibold text-lg">{t('reader.settings')}</h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setIsSettingsOpen(false)}
                  >
                    ×
                  </Button>
                </div>
                
                <div className="space-y-6">
                  {/* Размер шрифта */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center gap-2 text-sm font-medium">
                        <Type className="h-4 w-4" />
                        {t('reader.fontSize')}
                      </label>
                      <span className="text-xs text-muted-foreground">{settings.fontSize}px</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => settings.fontSize > 12 && updateSetting('fontSize', settings.fontSize - 1)}
                        disabled={settings.fontSize <= 12}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Slider
                        value={[settings.fontSize]}
                        onValueChange={([value]) => updateSetting('fontSize', value)}
                        min={12}
                        max={24}
                        step={1}
                        className="flex-1"
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => settings.fontSize < 24 && updateSetting('fontSize', settings.fontSize + 1)}
                        disabled={settings.fontSize >= 24}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Шрифт */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium mb-3">
                      <Type className="h-4 w-4" />
                      {t('reader.fontFamily')}
                    </label>
                    <Select value={settings.fontFamily} onValueChange={(value) => updateSetting('fontFamily', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontFamilyOptions.map(font => (
                          <SelectItem key={font.value} value={font.value}>
                            <span className={font.style}>{font.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Цветовая тема */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium mb-3">
                      <Palette className="h-4 w-4" />
                      {t('reader.theme')}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {themeOptions.map(theme => (
                        <button
                          key={theme.value}
                          onClick={() => updateSetting('theme', theme.value)}
                          className={`p-3 rounded-lg border-2 transition-colors ${
                            settings.theme === theme.value 
                              ? 'border-primary' 
                              : 'border-border hover:border-muted-foreground'
                          } ${theme.bg} ${theme.text}`}
                        >
                          <div className="text-xs font-medium">{theme.label}</div>
                          <div className="text-xs opacity-70 mt-1">Aa</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Межстрочный интервал */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center gap-2 text-sm font-medium">
                        <AlignLeft className="h-4 w-4" />
                        {t('reader.lineHeight')}
                      </label>
                      <span className="text-xs text-muted-foreground">{settings.lineHeight}</span>
                    </div>
                    <Slider
                      value={[settings.lineHeight]}
                      onValueChange={([value]) => updateSetting('lineHeight', value)}
                      min={1.2}
                      max={2.0}
                      step={0.1}
                    />
                  </div>

                  {/* Ширина полей */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium">{t('reader.margin')}</label>
                      <span className="text-xs text-muted-foreground">{settings.margin}px</span>
                    </div>
                    <Slider
                      value={[settings.margin]}
                      onValueChange={([value]) => updateSetting('margin', value)}
                      min={0}
                      max={64}
                      step={8}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}