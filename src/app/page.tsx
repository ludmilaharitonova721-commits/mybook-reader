"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Moon, Plus, Search, Sun } from "lucide-react";
import SidebarNavigation from "@/components/app/sidebar-navigation";
import { BookGrid } from "@/components/app/book-library-grid";
import ReadingInterface from "@/components/app/reading-interface";
import { AdvancedBookSearch } from "@/components/app/search-interface";
import { BookCollectionManager } from "@/components/app/collections-manager";
import { BookAddDialog } from "@/components/app/book-add-dialog";
import MobileBottomNavigation from "@/components/app/mobile-bottom-nav";
import { LanguageSwitcher } from "@/contexts/language-context";
import libraryData from "@/data/library.json";

interface BookData {
  id: string;
  title: string;
  author: string;
  genre: string;
  progress: number;
  coverUrl?: string;
  dateAdded: Date;
}

interface AddedBookData {
  title: string;
  author: string;
  genre?: string;
  coverImage?: File;
}

interface CollectionData {
  id: string;
  name: string;
  description?: string;
  books: Array<{ id: string; title: string; author: string; cover?: string; status?: "want-to-read" | "currently-reading" | "read" }>;
  bookIds?: string[];
  isDefault?: boolean;
  createdAt: Date;
}

const initialBooks: BookData[] = libraryData.books.map((book) => ({
  ...book,
  dateAdded: new Date(book.dateAdded),
}));

const initialCollections: CollectionData[] = libraryData.collections.map((collection) => ({
  id: collection.id,
  name: collection.name,
  description: collection.description,
  isDefault: collection.isDefault,
  createdAt: new Date(),
  bookIds: collection.bookIds,
  books: (collection.bookIds ?? []).flatMap((bookId) => {
    const book = libraryData.books.find((item) => item.id === bookId);
    if (!book) return [];
    return [{
      id: book.id,
      title: book.title,
      author: book.author,
      cover: book.coverUrl,
      status: collection.id === "currently-reading" ? "currently-reading" : collection.id === "read" ? "read" : "want-to-read",
    }];
  }),
}));

const readingSettings = { fontSize: 18, fontFamily: "georgia", theme: "light", lineHeight: 1.6, margin: 32 };

