import { useState, useEffect, useCallback, useRef } from 'react';

// TypeScript interfaces
export interface VoiceSettings {
  rate: number;
  pitch: number;
  volume: number;
  voice: SpeechSynthesisVoice | null;
  language: string;
}

export interface SpeechState {
  speaking: boolean;
  paused: boolean;
  stopped: boolean;
  loading: boolean;
  error: string | null;
}

export interface SpeechProgress {
  currentWordIndex: number;
  characterIndex: number;
  percentage: number;
  elapsedTime: number;
  currentWord: string;
  totalWords: number;
}

export interface WordBoundaryEvent {
  charIndex: number;
  charLength: number;
  elapsedTime: number;
  name: string;
  text: string;
  utterance: SpeechSynthesisUtterance;
}

export interface TextToSpeechHookReturn {
  // State
  state: SpeechState;
  progress: SpeechProgress;
  settings: VoiceSettings;
  voices: SpeechSynthesisVoice[];
  availableLanguages: string[];
  isSupported: boolean;

  // Methods
  speak: (text: string, options?: Partial<VoiceSettings>) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  updateSettings: (newSettings: Partial<VoiceSettings>) => void;
  getVoicesByLanguage: (language: string) => SpeechSynthesisVoice[];

  // Event handlers
  onWordBoundary?: (event: WordBoundaryEvent) => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onSpeechError?: (error: string) => void;
}

export interface UseTextToSpeechOptions {
  defaultLanguage?: string;
  autoSaveSettings?: boolean;
  storageKey?: string;
  onWordBoundary?: (event: WordBoundaryEvent) => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onSpeechError?: (error: string) => void;
  enableKeyboardShortcuts?: boolean;
}

const DEFAULT_SETTINGS: VoiceSettings = {
  rate: 1,
  pitch: 1,
  volume: 1,
  voice: null,
  language: 'en-US'
};

const SUPPORTED_LANGUAGES = [
  'en-US', 'en-GB', 'ru-RU', 'es-ES', 'fr-FR', 
  'de-DE', 'it-IT', 'pt-BR', 'zh-CN', 'ja-JP'
];

