"use client"

import React from 'react'
import { Book, Heart, Library, Search, Settings, BookOpen, FolderOpen, Moon, Sun, User, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/contexts/language-context'
import { LanguageSwitcher } from '@/components/app/language-switcher'

interface NavigationItem {
  id: string
  labelKey: string
  icon: React.ComponentType<{ className?: string }>
  href: string
}

interface SidebarNavigationProps {
  activeSection: string
  onSectionChange: (section: string) => void
  isDarkMode: boolean
  onThemeToggle: () => void
  onBookAdd?: () => void
  user?: {
    name: string
    email: string
    avatar?: string
  }
}

const navigationItems: NavigationItem[] = [
  {
    id: 'library',
    labelKey: 'navigation.library',
    icon: Library,
    href: '/library'
  },
  {
    id: 'collections',
    labelKey: 'navigation.collections',
    icon: FolderOpen,
    href: '/collections'
  },
  {
    id: 'reading',
    labelKey: 'navigation.reading',
    icon: BookOpen,
    href: '/reading'
  },
  {
    id: 'favorites',
    labelKey: 'navigation.favorites',
    icon: Heart,
    href: '/favorites'
  },
  {
    id: 'search',
    labelKey: 'navigation.search',
    icon: Search,
    href: '/search'
  },
  {
    id: 'settings',
    labelKey: 'navigation.settings',
    icon: Settings,
    href: '/settings'
  }
]

export default function SidebarNavigation({
  activeSection,
  onSectionChange,
  isDarkMode,
  onThemeToggle,
  onBookAdd,
  user = {
    name: 'Пользователь',
    email: 'user@example.com'
  }
}: SidebarNavigationProps) {
  const { t, language, changeLanguage } = useLanguage()

  return (
    <div className="w-[280px] h-full bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Логотип */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Book className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-display font-semibold text-sidebar-foreground">
            My Book
          </h1>
        </div>
      </div>

      {/* Быстрое добавление книги */}
      {onBookAdd && (
        <div className="p-4 border-b border-sidebar-border">
          <Button
            onClick={onBookAdd}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('books.addBook')}
          </Button>
        </div>
      )}

      {/* Навигация */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const isActive = activeSection === item.id
          const Icon = item.icon

          return (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "w-full justify-start h-11 px-3 text-sm font-medium transition-all duration-200",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
              onClick={() => onSectionChange(item.id)}
            >
              <Icon className="w-4 h-4 mr-3" />
              {t(item.labelKey)}
            </Button>
          )
        })}
      </nav>

      {/* Нижняя часть */}
      <div className="p-4 border-t border-sidebar-border space-y-4">
        {/* Переключатель языка */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {t('settings.language')}
          </div>
          <LanguageSwitcher
            variant="compact"
            currentLanguage={language}
            onLanguageChange={changeLanguage}
            className="w-full"
          />
        </div>

        {/* Переключатель темы */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start h-10 px-3"
          onClick={onThemeToggle}
        >
          {isDarkMode ? (
            <>
              <Sun className="w-4 h-4 mr-3" />
              Светлая тема
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 mr-3" />
              Темная тема
            </>
          )}
        </Button>

        {/* Информация о пользователе */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-4 h-4 text-primary-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-accent-foreground truncate">
              {user.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}