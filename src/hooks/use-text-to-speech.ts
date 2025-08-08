"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

interface SpeechSettings {
  rate: number;
  pitch: number;
  volume: number;
  voice: string | null;
  autoDetectLanguage: boolean;
}

interface SpeechState {
  speaking: boolean;
  paused: boolean;
  stopped: boolean;
  loading: boolean;
  error: string | null;
}

interface VoiceInfo {
  voice: SpeechSynthesisVoice;
  language: string;
  name: string;
}

interface SpeechProgress {
  currentWordIndex: number;
  currentSentenceIndex: number;
  progress: number;
  elapsedTime: number;
}

interface SpeechCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onError?: (error: string) => void;
  onWordBoundary?: (charIndex: number, word: string) => void;
  onSentenceBoundary?: (sentenceIndex: number, sentence: string) => void;
  onProgress?: (progress: SpeechProgress) => void;
}

interface TextChunk {
  text: string;
  startIndex: number;
  endIndex: number;
}

interface QueueItem {
  id: string;
  text: string;
  language?: string;
  priority: number;
}

const DEFAULT_SETTINGS: SpeechSettings = {
  rate: 1,
  pitch: 1,
  volume: 0.8,
  voice: null,
  autoDetectLanguage: true,
};

const CHUNK_SIZE = 200; // Maximum characters per chunk
const SETTINGS_KEY = 'text-to-speech-settings';

