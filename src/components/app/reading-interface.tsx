"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Bookmark, Check, ChevronLeft, ChevronRight, Minus, Plus, Settings2, Type, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TextToSpeechControls } from "@/components/app/text-to-speech-controls";

interface ReadingSettings {
  fontSize: number;
  fontFamily: string;
  theme: string;
  lineHeight: number;
  margin: number;
}

interface ReadingInterfaceProps {
  bookTitle?: string;
  bookAuthor?: string;
  bookCover?: string;
  content?: string;
  currentPage?: number;
  totalPages?: number;
  onBack?: () => void;
  onPageChange?: (page: number) => void;
  onSettingsChange?: (settings: ReadingSettings) => void;
  initialSettings?: ReadingSettings;
}

const sampleContent = `Глава I\n\n— Eh bien, mon prince, Gênes et Lucques ne sont plus que des apanages, des поместья, de la famille Buonaparte. Non, je vous préviens, que si vous ne me dites pas que nous avons la guerre, si vous vous permettez encore de pallier toutes les infamies, toutes les atrocités de cet Antichrist (ma parole, j'y crois) — je ne vous connais plus, vous n'êtes plus mon ami, vous n'êtes plus мой верный раб, comme vous dites.\n\nТак говорила в июле 1805 года известная Анна Павловна Шерер, фрейлина и приближённая императрицы Марии Фёдоровны, встречая важного и чиновного князя Василия, первого приехавшего на её вечер.\n\nАнна Павловна кашляла несколько дней, у неё был грипп, как она говорила (грипп был тогда новое слово и употреблялся лишь редкими). В записках, разосланных утром с красным лакеем, было написано без различия во всех: «Si vous n'avez rien de mieux à faire, Monsieur le comte (или mon prince), et si la perspective de passer la soirée chez une pauvre malade ne vous effraie pas trop, je serai charmée de vous voir chez moi entre 7 et 10 heures. Annette Scherer».\n\n— Боже, какая резкая встреча! — сказал, не входя в комнату, князь, в придворном, шитом мундире, в чулках, башмаках и звёздах, с светлым выражением плоского лица. Он говорил на том изысканном французском языке, на котором не только говорили, но и думали наши деды.\n\nАнна Павловна встретила князя улыбкой, которая относилась к её лицу так же, как поднятая шаль к цветам. Она приветствовала его и произнесла: «Какое чудное время года для войны».`;

const themeClasses: Record<string, string> = {
  light: "bg-[#f8f6f0] text-[#29271f]",
  sepia: "bg-[#f1e6d2] text-[#453728]",
  dark: "bg-[#20211f] text-[#e9e5dc]",
  night: "bg-[#101310] text-[#c5d6b8]",
};

