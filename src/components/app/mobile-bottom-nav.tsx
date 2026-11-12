"use client";

import { Bookmark, BookOpen, Heart, Library, Search, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  className?: string;
}

const items = [
  { id: "library", label: "Полка", icon: Library },
  { id: "reading", label: "Читаю", icon: BookOpen },
  { id: "collections", label: "Подборки", icon: Bookmark },
  { id: "favorites", label: "Любимое", icon: Heart },
  { id: "search", label: "Поиск", icon: Search },
  { id: "settings", label: "Ещё", icon: Settings },
];

export default function MobileBottomNavigation({ activeSection, onSectionChange, className }: MobileBottomNavigationProps) {
  return (
    <nav
      aria-label="Основная навигация"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/90 px-1 pb-[max(env(safe-area-inset-bottom),0.35rem)] pt-1.5 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur-xl md:hidden",
        className,
      )}
    >
      <div className="mx-auto flex max-w-xl items-center justify-around">
        {items.map(({ id, label, icon: Icon }) => {
          const active = activeSection === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => onSectionChange(id)}
              aria-current={active ? "page" : undefined}
              aria-label={label}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span className={cn("flex h-7 w-10 items-center justify-center rounded-full transition-colors", active && "bg-primary/10")}>
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="max-w-full truncate">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
