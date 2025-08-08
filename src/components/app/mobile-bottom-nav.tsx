"use client";

import React from 'react';
import { Library, BookOpen, Bookmark, Search, Settings } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';

interface NavigationItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  labelKey: string;
  badge?: number;
}

interface MobileBottomNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  className?: string;
}

export default function MobileBottomNavigation({ 
  activeSection,
  onSectionChange,
  className 
}: MobileBottomNavigationProps) {
  const { t } = useLanguage();

  const navigationItems: NavigationItem[] = [
    {
      id: 'library',
      icon: Library,
      labelKey: 'navigation.library',
    },
    {
      id: 'reading',
      icon: BookOpen,
      labelKey: 'navigation.reading',
      badge: 2 // Example: 2 books currently being read
    },
    {
      id: 'collections',
      icon: Bookmark,
      labelKey: 'navigation.collections',
    },
    {
      id: 'search',
      icon: Search,
      labelKey: 'navigation.search',
    },
    {
      id: 'settings',
      icon: Settings,
      labelKey: 'navigation.settings',
    }
  ];

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 md:hidden",
        "bg-background/95 backdrop-blur-md border-t border-border",
        "px-2 pb-safe pb-2",
        className
      )}
    >
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          const active = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "relative flex flex-col items-center justify-center",
                "min-w-0 flex-1 py-2 px-1",
                "transition-all duration-200 ease-in-out",
                "active:scale-95",
                "group"
              )}
              aria-label={t(item.labelKey)}
            >
              {/* Icon Container */}
              <div
                className={cn(
                  "relative flex items-center justify-center",
                  "w-7 h-7 mb-1",
                  "transition-all duration-200 ease-in-out",
                  active 
                    ? "text-primary" 
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              >
                <IconComponent 
                  className={cn(
                    "w-5 h-5 transition-transform duration-200",
                    active ? "scale-110" : "group-active:scale-90"
                  )} 
                />
                
                {/* Badge */}
                {item.badge && item.badge > 0 && (
                  <div
                    className={cn(
                      "absolute -top-1 -right-1",
                      "min-w-4 h-4 px-1",
                      "bg-accent text-accent-foreground",
                      "text-xs font-medium",
                      "rounded-full flex items-center justify-center"
                    )}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </div>
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  "text-xs font-medium leading-tight",
                  "transition-colors duration-200",
                  "truncate max-w-full",
                  active 
                    ? "text-primary" 
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              >
                {t(item.labelKey)}
              </span>

              {/* Active Indicator */}
              {active && (
                <div
                  className={cn(
                    "absolute -top-px left-1/2 transform -translate-x-1/2",
                    "w-1 h-1 bg-primary rounded-full"
                  )}
                />
              )}

              {/* Ripple Effect */}
              <div
                className={cn(
                  "absolute inset-0 rounded-lg",
                  "bg-primary/10 opacity-0",
                  "transition-opacity duration-150",
                  "group-active:opacity-100"
                )}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
}