import { useCallback, useEffect, useRef, useState } from 'react'

export interface TTSSettings {
  rate: number
  pitch: number
  volume: number
  voice: string | null
}

export interface TTSCallbacks {
  onStart?: () => void
  onEnd?: () => void
  onPause?: () => void
  onResume?: () => void
  onError?: (error: SpeechSynthesisErrorEvent | Error) => void
  onBoundary?: (event: SpeechSynthesisEvent) => void
}

export interface TTSConfig {
  settings?: Partial<TTSSettings>
  callbacks?: TTSCallbacks
  onStart?: () => void
  onEnd?: () => void
  onError?: (error: Error) => void
  onWordBoundary?: (charIndex: number, word: string) => void
  defaultLanguage?: string
}

export interface TTSState {
  speaking: boolean
  paused: boolean
  stopped: boolean
  loading: boolean
  error: string | null
}

export interface TTSProgress {
  progress: number
  currentWordIndex: number
  currentWord: string
  totalWords: number
  elapsedTime: number
}

export interface LanguageVoice {
  voice: SpeechSynthesisVoice
  name: string
  language: string
}

export interface UseTextToSpeechReturn {
  state: TTSState
  isSupported: boolean
  voices: SpeechSynthesisVoice[]
  settings: TTSSettings
  progress: TTSProgress
  speak: (text: string, language?: string) => Promise<void>
  pause: () => void
  resume: () => void
  stop: () => void
  updateSettings: (settings: Partial<TTSSettings>) => void
  getVoicesForLanguage: (language: string) => LanguageVoice[]
  getVoicesByLanguage: (language: string) => SpeechSynthesisVoice[]
}

const DEFAULT_SETTINGS: TTSSettings = { rate: 1, pitch: 1, volume: 0.8, voice: null }
const INITIAL_STATE: TTSState = { speaking: false, paused: false, stopped: true, loading: false, error: null }
const INITIAL_PROGRESS: TTSProgress = { progress: 0, currentWordIndex: 0, currentWord: '', totalWords: 0, elapsedTime: 0 }

