// Keep the legacy .tsx import path as a thin re-export so there is only one hook implementation.
export { default, useTextToSpeech } from './use-text-to-speech'
export type {
  LanguageVoice,
  TTSCallbacks,
  TTSConfig,
  TTSProgress,
  TTSSettings,
  TTSState,
  UseTextToSpeechReturn,
} from './use-text-to-speech'
