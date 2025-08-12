import { useState, useCallback, useRef, useEffect } from 'react'

export interface TTSSettings {
  rate: number
  pitch: number
  volume: number
  voice?: SpeechSynthesisVoice
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
}

export type TTSState = 'idle' | 'speaking' | 'paused' | 'error'

export interface UseTextToSpeechReturn {
  state: TTSState
  isSupported: boolean
  voices: SpeechSynthesisVoice[]
  currentSettings: TTSSettings
  speak: (text: string, language?: string) => Promise<void>
  pause: () => void
  resume: () => void
  stop: () => void
  updateSettings: (newSettings: Partial<TTSSettings>) => void
  error: string | null
}

const DEFAULT_SETTINGS: TTSSettings = {
  rate: 1,
  pitch: 1,
  volume: 1,
  voice: undefined
}

export const useTextToSpeech = (config: TTSConfig = {}): UseTextToSpeechReturn => {
  const [state, setState] = useState<TTSState>('idle')
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [error, setError] = useState<string | null>(null)
  const [currentSettings, setCurrentSettings] = useState<TTSSettings>({
    ...DEFAULT_SETTINGS,
    ...config.settings
  })

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const callbacksRef = useRef<TTSCallbacks>(config.callbacks || {})

  // Update callbacks ref when config changes
  useEffect(() => {
    callbacksRef.current = config.callbacks || {}
  }, [config.callbacks])

  // Check if SpeechSynthesis is supported
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

  // Load available voices
  const loadVoices = useCallback(() => {
    if (!isSupported) return

    const availableVoices = speechSynthesis.getVoices()
    setVoices(availableVoices)

    // Set default voice if none is selected
    if (!currentSettings.voice && availableVoices.length > 0) {
      const defaultVoice = availableVoices.find(voice => voice.default) || availableVoices[0]
      setCurrentSettings(prev => ({ ...prev, voice: defaultVoice }))
    }
  }, [isSupported, currentSettings.voice])

  // Initialize voices on mount and when voices change
  useEffect(() => {
    if (!isSupported) return

    loadVoices()

    // Some browsers load voices asynchronously
    const handleVoicesChanged = () => loadVoices()
    speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged)

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged)
    }
  }, [isSupported, loadVoices])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSupported && speechSynthesis.speaking) {
        speechSynthesis.cancel()
      }
    }
  }, [isSupported])

  const speak = useCallback(async (text: string, language?: string): Promise<void> => {
    if (!isSupported) {
      const error = new Error('Speech synthesis is not supported in this browser')
      setError(error.message)
      callbacksRef.current.onError?.(error)
      setState('error')
      return Promise.reject(error)
    }

    if (!text.trim()) {
      const error = new Error('Text cannot be empty')
      setError(error.message)
      callbacksRef.current.onError?.(error)
      setState('error')
      return Promise.reject(error)
    }

    // Cancel any ongoing speech
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel()
    }

    return new Promise((resolve, reject) => {
      try {
        const utterance = new SpeechSynthesisUtterance(text)
        utteranceRef.current = utterance

        // Apply settings
        utterance.rate = currentSettings.rate
        utterance.pitch = currentSettings.pitch
        utterance.volume = currentSettings.volume
        
        if (currentSettings.voice) {
          utterance.voice = currentSettings.voice
        }

        if (language) {
          utterance.lang = language
        }

        // Set up event listeners
        utterance.onstart = () => {
          setState('speaking')
          setError(null)
          callbacksRef.current.onStart?.()
        }

        utterance.onend = () => {
          setState('idle')
          callbacksRef.current.onEnd?.()
          resolve()
        }

        utterance.onerror = (event) => {
          setState('error')
          const errorMessage = `Speech synthesis error: ${event.error}`
          setError(errorMessage)
          callbacksRef.current.onError?.(event)
          reject(new Error(errorMessage))
        }

        utterance.onpause = () => {
          setState('paused')
          callbacksRef.current.onPause?.()
        }

        utterance.onresume = () => {
          setState('speaking')
          callbacksRef.current.onResume?.()
        }

        utterance.onboundary = (event) => {
          callbacksRef.current.onBoundary?.(event)
        }

        // Start speaking
        speechSynthesis.speak(utterance)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error occurred')
        setState('error')
        setError(error.message)
        callbacksRef.current.onError?.(error)
        reject(error)
      }
    })
  }, [isSupported, currentSettings])

  const pause = useCallback(() => {
    if (!isSupported) return

    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause()
    }
  }, [isSupported])

  const resume = useCallback(() => {
    if (!isSupported) return

    if (speechSynthesis.paused) {
      speechSynthesis.resume()
    }
  }, [isSupported])

  const stop = useCallback(() => {
    if (!isSupported) return

    if (speechSynthesis.speaking) {
      speechSynthesis.cancel()
      setState('idle')
      utteranceRef.current = null
    }
  }, [isSupported])

  const updateSettings = useCallback((newSettings: Partial<TTSSettings>) => {
    setCurrentSettings(prev => ({
      ...prev,
      ...newSettings
    }))
  }, [])

  return {
    state,
    isSupported,
    voices,
    currentSettings,
    speak,
    pause,
    resume,
    stop,
    updateSettings,
    error
  }
}