export const useTextToSpeech = (options: UseTextToSpeechOptions = {}): TextToSpeechHookReturn => {
  const {
    defaultLanguage = 'en-US',
    autoSaveSettings = true,
    storageKey = 'tts-settings',
    onWordBoundary,
    onSpeechStart,
    onSpeechEnd,
    onSpeechError,
    enableKeyboardShortcuts = true
  } = options;

  // Refs
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const startTimeRef = useRef<number>(0);
  const wordsRef = useRef<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // State
  const [isSupported] = useState(() => 'speechSynthesis' in window);
  
  const [state, setState] = useState<SpeechState>({
    speaking: false,
    paused: false,
    stopped: true,
    loading: false,
    error: null
  });

  const [progress, setProgress] = useState<SpeechProgress>({
    currentWordIndex: 0,
    characterIndex: 0,
    percentage: 0,
    elapsedTime: 0,
    currentWord: '',
    totalWords: 0
  });

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [settings, setSettings] = useState<VoiceSettings>(() => {
    if (autoSaveSettings && typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          return { ...DEFAULT_SETTINGS, ...JSON.parse(saved), language: defaultLanguage };
        } catch {
          return { ...DEFAULT_SETTINGS, language: defaultLanguage };
        }
      }
    }
    return { ...DEFAULT_SETTINGS, language: defaultLanguage };
  });

  // Available languages based on loaded voices
  const availableLanguages = useState(() => {
    return SUPPORTED_LANGUAGES.filter(lang => 
      voices.some(voice => voice.lang.startsWith(lang.split('-')[0]))
    );
  })[0];

  // Load voices
  const loadVoices = useCallback(() => {
    if (!isSupported) return;
    
    const availableVoices = speechSynthesis.getVoices();
    setVoices(availableVoices);
    
    // Set default voice if none selected
    if (!settings.voice && availableVoices.length > 0) {
      const preferredVoice = availableVoices.find(voice => 
        voice.lang.startsWith(settings.language.split('-')[0])
      ) || availableVoices[0];
      
      setSettings(prev => ({ ...prev, voice: preferredVoice }));
    }
  }, [isSupported, settings.voice, settings.language]);

  // Get voices by language
  const getVoicesByLanguage = useCallback((language: string): SpeechSynthesisVoice[] => {
    return voices.filter(voice => voice.lang.startsWith(language.split('-')[0]));
  }, [voices]);

  // Update progress tracking
  const updateProgress = useCallback(() => {
    if (!utteranceRef.current || state.stopped) return;
    
    const elapsedTime = Date.now() - startTimeRef.current;
    setProgress(prev => ({ ...prev, elapsedTime }));
  }, [state.stopped]);

  // Start progress tracking
  const startProgressTracking = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(updateProgress, 100);
  }, [updateProgress]);

  // Stop progress tracking
  const stopProgressTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Handle word boundary events
  const handleWordBoundary = useCallback((event: SpeechSynthesisEvent) => {
    const charIndex = event.charIndex || 0;
    const text = utteranceRef.current?.text || '';
    const words = wordsRef.current;
    
    // Calculate current word index
    let currentWordIndex = 0;
    let charCount = 0;
    
    for (let i = 0; i < words.length; i++) {
      if (charCount + words[i].length > charIndex) {
        currentWordIndex = i;
        break;
      }
      charCount += words[i].length + 1; // +1 for space
    }
    
    const percentage = words.length > 0 ? (currentWordIndex / words.length) * 100 : 0;
    const currentWord = words[currentWordIndex] || '';
    
    setProgress(prev => ({
      ...prev,
      currentWordIndex,
      characterIndex: charIndex,
      percentage,
      currentWord,
      totalWords: words.length
    }));

    // Call external callback
    if (onWordBoundary) {
      const wordBoundaryEvent: WordBoundaryEvent = {
        charIndex,
        charLength: currentWord.length,
        elapsedTime: Date.now() - startTimeRef.current,
        name: 'boundary',
        text: currentWord,
        utterance: utteranceRef.current!
      };
      onWordBoundary(wordBoundaryEvent);
    }
  }, [onWordBoundary]);

  // Handle speech events
  const handleSpeechStart = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      speaking: true, 
      paused: false, 
      stopped: false, 
      loading: false,
      error: null 
    }));
    startTimeRef.current = Date.now();
    startProgressTracking();
    onSpeechStart?.();
  }, [startProgressTracking, onSpeechStart]);

  const handleSpeechEnd = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      speaking: false, 
      paused: false, 
      stopped: true 
    }));
    stopProgressTracking();
    onSpeechEnd?.();
  }, [stopProgressTracking, onSpeechEnd]);

  const handleSpeechError = useCallback((event: SpeechSynthesisErrorEvent) => {
    const errorMessage = `Speech synthesis error: ${event.error}`;
    setState(prev => ({ 
      ...prev, 
      speaking: false, 
      loading: false, 
      error: errorMessage 
    }));
    stopProgressTracking();
    onSpeechError?.(errorMessage);
  }, [stopProgressTracking, onSpeechError]);

  const handleSpeechPause = useCallback(() => {
    setState(prev => ({ ...prev, paused: true, speaking: false }));
    stopProgressTracking();
  }, [stopProgressTracking]);

  const handleSpeechResume = useCallback(() => {
    setState(prev => ({ ...prev, paused: false, speaking: true }));
    startProgressTracking();
  }, [startProgressTracking]);

  // Main speak function
  const speak = useCallback(async (text: string, options?: Partial<VoiceSettings>): Promise<void> => {
    if (!isSupported) {
      const error = 'Speech synthesis is not supported in this browser';
      setState(prev => ({ ...prev, error }));
      onSpeechError?.(error);
      return;
    }

    // Stop any current speech
    speechSynthesis.cancel();

    const finalSettings = { ...settings, ...options };
    
    setState(prev => ({ ...prev, loading: true, error: null }));

    // Prepare text and words
    const cleanText = text.replace(/\s+/g, ' ').trim();
    const words = cleanText.split(' ');
    wordsRef.current = words;

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance;

    // Apply settings
    utterance.rate = Math.max(0.1, Math.min(10, finalSettings.rate));
    utterance.pitch = Math.max(0, Math.min(2, finalSettings.pitch));
    utterance.volume = Math.max(0, Math.min(1, finalSettings.volume));
    
    if (finalSettings.voice) {
      utterance.voice = finalSettings.voice;
    }
    
    utterance.lang = finalSettings.language;

    // Set up event listeners
    utterance.onstart = handleSpeechStart;
    utterance.onend = handleSpeechEnd;
    utterance.onerror = handleSpeechError;
    utterance.onpause = handleSpeechPause;
    utterance.onresume = handleSpeechResume;
    utterance.onboundary = handleWordBoundary;

    // Initialize progress
    setProgress({
      currentWordIndex: 0,
      characterIndex: 0,
      percentage: 0,
      elapsedTime: 0,
      currentWord: words[0] || '',
      totalWords: words.length
    });

    // Start speaking
    try {
      speechSynthesis.speak(utterance);
    } catch (error) {
      const errorMessage = `Failed to start speech synthesis: ${error}`;
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      onSpeechError?.(errorMessage);
    }
  }, [isSupported, settings, handleSpeechStart, handleSpeechEnd, handleSpeechError, 
      handleSpeechPause, handleSpeechResume, handleWordBoundary, onSpeechError]);

  // Control functions
  const pause = useCallback(() => {
    if (isSupported && speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
    }
  }, [isSupported]);

  const resume = useCallback(() => {
    if (isSupported && speechSynthesis.paused) {
      speechSynthesis.resume();
    }
  }, [isSupported]);

  const stop = useCallback(() => {
    if (isSupported) {
      speechSynthesis.cancel();
      stopProgressTracking();
      setState(prev => ({ 
        ...prev, 
        speaking: false, 
        paused: false, 
        stopped: true,
        loading: false 
      }));
      setProgress(prev => ({ ...prev, percentage: 0, currentWordIndex: 0 }));
    }
  }, [isSupported, stopProgressTracking]);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<VoiceSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    
    if (autoSaveSettings) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (error) {
        console.warn('Failed to save TTS settings:', error);
      }
    }
  }, [settings, autoSaveSettings, storageKey]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case ' ':
            event.preventDefault();
            if (state.speaking) {
              pause();
            } else if (state.paused) {
              resume();
            }
            break;
          case 'Escape':
            event.preventDefault();
            stop();
            break;
          default:
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [enableKeyboardShortcuts, state.speaking, state.paused, pause, resume, stop]);

  // Load voices on mount and when voices change
  useEffect(() => {
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
    
    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, [loadVoices]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      speechSynthesis.cancel();
      stopProgressTracking();
    };
  }, [stopProgressTracking]);

  return {
    // State
    state,
    progress,
    settings,
    voices,
    availableLanguages,
    isSupported,

    // Methods
    speak,
    pause,
    resume,
    stop,
    updateSettings,
    getVoicesByLanguage,

    // Event handlers (passed through)
    onWordBoundary,
    onSpeechStart,
    onSpeechEnd,
    onSpeechError
  };
};