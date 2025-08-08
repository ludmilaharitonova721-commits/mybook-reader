"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

export interface VoiceSettings {
  language: string;
  voiceURI?: string;
  rate: number;
  pitch: number;
  volume: number;
}

export interface SpeechState {
  isSupported: boolean;
  isLoading: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  currentText: string;
  error: string | null;
}

export interface UseTextToSpeechReturn {
  state: SpeechState;
  voices: SpeechSynthesisVoice[];
  speak: (text: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  testVoice: (sampleText?: string) => void;
  getVoicesByLanguage: (language: string) => SpeechSynthesisVoice[];
  updateSettings: (settings: Partial<VoiceSettings>) => void;
}

const DEFAULT_SAMPLE_TEXT = "Hello, this is a test of the text-to-speech voice. How does this sound?";

export const useTextToSpeech = (initialSettings: VoiceSettings): UseTextToSpeechReturn => {
  const [state, setState] = useState<SpeechState>({
    isSupported: false,
    isLoading: true,
    isSpeaking: false,
    isPaused: false,
    currentText: '',
    error: null,
  });

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [settings, setSettings] = useState<VoiceSettings>(initialSettings);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechSynthesis = useRef<SpeechSynthesis | null>(null);

  // Initialize speech synthesis and check browser support
  useEffect(() => {
    const initializeSpeechSynthesis = () => {
      if (typeof window === 'undefined') {
        setState(prev => ({ 
          ...prev, 
          isSupported: false, 
          isLoading: false,
          error: 'Speech synthesis not available on server side'
        }));
        return;
      }

      if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
        setState(prev => ({ 
          ...prev, 
          isSupported: false, 
          isLoading: false,
          error: 'Speech synthesis not supported in this browser'
        }));
        return;
      }

      speechSynthesis.current = window.speechSynthesis;
      setState(prev => ({ ...prev, isSupported: true }));
      
      // Load voices
      loadVoices();
    };

    initializeSpeechSynthesis();
  }, []);

  // Load available voices
  const loadVoices = useCallback(() => {
    if (!speechSynthesis.current) return;

    const loadVoicesAsync = () => {
      const availableVoices = speechSynthesis.current!.getVoices();
      
      if (availableVoices.length === 0) {
        // Some browsers load voices asynchronously
        setTimeout(loadVoicesAsync, 100);
        return;
      }

      setVoices(availableVoices);
      setState(prev => ({ ...prev, isLoading: false }));
    };

    loadVoicesAsync();

    // Listen for voice changes (some browsers fire this event when voices are loaded)
    const handleVoicesChanged = () => {
      const availableVoices = speechSynthesis.current!.getVoices();
      setVoices(availableVoices);
      setState(prev => ({ ...prev, isLoading: false }));
    };

    speechSynthesis.current.addEventListener('voiceschanged', handleVoicesChanged);

    return () => {
      speechSynthesis.current?.removeEventListener('voiceschanged', handleVoicesChanged);
    };
  }, []);

  // Create utterance with current settings
  const createUtterance = useCallback((text: string): SpeechSynthesisUtterance => {
    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;
    utterance.lang = settings.language;

    // Set specific voice if selected
    if (settings.voiceURI) {
      const selectedVoice = voices.find(voice => voice.voiceURI === settings.voiceURI);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    return utterance;
  }, [settings, voices]);

  // Stop speech function - defined first to avoid circular dependency
  const stop = useCallback(() => {
    if (!speechSynthesis.current) return;

    try {
      speechSynthesis.current.cancel();
      setState(prev => ({ 
        ...prev, 
        isSpeaking: false, 
        isPaused: false, 
        currentText: '',
        error: null 
      }));
      utteranceRef.current = null;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: `Failed to stop speech: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }));
    }
  }, []);

  // Speak text
  const speak = useCallback((text: string) => {
    if (!speechSynthesis.current || !state.isSupported) {
      setState(prev => ({ 
        ...prev, 
        error: 'Speech synthesis not supported' 
      }));
      return;
    }

    // Stop any current speech
    stop();

    try {
      const utterance = createUtterance(text);
      utteranceRef.current = utterance;

      utterance.onstart = () => {
        setState(prev => ({ 
          ...prev, 
          isSpeaking: true, 
          isPaused: false, 
          currentText: text,
          error: null 
        }));
      };

      utterance.onend = () => {
        setState(prev => ({ 
          ...prev, 
          isSpeaking: false, 
          isPaused: false, 
          currentText: '' 
        }));
        utteranceRef.current = null;
      };

      utterance.onerror = (event) => {
        setState(prev => ({ 
          ...prev, 
          isSpeaking: false, 
          isPaused: false,
          currentText: '',
          error: `Speech synthesis error: ${event.error}` 
        }));
        utteranceRef.current = null;
      };

      utterance.onpause = () => {
        setState(prev => ({ ...prev, isPaused: true }));
      };

      utterance.onresume = () => {
        setState(prev => ({ ...prev, isPaused: false }));
      };

      speechSynthesis.current.speak(utterance);
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: `Failed to start speech synthesis: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }));
    }
  }, [state.isSupported, createUtterance, stop]);

  // Pause speech
  const pause = useCallback(() => {
    if (!speechSynthesis.current || !state.isSpeaking || state.isPaused) return;

    try {
      speechSynthesis.current.pause();
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: `Failed to pause speech: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }));
    }
  }, [state.isSpeaking, state.isPaused]);

  // Resume speech
  const resume = useCallback(() => {
    if (!speechSynthesis.current || !state.isPaused) return;

    try {
      speechSynthesis.current.resume();
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: `Failed to resume speech: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }));
    }
  }, [state.isPaused]);

  // Test voice with sample text
  const testVoice = useCallback((sampleText: string = DEFAULT_SAMPLE_TEXT) => {
    speak(sampleText);
  }, [speak]);

  // Get voices filtered by language
  const getVoicesByLanguage = useCallback((language: string): SpeechSynthesisVoice[] => {
    return voices.filter(voice => 
      voice.lang.startsWith(language.toLowerCase()) || 
      voice.lang.startsWith(language.split('-')[0].toLowerCase())
    );
  }, [voices]);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<VoiceSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    
    // Clear any existing errors when settings change
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (speechSynthesis.current) {
        speechSynthesis.current.cancel();
      }
    };
  }, []);

  return {
    state,
    voices,
    speak,
    pause,
    resume,
    stop,
    testVoice,
    getVoicesByLanguage,
    updateSettings,
  };
};