export default function ReadingInterface({
  bookTitle = "Война и мир",
  bookAuthor = "Лев Толстой",
  bookCover,
  content = sampleContent,
  currentPage = 1,
  totalPages = 245,
  onBack,
  onPageChange,
  onSettingsChange,
  initialSettings = { fontSize: 19, fontFamily: "georgia", theme: "sepia", lineHeight: 1.8, margin: 32 },
}: ReadingInterfaceProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [highlightedWord, setHighlightedWord] = useState("");
  const touchStartX = useRef(0);
  const progress = Math.min(100, Math.max(0, (currentPage / totalPages) * 100));

  useEffect(() => {
    onSettingsChange?.(settings);
  }, [settings, onSettingsChange]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSettingsOpen(false);
      if (event.key === "ArrowRight" && currentPage < totalPages) onPageChange?.(currentPage + 1);
      if (event.key === "ArrowLeft" && currentPage > 1) onPageChange?.(currentPage - 1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentPage, totalPages, onPageChange]);

  const updateSetting = <K extends keyof ReadingSettings>(key: K, value: ReadingSettings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const family = settings.fontFamily === "inter" ? "font-sans" : settings.fontFamily === "system" ? "font-sans" : "font-serif";
  const contentColor = settings.theme === "dark" || settings.theme === "night" ? "text-inherit" : "text-[#39362f]";
  const paragraphs = content.split("\n").filter((paragraph) => paragraph.trim());

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.99 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className={`reader-mobile-safe fixed inset-0 z-50 flex flex-col ${themeClasses[settings.theme] ?? themeClasses.sepia}`}
    >
      <header className="relative z-10 flex min-h-16 items-center justify-between border-b border-black/10 bg-white/45 px-3 backdrop-blur-xl dark:border-white/10 dark:bg-black/20 sm:px-6">
        <Button variant="ghost" onClick={onBack} className="shrink-0 gap-2 rounded-full px-3" aria-label="Вернуться в библиотеку">
          <ArrowLeft className="h-4 w-4" /><span className="hidden sm:inline">Библиотека</span>
        </Button>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-2 px-2 sm:gap-3">
          {bookCover && <img src={bookCover} alt="" className="hidden h-10 w-7 rounded object-cover shadow sm:block" />}
          <div className="min-w-0 text-center sm:text-left">
            <p className="truncate text-sm font-semibold sm:text-base">{bookTitle}</p>
            <p className="truncate text-xs opacity-65">{bookAuthor}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setBookmarked((value) => !value)} aria-label={bookmarked ? "Убрать закладку" : "Добавить закладку"} className="rounded-full">
            {bookmarked ? <Bookmark className="h-4 w-4 fill-current" /> : <Bookmark className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)} aria-label="Настройки чтения" className="rounded-full"><Settings2 className="h-4 w-4" /></Button>
        </div>
      </header>

      <main
        className="reader-mobile-safe flex-1 overflow-y-auto overscroll-contain px-4 py-8 sm:px-8 sm:py-12"
        onTouchStart={(event) => { touchStartX.current = event.touches[0]?.clientX ?? 0; }}
        onTouchEnd={(event) => {
          const diff = touchStartX.current - (event.changedTouches[0]?.clientX ?? touchStartX.current);
          if (Math.abs(diff) > 70) {
            if (diff > 0 && currentPage < totalPages) onPageChange?.(currentPage + 1);
            if (diff < 0 && currentPage > 1) onPageChange?.(currentPage - 1);
          }
        }}
      >
        <motion.article
          key={currentPage}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24 }}
          className={`mx-auto w-full max-w-[66ch] ${family} ${contentColor}`}
          style={{ fontSize: `clamp(${Math.min(settings.fontSize, 17)}px, ${settings.fontSize}px, ${settings.fontSize}px)`, lineHeight: settings.lineHeight, paddingInline: `min(${settings.margin}px, 5vw)` }}
        >
          <div className="mb-10 text-center">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] opacity-50">{bookTitle}</p>
            <span className="mx-auto block h-px w-12 bg-current opacity-25" />
            <h1 className="mt-6 text-2xl font-medium tracking-wide sm:text-3xl">Глава первая</h1>
          </div>
          {paragraphs.map((paragraph, index) => (
            <p key={`${currentPage}-${index}`} className="mb-6 text-pretty leading-[inherit] first-letter:text-[1.08em]">
              {highlightedWord && index === 1 ? <><mark className="rounded bg-amber-300/60 px-0.5 text-inherit">{highlightedWord}</mark> {paragraph}</> : paragraph}
            </p>
          ))}
          <div className="my-12 flex items-center justify-center gap-3 opacity-35" aria-hidden="true"><span className="h-px w-10 bg-current" /><span className="text-xs">✦</span><span className="h-px w-10 bg-current" /></div>
          <p className="text-center text-xs opacity-50">— {currentPage} —</p>
        </motion.article>
      </main>

      <footer className="relative z-10 border-t border-black/10 bg-white/55 px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 backdrop-blur-xl dark:border-white/10 dark:bg-black/20 sm:px-8">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 rounded-full" onClick={() => currentPage > 1 && onPageChange?.(currentPage - 1)} disabled={currentPage <= 1} aria-label="Предыдущая страница"><ChevronLeft className="h-5 w-5" /></Button>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center justify-between text-[11px] opacity-65"><span>Прогресс чтения</span><span>{currentPage} / {totalPages} · {Math.round(progress)}%</span></div>
            <div className="h-1 overflow-hidden rounded-full bg-black/10 dark:bg-white/10"><motion.div className="h-full rounded-full bg-[#9a7858]" animate={{ width: `${progress}%` }} transition={{ duration: 0.35 }} /></div>
          </div>
          <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 rounded-full" onClick={() => currentPage < totalPages && onPageChange?.(currentPage + 1)} disabled={currentPage >= totalPages} aria-label="Следующая страница"><ChevronRight className="h-5 w-5" /></Button>
        </div>
      </footer>

      <TextToSpeechControls text={content} onWordHighlight={(word) => setHighlightedWord(word)} />

      <AnimatePresence>
        {settingsOpen && (
          <>
            <motion.button aria-label="Закрыть настройки" className="fixed inset-0 z-[60] bg-black/35 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSettingsOpen(false)} />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-labelledby="reader-settings-title"
              className="fixed inset-x-0 bottom-0 z-[61] max-h-[85dvh] overflow-y-auto rounded-t-3xl border border-border bg-card p-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] text-card-foreground shadow-2xl sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[min(24rem,100vw)] sm:rounded-none sm:rounded-l-3xl sm:p-7"
              initial={{ y: "8%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "8%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
            >
              <div className="mb-7 flex items-center justify-between">
                <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Настроить под себя</p><h2 id="reader-settings-title" className="mt-1 text-xl font-semibold">Вид страницы</h2></div>
                <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(false)} aria-label="Закрыть" className="rounded-full"><X className="h-4 w-4" /></Button>
              </div>
              <div className="space-y-7">
                <section>
                  <div className="mb-3 flex items-center justify-between"><label className="flex items-center gap-2 text-sm font-medium"><Type className="h-4 w-4" /> Размер шрифта</label><span className="text-xs text-muted-foreground">{settings.fontSize}px</span></div>
                  <div className="flex items-center gap-3"><Button variant="outline" size="icon" className="h-9 w-9 rounded-full" onClick={() => updateSetting("fontSize", Math.max(14, settings.fontSize - 1))} aria-label="Уменьшить шрифт"><Minus className="h-4 w-4" /></Button><input aria-label="Размер шрифта" type="range" min="14" max="28" step="1" value={settings.fontSize} onChange={(event) => updateSetting("fontSize", Number(event.target.value))} className="w-full accent-[#9a7858]" /><Button variant="outline" size="icon" className="h-9 w-9 rounded-full" onClick={() => updateSetting("fontSize", Math.min(28, settings.fontSize + 1))} aria-label="Увеличить шрифт"><Plus className="h-4 w-4" /></Button></div>
                </section>
                <section><label className="mb-3 block text-sm font-medium">Шрифт</label><Select value={settings.fontFamily} onValueChange={(value) => updateSetting("fontFamily", value)}><SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="georgia">Georgia — книжный</SelectItem><SelectItem value="times">Times New Roman</SelectItem><SelectItem value="inter">Inter — современный</SelectItem><SelectItem value="system">Системный</SelectItem></SelectContent></Select></section>
                <section><p className="mb-3 text-sm font-medium">Цвет страницы</p><div className="grid grid-cols-4 gap-2">{[{ id: "light", label: "Светлая", color: "bg-[#f8f6f0]" }, { id: "sepia", label: "Сепия", color: "bg-[#f1e6d2]" }, { id: "dark", label: "Тёмная", color: "bg-[#20211f]" }, { id: "night", label: "Ночь", color: "bg-[#101310]" }].map((theme) => <button key={theme.id} type="button" onClick={() => updateSetting("theme", theme.id)} className={`relative flex flex-col items-center gap-2 rounded-xl border p-2 text-[10px] ${settings.theme === theme.id ? "border-primary ring-2 ring-primary/20" : "border-border"}`}><span className={`h-9 w-full rounded-lg border border-black/10 ${theme.color}`} />{theme.label}{settings.theme === theme.id && <Check className="absolute right-2 top-2 h-3 w-3 text-primary" />}</button>)}</div></section>
                <section><div className="mb-3 flex items-center justify-between"><label className="text-sm font-medium">Межстрочный интервал</label><span className="text-xs text-muted-foreground">{settings.lineHeight.toFixed(1)}</span></div><input aria-label="Межстрочный интервал" type="range" min="1.3" max="2.1" step="0.1" value={settings.lineHeight} onChange={(event) => updateSetting("lineHeight", Number(event.target.value))} className="w-full accent-[#9a7858]" /></section>
                <section><div className="mb-3 flex items-center justify-between"><label className="text-sm font-medium">Поля страницы</label><span className="text-xs text-muted-foreground">{settings.margin}px</span></div><input aria-label="Поля страницы" type="range" min="0" max="56" step="4" value={settings.margin} onChange={(event) => updateSetting("margin", Number(event.target.value))} className="w-full accent-[#9a7858]" /></section>
              </div>
              <Button className="mt-8 w-full rounded-xl" onClick={() => setSettingsOpen(false)}>Готово</Button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
