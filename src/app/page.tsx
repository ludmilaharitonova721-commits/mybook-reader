"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Moon, Sun } from "lucide-react";
import SidebarNavigation from "@/components/app/sidebar-navigation";
import { BookGrid } from "@/components/app/book-library-grid";
import ReadingInterface from "@/components/app/reading-interface";
import { AdvancedBookSearch } from "@/components/app/search-interface";
import { BookCollectionManager } from "@/components/app/collections-manager";
import { BookAddDialog } from "@/components/app/book-add-dialog";
import { LanguageSwitcher } from "@/contexts/language-context";

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
  isDefault?: boolean;
  createdAt: Date;
}

const initialBooks: BookData[] = [
  { id: "1", title: "Война и мир", author: "Лев Толстой", genre: "Классическая литература", progress: 65, coverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80", dateAdded: new Date("2025-01-12") },
  { id: "2", title: "Преступление и наказание", author: "Федор Достоевский", genre: "Психологическая проза", progress: 100, coverUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80", dateAdded: new Date("2025-02-08") },
  { id: "3", title: "Мастер и Маргарита", author: "Михаил Булгаков", genre: "Фантастика", progress: 30, coverUrl: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=600&q=80", dateAdded: new Date("2025-03-19") },
  { id: "4", title: "Анна Каренина", author: "Лев Толстой", genre: "Классическая литература", progress: 0, coverUrl: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=600&q=80", dateAdded: new Date("2025-04-04") },
  { id: "5", title: "Идиот", author: "Федор Достоевский", genre: "Психологическая проза", progress: 45, coverUrl: "https://images.unsplash.com/photo-1513001900722-370f803f498d?auto=format&fit=crop&w=600&q=80", dateAdded: new Date("2025-05-21") },
  { id: "6", title: "Евгений Онегин", author: "Александр Пушкин", genre: "Поэзия", progress: 80, coverUrl: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80", dateAdded: new Date("2025-06-02") },
];

const readingSettings = { fontSize: 18, fontFamily: "georgia", theme: "light", lineHeight: 1.6, margin: 32 };

export default function HomePage() {
  const [activeSection, setActiveSection] = useState("library");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [books, setBooks] = useState(initialBooks);
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"dateAdded" | "title" | "author" | "progress">("dateAdded");
  const [currentBook, setCurrentBook] = useState<BookData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isBookAddDialogOpen, setIsBookAddDialogOpen] = useState(false);

  useEffect(() => {
    try {
      const savedTheme = window.localStorage.getItem("theme");
      const dark = savedTheme === "dark";
      setIsDarkMode(dark);
      document.documentElement.classList.toggle("dark", dark);
    } catch {
      // The app remains usable when browser storage is unavailable.
    }
  }, []);

  const handleThemeToggle = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      window.localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // Theme selection still applies for the current session.
    }
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
  const pageDescription = activeSection === "reading" ? "Продолжите чтение с того места, где остановились" : activeSection === "favorites" ? "Книги, к которым хочется возвращаться" : "Все ваши книги в одном месте";

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
        <main className="min-w-0 flex-1 overflow-y-auto p-6 md:p-10">
          <div className="mx-auto max-w-3xl">
            <h1 className="mb-2 text-3xl font-bold">Настройки</h1>
            <p className="mb-8 text-muted-foreground">Настройте приложение под себя.</p>
            <section className="mb-5 rounded-xl border bg-card p-6">
              <h2 className="mb-2 text-lg font-semibold">Внешний вид</h2>
              <p className="mb-4 text-sm text-muted-foreground">Выберите удобную тему оформления.</p>
              <button onClick={handleThemeToggle} className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm hover:bg-muted" type="button">
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {isDarkMode ? "Включить светлую тему" : "Включить тёмную тему"}
              </button>
            </section>
            <section className="rounded-xl border bg-card p-6">
              <h2 className="mb-2 text-lg font-semibold">Язык</h2>
              <p className="mb-4 text-sm text-muted-foreground">Выберите язык интерфейса.</p>
              <LanguageSwitcher />
            </section>
          </div>
        </main>
      );
    }

    if (activeSection === "collections") {
      return <main className="min-w-0 flex-1 overflow-y-auto"><BookCollectionManager onCollectionCreate={(collection) => setCollections((previous) => [...previous, collection])} onCollectionSelect={() => setActiveSection("library")} onBookAdd={() => setIsBookAddDialogOpen(true)} /></main>;
    }

    if (activeSection === "search") {
      return (
        <main className="min-w-0 flex-1 overflow-y-auto">
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
      <main className="min-w-0 flex-1 overflow-y-auto p-6 md:p-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="mb-2 text-3xl font-bold">{pageTitle}</h1>
              <p className="text-muted-foreground">{pageDescription}</p>
            </div>
            <div className="hidden items-center gap-2 rounded-xl border bg-card px-4 py-3 sm:flex">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">{books.length} книг</span>
            </div>
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
      <div className="flex h-screen overflow-hidden">
        <div className="hidden h-full shrink-0 md:block">
          <SidebarNavigation
            activeSection={activeSection}
            onSectionChange={(section) => { setCurrentBook(null); setActiveSection(section); }}
            isDarkMode={isDarkMode}
            onThemeToggle={handleThemeToggle}
            onBookAdd={() => setIsBookAddDialogOpen(true)}
          />
        </div>
        {renderContent()}
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