export default function HomePage() {
  const [activeSection, setActiveSection] = useState("library");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [books, setBooks] = useState<BookData[]>(initialBooks);
  const [collections, setCollections] = useState<CollectionData[]>(initialCollections);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"dateAdded" | "title" | "author" | "progress">("dateAdded");
  const [currentBook, setCurrentBook] = useState<BookData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isBookAddDialogOpen, setIsBookAddDialogOpen] = useState(false);

  useEffect(() => {
    try {
      const dark = window.localStorage.getItem("theme") === "dark";
      setIsDarkMode(dark);
      document.documentElement.classList.toggle("dark", dark);
    } catch {
      // Browser storage is optional.
    }
  }, []);

  const handleThemeToggle = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      window.localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // The theme remains active for the current session.
    }
  };

  const changeSection = (section: string) => {
    setCurrentBook(null);
    setActiveSection(section);
  };

  const handleBookRead = (bookOrId: { id: string } | string) => {
    const id = typeof bookOrId === "string" ? bookOrId : bookOrId.id;
    const book = books.find((item) => item.id === id);
    if (!book) return;
    setCurrentBook(book);
    setCurrentPage(Math.max(1, Math.floor((book.progress / 100) * 245) + 1));
  };

  const handleBookAdded = async (data: AddedBookData) => {
    const book: BookData = {
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now()),
      title: data.title,
      author: data.author,
      genre: data.genre || "Без жанра",
      progress: 0,
      coverUrl: data.coverImage ? URL.createObjectURL(data.coverImage) : undefined,
      dateAdded: new Date(),
    };
    setBooks((previous) => [book, ...previous]);
    setActiveSection("library");
    setIsBookAddDialogOpen(false);
  };

  const visibleBooks = useMemo(() => {
    if (activeSection === "reading") return books.filter((book) => book.progress > 0 && book.progress < 100);
    if (activeSection === "favorites") return books.filter((book) => book.progress > 50);
    return books;
  }, [activeSection, books]);

  const pageTitle = activeSection === "reading" ? "Читаю сейчас" : activeSection === "favorites" ? "Избранное" : "Моя библиотека";
  const pageDescription = activeSection === "reading" ? "Продолжите чтение с того места, где остановились" : activeSection === "favorites" ? "Книги, к которым хочется возвращаться" : "Ваша личная коллекция историй и идей";

  const renderContent = () => {
    if (currentBook) {
      return (
        <ReadingInterface
          bookTitle={currentBook.title}
          currentPage={currentPage}
          totalPages={245}
          initialSettings={readingSettings}
          onBack={() => setCurrentBook(null)}
          onPageChange={(page) => {
            setCurrentPage(page);
            setBooks((previous) => previous.map((book) => book.id === currentBook.id ? { ...book, progress: Math.min(100, Math.round((page / 245) * 100)) } : book));
          }}
        />
      );
    }

    if (activeSection === "settings") {
      return (
        <main className="min-w-0 flex-1 overflow-y-auto p-5 pb-24 md:p-10 md:pb-10">
          <div className="mx-auto max-w-3xl">
            <h1 className="mb-2 text-3xl font-bold">Настройки</h1>
            <p className="mb-8 text-muted-foreground">Настройте приложение под себя.</p>
            <section className="mb-5 rounded-2xl border bg-card p-6 shadow-sm">
              <h2 className="mb-2 text-lg font-semibold">Внешний вид</h2>
              <p className="mb-4 text-sm text-muted-foreground">Выберите удобную тему оформления.</p>
              <button onClick={handleThemeToggle} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-muted" type="button">
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {isDarkMode ? "Включить светлую тему" : "Включить тёмную тему"}
              </button>
            </section>
            <section className="rounded-2xl border bg-card p-6 shadow-sm">
              <h2 className="mb-2 text-lg font-semibold">Язык</h2>
              <p className="mb-4 text-sm text-muted-foreground">Выберите язык интерфейса.</p>
              <LanguageSwitcher />
            </section>
          </div>
        </main>
      );
    }

    if (activeSection === "collections") {
      return (
        <main className="min-w-0 flex-1 overflow-y-auto pb-24 md:pb-0">
          <BookCollectionManager
            initialCollections={collections}
            onCollectionCreate={(collection) => setCollections((previous) => [...previous, collection])}
            onCollectionSelect={() => setActiveSection("library")}
            onBookAdd={() => setIsBookAddDialogOpen(true)}
          />
        </main>
      );
    }

    if (activeSection === "search") {
      return (
        <main className="min-w-0 flex-1 overflow-y-auto pb-24 md:pb-0">
          <AdvancedBookSearch
            books={books.map((book) => ({
              id: book.id,
              title: book.title,
              author: book.author,
              genre: book.genre,
              description: `Произведение ${book.author} из жанра «${book.genre}»`,
              cover: book.coverUrl || "",
              format: "ebook" as const,
              status: book.progress === 100 ? "completed" as const : book.progress > 0 ? "reading" as const : "unread" as const,
              rating: 5,
              progress: book.progress,
            }))}
            onBookClick={(book) => handleBookRead(book.id)}
          />
        </main>
      );
    }

    return (
      <main className="min-w-0 flex-1 overflow-y-auto p-4 pb-24 sm:p-6 md:p-10 md:pb-10">
        <div className="mx-auto max-w-7xl">
          <section className="relative mb-8 overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-900 px-6 py-8 text-white shadow-xl sm:px-9 sm:py-10">
            <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full bg-violet-400/20 blur-3xl" />
            <div className="absolute bottom-0 right-1/4 h-32 w-32 rounded-full bg-amber-300/10 blur-2xl" />
            <div className="relative z-10 max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-violet-100 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> ВАШЕ ТИХОЕ МЕСТО ДЛЯ ЧТЕНИЯ
              </div>
              <h1 className="mb-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{pageTitle}</h1>
              <p className="max-w-lg text-sm leading-6 text-slate-200 sm:text-base">{pageDescription}. Возвращайтесь к любимым книгам в своём ритме.</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const nextBook = books.find((book) => book.progress > 0 && book.progress < 100) ?? books[0];
                    if (nextBook) handleBookRead(nextBook.id);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-violet-50"
                >
                  <BookOpen className="h-4 w-4" /> Продолжить чтение
                </button>
                <button onClick={() => setIsBookAddDialogOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur transition hover:bg-white/15" type="button">
                  <Plus className="h-4 w-4" /> Добавить книгу
                </button>
              </div>
            </div>
            <div className="relative z-10 mt-7 grid grid-cols-3 gap-2 border-t border-white/15 pt-5 sm:absolute sm:bottom-8 sm:right-8 sm:mt-0 sm:w-[340px] sm:border-0 sm:pt-0">
              <div className="rounded-xl bg-white/10 p-3 backdrop-blur"><p className="text-xl font-semibold text-white">{books.length}</p><p className="text-[11px] text-slate-300">книг в библиотеке</p></div>
              <div className="rounded-xl bg-white/10 p-3 backdrop-blur"><p className="text-xl font-semibold text-white">{books.filter((book) => book.progress > 0 && book.progress < 100).length}</p><p className="text-[11px] text-slate-300">читаю сейчас</p></div>
              <div className="rounded-xl bg-white/10 p-3 backdrop-blur"><p className="text-xl font-semibold text-white">{books.filter((book) => book.progress === 100).length}</p><p className="text-[11px] text-slate-300">прочитано</p></div>
            </div>
          </section>

          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Ваша полка</h2>
              <p className="mt-1 text-sm text-muted-foreground">Выберите книгу, чтобы вернуться к чтению</p>
            </div>
            <button onClick={() => changeSection("search")} className="hidden items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground sm:inline-flex" type="button">
              <Search className="h-4 w-4" /> Найти книгу
            </button>
          </div>

          <BookGrid
            books={visibleBooks.map((book) => ({ ...book, dateAdded: book.dateAdded.toISOString() }))}
            onBookRead={handleBookRead}
            onBookDetails={handleBookRead}
            onBookAdd={() => setIsBookAddDialogOpen(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </div>
      </main>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex h-[100dvh] overflow-hidden">
        {!currentBook && (
          <div className="hidden h-full shrink-0 md:block">
            <SidebarNavigation
              activeSection={activeSection}
              onSectionChange={changeSection}
              isDarkMode={isDarkMode}
              onThemeToggle={handleThemeToggle}
              onBookAdd={() => setIsBookAddDialogOpen(true)}
            />
          </div>
        )}

        {!currentBook && (
          <header className="fixed left-0 right-0 top-0 z-30 flex h-14 items-center justify-between border-b bg-background/85 px-4 backdrop-blur-xl md:hidden">
            <div className="flex items-center gap-2 font-semibold">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <BookOpen className="h-4 w-4" />
              </span>
              My Book
            </div>
            <button onClick={() => setIsBookAddDialogOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground" aria-label="Добавить книгу" type="button">
              <Plus className="h-4 w-4" />
            </button>
          </header>
        )}

        {renderContent()}

        {!currentBook && <MobileBottomNavigation activeSection={activeSection} onSectionChange={changeSection} />}
      </div>

      <BookAddDialog
        isOpen={isBookAddDialogOpen}
        onClose={() => setIsBookAddDialogOpen(false)}
        onBookAdded={handleBookAdded}
        collections={[{ id: "main", name: "Основная библиотека" }, ...collections.map(({ id, name }) => ({ id, name }))]}
      />
    </div>
  );
}
