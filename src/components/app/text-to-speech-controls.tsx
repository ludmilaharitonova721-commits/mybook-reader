"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Pause,
  Square,
  Volume2,
  Settings,
  ChevronDown,
  Mic,
  SkipForward,
  SkipBack,
  RotateCcw,
  Maximize2,
  Minimize2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";

interface TextToSpeechControlsProps {
  text: string;
  className?: string;
  onWordHighlight?: (word: string, index: number) => void;
}

export const TextToSpeechControls = ({ text, className, onWordHighlight }: TextToSpeechControlsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFloating, setIsFloating] = useState(true);
  const [currentLanguage] = useState("ru-RU");

  const tts = useTextToSpeech({
    defaultLanguage: currentLanguage,
    onWordBoundary: (charIndex, word) => onWordHighlight?.(word, charIndex),
  });
  const languageVoices = tts.getVoicesForLanguage(currentLanguage);

  if (!tts.isSupported) {
    return <div className="text-center p-4 text-muted-foreground">Синтез речи не поддерживается в этом браузере.</div>;
  }

  const handlePlayPause = () => {
    if (tts.state.speaking) tts.pause();
    else if (tts.state.paused) tts.resume();
    else void tts.speak(text, currentLanguage);
  };

  const speechState = tts.state.speaking ? "speaking" : tts.state.paused ? "paused" : "stopped";

  if (isFloating && !isExpanded) {
    return (
      <div className={cn("fixed bottom-6 right-6 z-50", className)}>
        <div className="flex flex-col items-end space-y-2">
          {tts.progress.progress > 0 && (
            <div className="bg-background/90 backdrop-blur-sm rounded-full p-2 shadow-lg border">
              <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${tts.progress.progress}%` }} />
              </div>
            </div>
          )}
          <Button size="lg" onClick={handlePlayPause} className={cn(
            "h-14 w-14 rounded-full shadow-lg transition-all duration-300",
            speechState === "speaking" && "bg-orange-500 hover:bg-orange-600",
            speechState === "paused" && "bg-yellow-500 hover:bg-yellow-600"
          )} aria-label={speechState === "speaking" ? "Приостановить озвучивание" : "Начать озвучивание"}>
            {speechState === "speaking" ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setIsExpanded(true)} className="h-10 w-10 rounded-full bg-background/90 backdrop-blur-sm shadow-lg border" aria-label="Настройки озвучивания">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn("transition-all duration-300", isFloating ? "fixed bottom-6 right-6 w-80 z-50 shadow-lg" : "w-full", className)}>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={cn("w-2 h-2 rounded-full", speechState === "speaking" && "bg-green-500 animate-pulse", speechState === "paused" && "bg-yellow-500", speechState === "stopped" && "bg-gray-400")} />
            <span className="text-sm font-medium">{speechState === "speaking" ? "Озвучивается" : speechState === "paused" ? "Приостановлено" : "Готов"}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Button size="sm" variant="ghost" onClick={() => setIsFloating(!isFloating)} aria-label="Изменить расположение">
              {isFloating ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            {isFloating && <Button size="sm" variant="ghost" onClick={() => setIsExpanded(false)} aria-label="Свернуть"><ChevronDown className="h-4 w-4" /></Button>}
          </div>
        </div>

        <div className="flex items-center justify-center space-x-2">
          <Button size="sm" variant="outline" onClick={() => { tts.stop(); void tts.speak(text, currentLanguage); }} aria-label="Начать сначала"><SkipBack className="h-4 w-4" /></Button>
          <Button size="sm" variant="outline" onClick={tts.stop} aria-label="Остановить"><Square className="h-4 w-4" /></Button>
          <Button size="lg" onClick={handlePlayPause} className={cn(speechState === "speaking" && "bg-orange-500 hover:bg-orange-600", speechState === "paused" && "bg-yellow-500 hover:bg-yellow-600")}>
            {speechState === "speaking" ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          <Button size="sm" variant="outline" onClick={() => { tts.stop(); void tts.speak(text, currentLanguage); }} aria-label="Повторить"><RotateCcw className="h-4 w-4" /></Button>
          <Button size="sm" variant="outline" onClick={() => undefined} aria-label="Следующий фрагмент"><SkipForward className="h-4 w-4" /></Button>
        </div>

        {tts.progress.progress > 0 && (
          <div className="space-y-2">
            <Progress value={tts.progress.progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground"><span>{Math.round(tts.progress.progress)}%</span><span>Время: {tts.progress.elapsedTime}с</span></div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between"><label className="text-sm font-medium">Скорость</label><span className="text-sm text-muted-foreground">{tts.settings.rate}x</span></div>
          <Slider value={[tts.settings.rate]} onValueChange={(values) => tts.updateSettings({ rate: values[0] })} min={0.5} max={2} step={0.1} className="w-full" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between"><label className="text-sm font-medium flex items-center space-x-2"><Volume2 className="h-4 w-4" /><span>Громкость</span></label><span className="text-sm text-muted-foreground">{Math.round(tts.settings.volume * 100)}%</span></div>
          <Slider value={[tts.settings.volume]} onValueChange={(values) => tts.updateSettings({ volume: values[0] })} min={0} max={1} step={0.1} className="w-full" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center space-x-2"><Mic className="h-4 w-4" /><span>Голос (RU)</span></label>
          <Select value={tts.settings.voice ?? "default"} onValueChange={(value) => tts.updateSettings({ voice: value === "default" ? null : value })}>
            <SelectTrigger><SelectValue placeholder="Выберите голос" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="default">По умолчанию</SelectItem>
              {languageVoices.map(({ voice, name, language }) => <SelectItem key={`${name}-${language}`} value={name}><div className="flex items-center justify-between w-full"><span>{name}</span><span className="text-xs text-muted-foreground ml-2">{language}</span></div></SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {tts.state.speaking && <div className="text-center p-2 bg-muted rounded-md"><p className="text-xs text-muted-foreground mb-1">Читается:</p><p className="font-medium text-primary">{tts.progress.currentWord || "…"}</p></div>}
        {tts.state.error && <p role="alert" className="text-sm text-destructive">{tts.state.error}</p>}
        <div className="text-xs text-muted-foreground text-center"><p>Ctrl+Пробел (воспроизведение/пауза), Escape (стоп)</p></div>
      </div>
    </Card>
  );
};
