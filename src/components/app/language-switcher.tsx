"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, Globe, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

interface LanguageSwitcherProps {
  className?: string;
  variant?: "dropdown" | "compact" | "inline";
  showFlags?: boolean;
  showNativeNames?: boolean;
  onLanguageChange?: (languageCode: string) => void;
  currentLanguage?: string;
}

const languages: Language[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇵🇹" },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺" },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
];

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className,
  variant = "dropdown",
  showFlags = true,
  showNativeNames = true,
  onLanguageChange,
  currentLanguage = "en",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);

  const currentLang = languages.find(lang => lang.code === selectedLanguage) || languages[0];

  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    onLanguageChange?.(languageCode);
    setIsOpen(false);
    
    // Store selection in localStorage for persistence
    localStorage.setItem("preferred-language", languageCode);
  };

  // Load persisted language on component mount
  React.useEffect(() => {
    const storedLanguage = localStorage.getItem("preferred-language");
    if (storedLanguage && languages.some(lang => lang.code === storedLanguage)) {
      setSelectedLanguage(storedLanguage);
      onLanguageChange?.(storedLanguage);
    }
  }, [onLanguageChange]);

  if (variant === "compact") {
    return (
      <div className={cn("relative", className)}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "h-8 w-8 p-0 rounded-md transition-all duration-200",
            "hover:bg-accent/10 hover:text-primary",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          )}
          aria-label={`Current language: ${currentLang.name}. Click to change language`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          {showFlags ? (
            <span className="text-lg" role="img" aria-label={currentLang.name}>
              {currentLang.flag}
            </span>
          ) : (
            <Globe className="h-4 w-4" />
          )}
        </Button>

        {isOpen && (
          <div 
            className={cn(
              "absolute top-full right-0 z-50 mt-2 min-w-[200px]",
              "bg-popover border border-border rounded-lg shadow-lg",
              "animate-in slide-in-from-top-2 duration-200"
            )}
            role="listbox"
            aria-label="Select language"
          >
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language.code)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 text-sm",
                  "hover:bg-accent/5 transition-colors duration-150",
                  "first:rounded-t-lg last:rounded-b-lg",
                  "focus:outline-none focus:bg-accent/10",
                  selectedLanguage === language.code && "bg-accent/5"
                )}
                role="option"
                aria-selected={selectedLanguage === language.code}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleLanguageSelect(language.code);
                  }
                }}
              >
                {showFlags && (
                  <span className="text-lg" role="img" aria-label="">
                    {language.flag}
                  </span>
                )}
                <div className="flex flex-col items-start">
                  <span className="font-medium text-foreground">
                    {language.name}
                  </span>
                  {showNativeNames && language.name !== language.nativeName && (
                    <span className="text-xs text-muted-foreground">
                      {language.nativeName}
                    </span>
                  )}
                </div>
                {selectedLanguage === language.code && (
                  <Check className="ml-auto h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        )}

        {isOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
        )}
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Globe className="h-4 w-4 text-muted-foreground" />
        <Select
          value={selectedLanguage}
          onValueChange={handleLanguageSelect}
        >
          <SelectTrigger 
            className="w-auto border-none bg-transparent shadow-none focus:ring-0 px-0 gap-1"
            aria-label="Select language"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {languages.map((language) => (
              <SelectItem
                key={language.code}
                value={language.code}
                className="flex items-center gap-2"
              >
                <div className="flex items-center gap-2">
                  {showFlags && (
                    <span className="text-sm" role="img" aria-label="">
                      {language.flag}
                    </span>
                  )}
                  <span>{language.name}</span>
                  {showNativeNames && language.name !== language.nativeName && (
                    <span className="text-xs text-muted-foreground ml-1">
                      ({language.nativeName})
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div className={cn("relative", className)}>
      <Select
        value={selectedLanguage}
        onValueChange={handleLanguageSelect}
      >
        <SelectTrigger 
          className={cn(
            "w-full min-w-[160px] bg-background border-border",
            "hover:bg-accent/5 transition-colors duration-200",
            "focus:ring-2 focus:ring-primary focus:ring-offset-2"
          )}
          aria-label="Select language"
        >
          <div className="flex items-center gap-2">
            {showFlags && (
              <span className="text-lg" role="img" aria-label="">
                {currentLang.flag}
              </span>
            )}
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">
                {currentLang.name}
              </span>
              {showNativeNames && currentLang.name !== currentLang.nativeName && (
                <span className="text-xs text-muted-foreground">
                  {currentLang.nativeName}
                </span>
              )}
            </div>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </SelectTrigger>
        <SelectContent 
          className="w-[var(--radix-select-trigger-width)] max-h-[300px]"
          sideOffset={4}
        >
          {languages.map((language) => (
            <SelectItem
              key={language.code}
              value={language.code}
              className={cn(
                "flex items-center gap-2 cursor-pointer",
                "hover:bg-accent/5 focus:bg-accent/10",
                "transition-colors duration-150"
              )}
            >
              <div className="flex items-center gap-3 w-full">
                {showFlags && (
                  <span className="text-lg" role="img" aria-label="">
                    {language.flag}
                  </span>
                )}
                <div className="flex flex-col items-start flex-1">
                  <span className="font-medium text-foreground">
                    {language.name}
                  </span>
                  {showNativeNames && language.name !== language.nativeName && (
                    <span className="text-xs text-muted-foreground">
                      {language.nativeName}
                    </span>
                  )}
                </div>
                {selectedLanguage === language.code && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};