export const useTextToSpeech = (callbacks?: SpeechCallbacks) => {
  const [isSupported, setIsSupported] = useState(false);
  const [settings, setSettings] = useState<SpeechSettings>(DEFAULT_SETTINGS);
  const [state, setState] = useState<SpeechState>({
    speaking: false,
    paused: false,
    stopped: true,
    loading: false,
    error: null,
  });
  const [availableVoices, setAvailableVoices] = useState<VoiceInfo[]>([]);
  const [progress, setProgress] = useState<SpeechProgress>({
    currentWordIndex: 0,
    currentSentenceIndex: 0,
    progress: 0,
    elapsedTime: 0,
  });
  const [queue, setQueue] = useState<QueueItem[]>([]);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const currentTextRef = useRef<string>('');
  const chunksRef = useRef<TextChunk[]>([]);
  const currentChunkIndexRef = useRef(0);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
      synthRef.current = window.speechSynthesis;
      
      // Load saved settings
      const savedSettings = localStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        } catch (error) {
          console.warn('Failed to parse saved speech settings:', error);
        }
      }

      // Load voices
      loadVoices();
      
      // Handle voices changed event
      if (synthRef.current.onvoiceschanged !== undefined) {
        synthRef.current.onvoiceschanged = loadVoices;
      }
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const loadVoices = useCallback(() => {
    if (!synthRef.current) return;

    const voices = synthRef.current.getVoices();
    const voiceInfo: VoiceInfo[] = voices.map(voice => ({
      voice,
      language: voice.lang,
      name: voice.name,
    }));

    setAvailableVoices(voiceInfo);

    // Auto-select first voice if none selected
    if (!settings.voice && voiceInfo.length > 0) {
      setSettings(prev => ({ ...prev, voice: voiceInfo[0].voice.name }));
    }
  }, [settings.voice]);

  const detectLanguage = useCallback((text: string): string => {
    // Simple language detection based on character patterns
    const cyrillicPattern = /[\u0400-\u04FF]/;
    const latinPattern = /[a-zA-Z]/;
    
    if (cyrillicPattern.test(text)) {
      return 'ru-RU';
    } else if (latinPattern.test(text)) {
      return 'en-US';
    }
    
    return 'en-US'; // Default fallback
  }, []);

  const getVoiceForLanguage = useCallback((language: string): SpeechSynthesisVoice | null => {
    if (!availableVoices.length) return null;

    // First, try to find exact match
    let voice = availableVoices.find(v => v.language === language)?.voice;
    
    // If no exact match, try language code without region
    if (!voice) {
      const langCode = language.split('-')[0];
      voice = availableVoices.find(v => v.language.startsWith(langCode))?.voice;
    }

    // If still no match, use currently selected voice or first available
    if (!voice) {
      if (settings.voice) {
        voice = availableVoices.find(v => v.name === settings.voice)?.voice;
      }
      if (!voice && availableVoices.length > 0) {
        voice = availableVoices[0].voice;
      }
    }

    return voice || null;
  }, [availableVoices, settings.voice]);

  const createTextChunks = useCallback((text: string): TextChunk[] => {
    const chunks: TextChunk[] = [];
    let startIndex = 0;

    while (startIndex < text.length) {
      let endIndex = Math.min(startIndex + CHUNK_SIZE, text.length);
      
      // Try to end at sentence boundary
      if (endIndex < text.length) {
        const sentenceEnd = text.lastIndexOf('.', endIndex);
        const questionEnd = text.lastIndexOf('?', endIndex);
        const exclamationEnd = text.lastIndexOf('!', endIndex);
        
        const lastSentenceEnd = Math.max(sentenceEnd, questionEnd, exclamationEnd);
        if (lastSentenceEnd > startIndex) {
          endIndex = lastSentenceEnd + 1;
        } else {
          // Try to end at word boundary
          const lastSpace = text.lastIndexOf(' ', endIndex);
          if (lastSpace > startIndex) {
            endIndex = lastSpace;
          }
        }
      }

      chunks.push({
        text: text.slice(startIndex, endIndex).trim(),
        startIndex,
        endIndex,
      });

      startIndex = endIndex;
    }

    return chunks;
  }, []);

  const createUtterance = useCallback((text: string, language?: string): SpeechSynthesisUtterance => {
    const utterance = new SpeechSynthesisUtterance(text);
    
    const detectedLanguage = language || (settings.autoDetectLanguage ? detectLanguage(text) : 'en-US');
    const voice = getVoiceForLanguage(detectedLanguage);
    
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;
    utterance.lang = detectedLanguage;

    return utterance;
  }, [settings, detectLanguage, getVoiceForLanguage]);

  const speak = useCallback((text: string, language?: string) => {
    if (!isSupported || !synthRef.current) {
      setState(prev => ({ ...prev, error: 'Speech synthesis not supported' }));
      callbacks?.onError?.('Speech synthesis not supported');
      return;
    }

    // Stop any current speech
    stop();

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      currentTextRef.current = text;
      chunksRef.current = createTextChunks(text);
      currentChunkIndexRef.current = 0;
      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;

      setProgress({
        currentWordIndex: 0,
        currentSentenceIndex: 0,
        progress: 0,
        elapsedTime: 0,
      });

      speakChunk(0, language);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      callbacks?.onError?.(errorMessage);
    }
  }, [isSupported, createTextChunks, createUtterance, callbacks]);

  const speakChunk = useCallback((chunkIndex: number, language?: string) => {
    if (!synthRef.current || chunkIndex >= chunksRef.current.length) {
      // All chunks completed
      setState(prev => ({
        ...prev,
        speaking: false,
        paused: false,
        stopped: true,
        loading: false,
      }));
      callbacks?.onEnd?.();
      processQueue();
      return;
    }

    const chunk = chunksRef.current[chunkIndex];
    const utterance = createUtterance(chunk.text, language);

    utterance.onstart = () => {
      setState(prev => ({
        ...prev,
        speaking: true,
        paused: false,
        stopped: false,
        loading: false,
      }));
      
      if (chunkIndex === 0) {
        callbacks?.onStart?.();
      }
    };

    utterance.onend = () => {
      currentChunkIndexRef.current++;
      speakChunk(currentChunkIndexRef.current, language);
    };

    utterance.onerror = (event) => {
      const errorMessage = `Speech error: ${event.error}`;
      setState(prev => ({
        ...prev,
        speaking: false,
        paused: false,
        stopped: true,
        loading: false,
        error: errorMessage,
      }));
      callbacks?.onError?.(errorMessage);
    };

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const charIndex = chunk.startIndex + event.charIndex;
        const word = chunk.text.substring(event.charIndex, event.charIndex + event.charLength);
        callbacks?.onWordBoundary?.(charIndex, word);

        // Update progress
        const totalProgress = (chunk.startIndex + event.charIndex) / currentTextRef.current.length;
        const elapsedTime = Date.now() - startTimeRef.current - pausedTimeRef.current;
        
        setProgress(prev => ({
          ...prev,
          currentWordIndex: charIndex,
          progress: totalProgress * 100,
          elapsedTime: Math.floor(elapsedTime / 1000),
        }));
        
        callbacks?.onProgress?.({
          currentWordIndex: charIndex,
          currentSentenceIndex: prev.currentSentenceIndex,
          progress: totalProgress * 100,
          elapsedTime: Math.floor(elapsedTime / 1000),
        });
      }
    };

    currentUtteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  }, [createUtterance, callbacks]);

  const pause = useCallback(() => {
    if (!synthRef.current || !state.speaking) return;

    synthRef.current.pause();
    pausedTimeRef.current = Date.now();
    
    setState(prev => ({ ...prev, paused: true, speaking: false }));
    callbacks?.onPause?.();
  }, [state.speaking, callbacks]);

  const resume = useCallback(() => {
    if (!synthRef.current || !state.paused) return;

    synthRef.current.resume();
    
    // Adjust paused time calculation
    const pauseDuration = Date.now() - pausedTimeRef.current;
    pausedTimeRef.current = pausedTimeRef.current + pauseDuration;
    
    setState(prev => ({ ...prev, paused: false, speaking: true }));
    callbacks?.onResume?.();
  }, [state.paused, callbacks]);

  const stop = useCallback(() => {
    if (!synthRef.current) return;

    synthRef.current.cancel();
    currentUtteranceRef.current = null;
    
    setState(prev => ({
      ...prev,
      speaking: false,
      paused: false,
      stopped: true,
      loading: false,
    }));

    setProgress({
      currentWordIndex: 0,
      currentSentenceIndex: 0,
      progress: 0,
      elapsedTime: 0,
    });
  }, []);

  const addToQueue = useCallback((item: QueueItem) => {
    setQueue(prev => [...prev, item].sort((a, b) => b.priority - a.priority));
  }, []);

  const processQueue = useCallback(() => {
    if (queue.length === 0) return;

    const nextItem = queue[0];
    setQueue(prev => prev.slice(1));
    speak(nextItem.text, nextItem.language);
  }, [queue, speak]);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<SpeechSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const getVoicesForLanguage = useCallback((language: string): VoiceInfo[] => {
    const langCode = language.split('-')[0];
    return availableVoices.filter(v => 
      v.language === language || v.language.startsWith(langCode)
    );
  }, [availableVoices]);

  return {
    // State
    isSupported,
    state,
    settings,
    availableVoices,
    progress,
    queue,
    
    // Controls
    speak,
    pause,
    resume,
    stop,
    
    // Settings
    updateSettings,
    getVoicesForLanguage,
    
    // Queue management
    addToQueue,
    processQueue,
    clearQueue,
    
    // Utilities
    detectLanguage,
  };
};