export const useTextToSpeech = (config: TTSConfig = {}): UseTextToSpeechReturn => {
  const [isSupported, setIsSupported] = useState(false)
  const [state, setState] = useState<TTSState>(INITIAL_STATE)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [settings, setSettings] = useState<TTSSettings>(() => ({ ...DEFAULT_SETTINGS, ...config.settings }))
  const [progress, setProgress] = useState<TTSProgress>(INITIAL_PROGRESS)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const startedAtRef = useRef(0)
  const elapsedBeforePauseRef = useRef(0)
  const wordsRef = useRef<string[]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const callbacksRef = useRef(config)

  useEffect(() => { callbacksRef.current = config }, [config])

  const stopProgressTimer = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
  }, [])

  useEffect(() => {
    const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
    setIsSupported(supported)
    if (!supported) return
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices())
    loadVoices()
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
  }, [])

  const getVoicesByLanguage = useCallback((language: string) => {
    const prefix = language.split('-')[0].toLowerCase()
    return voices.filter((voice) => voice.lang.toLowerCase().startsWith(prefix))
  }, [voices])
  const getVoicesForLanguage = useCallback((language: string): LanguageVoice[] => getVoicesByLanguage(language).map((voice) => ({ voice, name: voice.name, language: voice.lang })), [getVoicesByLanguage])

  const updateSettings = useCallback((newSettings: Partial<TTSSettings>) => {
    setSettings((current) => {
      const updated = { ...current, ...newSettings }
      try { if (typeof window !== 'undefined') window.localStorage.setItem('voiceSettings', JSON.stringify(updated)) } catch { /* Settings still update for this session. */ }
      return updated
    })
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const saved = window.localStorage.getItem('voiceSettings')
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<TTSSettings> & { speed?: number; voice?: string | null }
        setSettings((current) => ({ ...current, ...parsed, rate: parsed.rate ?? parsed.speed ?? current.rate, voice: parsed.voice === 'default' ? null : parsed.voice ?? current.voice }))
      }
    } catch { /* Ignore malformed or unavailable persisted settings. */ }
  }, [])

  const speak = useCallback(async (text: string, language = config.defaultLanguage ?? 'ru-RU') => {
    const cleanText = text.replace(/\s+/g, ' ').trim()
    if (!cleanText) return
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      const error = new Error('Синтез речи не поддерживается в этом браузере')
      setState({ ...INITIAL_STATE, error: error.message })
      callbacksRef.current.onError?.(error)
      callbacksRef.current.callbacks?.onError?.(error)
      return
    }

    const synthesis = window.speechSynthesis
    synthesis.cancel()
    stopProgressTimer()
    const utterance = new SpeechSynthesisUtterance(cleanText)
    utteranceRef.current = utterance
    const selectedVoice = voices.find((voice) => voice.name === settings.voice) ?? voices.find((voice) => voice.lang.toLowerCase().startsWith(language.split('-')[0].toLowerCase()))
    utterance.voice = selectedVoice ?? null
    utterance.lang = language
    utterance.rate = Math.max(0.1, Math.min(10, settings.rate))
    utterance.pitch = Math.max(0, Math.min(2, settings.pitch))
    utterance.volume = Math.max(0, Math.min(1, settings.volume))
    wordsRef.current = cleanText.split(' ')
    elapsedBeforePauseRef.current = 0
    setProgress({ ...INITIAL_PROGRESS, totalWords: wordsRef.current.length, currentWord: wordsRef.current[0] ?? '' })
    setState({ ...INITIAL_STATE, loading: true })

    utterance.onstart = () => {
      startedAtRef.current = Date.now()
      setState({ speaking: true, paused: false, stopped: false, loading: false, error: null })
      stopProgressTimer()
      intervalRef.current = setInterval(() => setProgress((current) => ({ ...current, elapsedTime: Math.floor((elapsedBeforePauseRef.current + Date.now() - startedAtRef.current) / 1000) })), 250)
      callbacksRef.current.callbacks?.onStart?.()
      callbacksRef.current.onStart?.()
    }
    utterance.onboundary = (event) => {
      const words = wordsRef.current
      let wordIndex = 0
      let position = 0
      while (wordIndex < words.length - 1 && position + words[wordIndex].length <= event.charIndex) { position += words[wordIndex].length + 1; wordIndex += 1 }
      const word = words[wordIndex] ?? ''
      setProgress((current) => ({ ...current, currentWordIndex: wordIndex, currentWord: word, progress: words.length ? Math.min(100, (wordIndex / words.length) * 100) : 0 }))
      callbacksRef.current.onWordBoundary?.(event.charIndex, word)
      callbacksRef.current.callbacks?.onBoundary?.(event)
    }
    utterance.onpause = () => {
      elapsedBeforePauseRef.current += Date.now() - startedAtRef.current
      stopProgressTimer()
      setState((current) => ({ ...current, speaking: false, paused: true }))
      callbacksRef.current.callbacks?.onPause?.()
    }
    utterance.onresume = () => {
      startedAtRef.current = Date.now()
      setState((current) => ({ ...current, speaking: true, paused: false }))
      stopProgressTimer()
      intervalRef.current = setInterval(() => setProgress((current) => ({ ...current, elapsedTime: Math.floor((elapsedBeforePauseRef.current + Date.now() - startedAtRef.current) / 1000) })), 250)
      callbacksRef.current.callbacks?.onResume?.()
    }
    utterance.onend = () => {
      stopProgressTimer()
      setState({ ...INITIAL_STATE })
      setProgress((current) => ({ ...current, progress: 100 }))
      callbacksRef.current.callbacks?.onEnd?.()
      callbacksRef.current.onEnd?.()
    }
    utterance.onerror = (event) => {
      stopProgressTimer()
      const error = new Error(`Ошибка синтеза речи: ${event.error}`)
      setState({ ...INITIAL_STATE, error: error.message })
      callbacksRef.current.callbacks?.onError?.(event)
      callbacksRef.current.onError?.(error)
    }
    try { synthesis.speak(utterance) } catch (cause) {
      stopProgressTimer()
      const error = cause instanceof Error ? cause : new Error('Не удалось запустить синтез речи')
      setState({ ...INITIAL_STATE, error: error.message })
      callbacksRef.current.callbacks?.onError?.(error)
      callbacksRef.current.onError?.(error)
    }
  }, [config.defaultLanguage, settings, stopProgressTimer, voices])

  const pause = useCallback(() => { if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) window.speechSynthesis.pause() }, [])
  const resume = useCallback(() => { if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.paused) window.speechSynthesis.resume() }, [])
  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel()
    stopProgressTimer(); utteranceRef.current = null; elapsedBeforePauseRef.current = 0
    setState({ ...INITIAL_STATE }); setProgress(INITIAL_PROGRESS)
  }, [stopProgressTimer])
  useEffect(() => () => { stopProgressTimer(); if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel() }, [stopProgressTimer])

  return { state, isSupported, voices, settings, progress, speak, pause, resume, stop, updateSettings, getVoicesForLanguage, getVoicesByLanguage }
}

export default useTextToSpeech
