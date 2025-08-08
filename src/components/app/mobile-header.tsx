"use client";

import React, { useState, useEffect } from 'react';
import { Menu, Search, Plus, BookOpen, Settings, Sun, Moon, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';

interface MobileHeaderProps {
  currentPageTitle: string;
  isReading?: boolean;
  readingProgress?: number;
  onSearch?: () => void;
  onAddBook?: () => void;
  onToggleTheme?: () => void;
  isDarkMode?: boolean;
  userProfile?: {
    name: string;
    avatar?: string;
  };
}

export const MobileHeader = ({
  currentPageTitle,
  isReading = false,
  readingProgress = 0,
  onSearch,
  onAddBook,
  onToggleTheme,
  isDarkMode = false,
  userProfile = { name: 'User' }
}: MobileHeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentLanguage, setLanguage, t } = useLanguage();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ru', name: 'Русский' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' }
  ];

  const menuItems = [
    { icon: Search, label: t('search'), action: onSearch },
    { icon: Plus, label: t('addBook'), action: onAddBook },
    { icon: BookOpen, label: t('library') },
    { icon: Settings, label: t('settings') }
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrollY > 10 
          ? 'bg-background/80 backdrop-blur-lg border-b border-border/40 shadow-sm' 
          : 'bg-background/95 backdrop-blur-sm'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Menu and Logo */}
        <div className="flex items-center space-x-3">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2 hover:bg-sidebar-accent/20 transition-colors duration-200"
              >
                <Menu className="h-5 w-5 text-foreground" />
              </Button>
            </SheetTrigger>
            
            <SheetContent 
              side="left" 
              className="w-80 p-0 bg-card/95 backdrop-blur-lg border-r border-border/20"
            >
              <div className="p-6">
                {/* User Profile Section */}
                <div className="flex items-center space-x-3 mb-8">
                  <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                    <AvatarImage src={userProfile.avatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      {userProfile.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-foreground truncate">
                      {userProfile.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t('welcomeBack')}
                    </p>
                  </div>
                </div>

                {/* Menu Items */}
                <nav className="space-y-2 mb-8">
                  {menuItems.map((item, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start h-12 px-4 hover:bg-sidebar-accent/30 transition-all duration-200 group"
                      onClick={() => {
                        item.action?.();
                        setIsOpen(false);
                      }}
                    >
                      <item.icon className="h-5 w-5 mr-3 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {item.label}
                      </span>
                    </Button>
                  ))}
                </nav>

                {/* Settings Section */}
                <div className="space-y-4 pt-6 border-t border-border/20">
                  {/* Theme Toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {t('theme')}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onToggleTheme}
                      className="h-10 px-3 hover:bg-sidebar-accent/30 border-border/40 transition-all duration-200"
                    >
                      {isDarkMode ? (
                        <Sun className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Moon className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>

                  {/* Language Selector */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm font-medium text-foreground">
                      <Globe className="h-4 w-4" />
                      <span>{t('language')}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {languages.map((lang) => (
                        <Button
                          key={lang.code}
                          variant={currentLanguage === lang.code ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setLanguage(lang.code);
                            setIsOpen(false);
                          }}
                          className={`h-9 text-xs transition-all duration-200 ${
                            currentLanguage === lang.code
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'hover:bg-sidebar-accent/30 border-border/40'
                          }`}
                        >
                          {lang.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-display font-bold text-lg text-foreground">
              My Book
            </span>
          </div>
        </div>

        {/* Center: Page Title */}
        <div className="flex-1 text-center mx-4">
          <h1 className="font-display font-semibold text-foreground text-base truncate">
            {currentPageTitle}
          </h1>
          {isReading && (
            <div className="mt-1 max-w-32 mx-auto">
              <Progress 
                value={readingProgress} 
                className="h-1 bg-muted"
              />
              <span className="text-xs text-muted-foreground mt-0.5 block">
                {Math.round(readingProgress)}%
              </span>
            </div>
          )}
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center space-x-1">
          {!isReading && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={onSearch}
                className="p-2 hover:bg-sidebar-accent/20 transition-colors duration-200"
              >
                <Search className="h-5 w-5 text-muted-foreground" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onAddBook}
                className="p-2 hover:bg-sidebar-accent/20 transition-colors duration-200"
              >
                <Plus className="h-5 w-5 text-muted-foreground" />
              </Button>
            </>
          )}
          
          <Avatar className="h-8 w-8 ml-2 ring-2 ring-border/20">
            <AvatarImage src={userProfile.avatar} />
            <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
              {userProfile.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};