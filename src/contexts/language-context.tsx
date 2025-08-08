"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Language type definition
export type Language = 'ru' | 'en';

// Direction type for future RTL support
export type Direction = 'ltr' | 'rtl';

// Translation keys with nested structure for better organization
export type TranslationKeys = {
  // Navigation
  navigation: {
    library: string;
    collections: string;
    favorites: string;
    reading: string;
    search: string;
    settings: string;
    profile: string;
  };
  
  // Library
  library: {
    title: string;
    addBook: string;
    importBooks: string;
    sortBy: string;
    filterBy: string;
    viewMode: string;
    gridView: string;
    listView: string;
    recentlyAdded: string;
    recentlyRead: string;
    alphabetical: string;
    byAuthor: string;
    byGenre: string;
    allBooks: string;
    readingProgress: string;
    pagesRead: string;
    totalPages: string;
    completed: string;
    inProgress: string;
    notStarted: string;
  };
  
  // Collections
  collections: {
    title: string;
    createCollection: string;
    collectionName: string;
    description: string;
    addToCollection: string;
    removeFromCollection: string;
    deleteCollection: string;
    editCollection: string;
    favorites: string;
    readLater: string;
    currentlyReading: string;
    completed: string;
    wishlist: string;
  };
  
  // Reading Interface
  reader: {
    title: string;
    settings: string;
    fontSize: string;
    fontFamily: string;
    lineHeight: string;
    theme: string;
    lightTheme: string;
    darkTheme: string;
    sepiaTheme: string;
    margin: string;
    narrow: string;
    medium: string;
    wide: string;
    bookmark: string;
    addBookmark: string;
    removeBookmark: string;
    tableOfContents: string;
    progress: string;
    timeLeft: string;
    wordsPerMinute: string;
    pageNumber: string;
    chapter: string;
    nextChapter: string;
    previousChapter: string;
    fullscreen: string;
    exitFullscreen: string;
  };
  
  // Search
  search: {
    placeholder: string;
    noResults: string;
    searchResults: string;
    searchIn: string;
    title: string;
    author: string;
    content: string;
    tags: string;
    advanced: string;
    filters: string;
    genre: string;
    publishYear: string;
    rating: string;
    status: string;
  };
  
  // Settings
  settings: {
    title: string;
    general: string;
    appearance: string;
    reading: string;
    library: string;
    account: string;
    language: string;
    theme: string;
    notifications: string;
    privacy: string;
    storage: string;
    backup: string;
    restore: string;
    export: string;
    import: string;
    resetSettings: string;
    saveChanges: string;
    cancel: string;
  };
  
  // Book Management
  books: {
    addBook: string;
    editBook: string;
    deleteBook: string;
    bookDetails: string;
    title: string;
    author: string;
    genre: string;
    publisher: string;
    publishDate: string;
    isbn: string;
    description: string;
    tags: string;
    rating: string;
    review: string;
    cover: string;
    uploadCover: string;
    changeCover: string;
    file: string;
    uploadFile: string;
    format: string;
  };
  
  // Common UI Elements
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    remove: string;
    close: string;
    open: string;
    yes: string;
    no: string;
    ok: string;
    confirm: string;
    loading: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    back: string;
    next: string;
    previous: string;
    more: string;
    less: string;
    show: string;
    hide: string;
  };
  
  // Error Messages
  errors: {
    general: string;
    network: string;
    fileUpload: string;
    invalidFormat: string;
    fileTooLarge: string;
    bookNotFound: string;
    collectionNotFound: string;
    noPermission: string;
    storageLimit: string;
    corruptedFile: string;
  };
  
  // Success Messages
  success: {
    bookAdded: string;
    bookUpdated: string;
    bookDeleted: string;
    collectionCreated: string;
    collectionUpdated: string;
    collectionDeleted: string;
    settingsSaved: string;
    bookmarkAdded: string;
    backupCreated: string;
    dataImported: string;
  };
  
  // Time and Progress
  time: {
    minutesAgo: string;
    hoursAgo: string;
    daysAgo: string;
    weeksAgo: string;
    monthsAgo: string;
    yearsAgo: string;
    justNow: string;
    minute: string;
    minutes: string;
    hour: string;
    hours: string;
    day: string;
    days: string;
    week: string;
    weeks: string;
    month: string;
    months: string;
    year: string;
    years: string;
  };
};

// Translation dictionaries
const translations: Record<Language, TranslationKeys> = {
  ru: {
    navigation: {
      library: 'Библиотека',
      collections: 'Коллекции',
      favorites: 'Избранное',
      reading: 'Чтение',
      search: 'Поиск',
      settings: 'Настройки',
      profile: 'Профиль',
    },
    library: {
      title: 'Библиотека',
      addBook: 'Добавить книгу',
      importBooks: 'Импорт книг',
      sortBy: 'Сортировать по',
      filterBy: 'Фильтровать по',
      viewMode: 'Режим просмотра',
      gridView: 'Сетка',
      listView: 'Список',
      recentlyAdded: 'Недавно добавленные',
      recentlyRead: 'Недавно читаемые',
      alphabetical: 'По алфавиту',
      byAuthor: 'По автору',
      byGenre: 'По жанру',
      allBooks: 'Все книги',
      readingProgress: 'Прогресс чтения',
      pagesRead: 'Прочитано страниц',
      totalPages: 'Всего страниц',
      completed: 'Завершено',
      inProgress: 'В процессе',
      notStarted: 'Не начато',
    },
    collections: {
      title: 'Коллекции',
      createCollection: 'Создать коллекцию',
      collectionName: 'Название коллекции',
      description: 'Описание',
      addToCollection: 'Добавить в коллекцию',
      removeFromCollection: 'Удалить из коллекции',
      deleteCollection: 'Удалить коллекцию',
      editCollection: 'Редактировать коллекцию',
      favorites: 'Избранное',
      readLater: 'Прочитать позже',
      currentlyReading: 'Читаю сейчас',
      completed: 'Прочитанные',
      wishlist: 'Список желаний',
    },
    reader: {
      title: 'Читалка',
      settings: 'Настройки чтения',
      fontSize: 'Размер шрифта',
      fontFamily: 'Семейство шрифтов',
      lineHeight: 'Межстрочный интервал',
      theme: 'Тема',
      lightTheme: 'Светлая',
      darkTheme: 'Тёмная',
      sepiaTheme: 'Сепия',
      margin: 'Поля',
      narrow: 'Узкие',
      medium: 'Средние',
      wide: 'Широкие',
      bookmark: 'Закладка',
      addBookmark: 'Добавить закладку',
      removeBookmark: 'Удалить закладку',
      tableOfContents: 'Содержание',
      progress: 'Прогресс',
      timeLeft: 'Осталось времени',
      wordsPerMinute: 'Слов в минуту',
      pageNumber: 'Номер страницы',
      chapter: 'Глава',
      nextChapter: 'Следующая глава',
      previousChapter: 'Предыдущая глава',
      fullscreen: 'Полный экран',
      exitFullscreen: 'Выйти из полного экрана',
    },
    search: {
      placeholder: 'Поиск книг, авторов, жанров...',
      noResults: 'Результаты не найдены',
      searchResults: 'Результаты поиска',
      searchIn: 'Искать в',
      title: 'Название',
      author: 'Автор',
      content: 'Содержание',
      tags: 'Теги',
      advanced: 'Расширенный поиск',
      filters: 'Фильтры',
      genre: 'Жанр',
      publishYear: 'Год издания',
      rating: 'Рейтинг',
      status: 'Статус',
    },
    settings: {
      title: 'Настройки',
      general: 'Общие',
      appearance: 'Внешний вид',
      reading: 'Чтение',
      library: 'Библиотека',
      account: 'Аккаунт',
      language: 'Язык',
      theme: 'Тема',
      notifications: 'Уведомления',
      privacy: 'Конфиденциальность',
      storage: 'Хранилище',
      backup: 'Резервная копия',
      restore: 'Восстановить',
      export: 'Экспорт',
      import: 'Импорт',
      resetSettings: 'Сбросить настройки',
      saveChanges: 'Сохранить изменения',
      cancel: 'Отмена',
    },
    books: {
      addBook: 'Добавить книгу',
      editBook: 'Редактировать книгу',
      deleteBook: 'Удалить книгу',
      bookDetails: 'Информация о книге',
      title: 'Название',
      author: 'Автор',
      genre: 'Жанр',
      publisher: 'Издательство',
      publishDate: 'Дата издания',
      isbn: 'ISBN',
      description: 'Описание',
      tags: 'Теги',
      rating: 'Оценка',
      review: 'Рецензия',
      cover: 'Обложка',
      uploadCover: 'Загрузить обложку',
      changeCover: 'Изменить обложку',
      file: 'Файл',
      uploadFile: 'Загрузить файл',
      format: 'Формат',
    },
    common: {
      save: 'Сохранить',
      cancel: 'Отмена',
      delete: 'Удалить',
      edit: 'Редактировать',
      add: 'Добавить',
      remove: 'Удалить',
      close: 'Закрыть',
      open: 'Открыть',
      yes: 'Да',
      no: 'Нет',
      ok: 'ОК',
      confirm: 'Подтвердить',
      loading: 'Загрузка...',
      error: 'Ошибка',
      success: 'Успешно',
      warning: 'Предупреждение',
      info: 'Информация',
      back: 'Назад',
      next: 'Далее',
      previous: 'Назад',
      more: 'Ещё',
      less: 'Меньше',
      show: 'Показать',
      hide: 'Скрыть',
    },
    errors: {
      general: 'Произошла ошибка. Попробуйте ещё раз.',
      network: 'Ошибка подключения к сети',
      fileUpload: 'Ошибка при загрузке файла',
      invalidFormat: 'Неподдерживаемый формат файла',
      fileTooLarge: 'Файл слишком большой',
      bookNotFound: 'Книга не найдена',
      collectionNotFound: 'Коллекция не найдена',
      noPermission: 'Недостаточно прав доступа',
      storageLimit: 'Превышен лимит хранилища',
      corruptedFile: 'Файл повреждён',
    },
    success: {
      bookAdded: 'Книга успешно добавлена',
      bookUpdated: 'Книга успешно обновлена',
      bookDeleted: 'Книга успешно удалена',
      collectionCreated: 'Коллекция создана',
      collectionUpdated: 'Коллекция обновлена',
      collectionDeleted: 'Коллекция удалена',
      settingsSaved: 'Настройки сохранены',
      bookmarkAdded: 'Закладка добавлена',
      backupCreated: 'Резервная копия создана',
      dataImported: 'Данные импортированы',
    },
    time: {
      minutesAgo: 'минут назад',
      hoursAgo: 'часов назад',
      daysAgo: 'дней назад',
      weeksAgo: 'недель назад',
      monthsAgo: 'месяцев назад',
      yearsAgo: 'лет назад',
      justNow: 'только что',
      minute: 'минута',
      minutes: 'минуты',
      hour: 'час',
      hours: 'часа',
      day: 'день',
      days: 'дня',
      week: 'неделя',
      weeks: 'недели',
      month: 'месяц',
      months: 'месяца',
      year: 'год',
      years: 'года',
    },
  },
  en: {
    navigation: {
      library: 'Library',
      collections: 'Collections',
      favorites: 'Favorites',
      reading: 'Reading',
      search: 'Search',
      settings: 'Settings',
      profile: 'Profile',
    },
    library: {
      title: 'Library',
      addBook: 'Add Book',
      importBooks: 'Import Books',
      sortBy: 'Sort by',
      filterBy: 'Filter by',
      viewMode: 'View Mode',
      gridView: 'Grid',
      listView: 'List',
      recentlyAdded: 'Recently Added',
      recentlyRead: 'Recently Read',
      alphabetical: 'Alphabetical',
      byAuthor: 'By Author',
      byGenre: 'By Genre',
      allBooks: 'All Books',
      readingProgress: 'Reading Progress',
      pagesRead: 'Pages Read',
      totalPages: 'Total Pages',
      completed: 'Completed',
      inProgress: 'In Progress',
      notStarted: 'Not Started',
    },
    collections: {
      title: 'Collections',
      createCollection: 'Create Collection',
      collectionName: 'Collection Name',
      description: 'Description',
      addToCollection: 'Add to Collection',
      removeFromCollection: 'Remove from Collection',
      deleteCollection: 'Delete Collection',
      editCollection: 'Edit Collection',
      favorites: 'Favorites',
      readLater: 'Read Later',
      currentlyReading: 'Currently Reading',
      completed: 'Completed',
      wishlist: 'Wishlist',
    },
    reader: {
      title: 'Reader',
      settings: 'Reading Settings',
      fontSize: 'Font Size',
      fontFamily: 'Font Family',
      lineHeight: 'Line Height',
      theme: 'Theme',
      lightTheme: 'Light',
      darkTheme: 'Dark',
      sepiaTheme: 'Sepia',
      margin: 'Margins',
      narrow: 'Narrow',
      medium: 'Medium',
      wide: 'Wide',
      bookmark: 'Bookmark',
      addBookmark: 'Add Bookmark',
      removeBookmark: 'Remove Bookmark',
      tableOfContents: 'Table of Contents',
      progress: 'Progress',
      timeLeft: 'Time Left',
      wordsPerMinute: 'Words per Minute',
      pageNumber: 'Page Number',
      chapter: 'Chapter',
      nextChapter: 'Next Chapter',
      previousChapter: 'Previous Chapter',
      fullscreen: 'Fullscreen',
      exitFullscreen: 'Exit Fullscreen',
    },
    search: {
      placeholder: 'Search books, authors, genres...',
      noResults: 'No results found',
      searchResults: 'Search Results',
      searchIn: 'Search in',
      title: 'Title',
      author: 'Author',
      content: 'Content',
      tags: 'Tags',
      advanced: 'Advanced Search',
      filters: 'Filters',
      genre: 'Genre',
      publishYear: 'Publish Year',
      rating: 'Rating',
      status: 'Status',
    },
    settings: {
      title: 'Settings',
      general: 'General',
      appearance: 'Appearance',
      reading: 'Reading',
      library: 'Library',
      account: 'Account',
      language: 'Language',
      theme: 'Theme',
      notifications: 'Notifications',
      privacy: 'Privacy',
      storage: 'Storage',
      backup: 'Backup',
      restore: 'Restore',
      export: 'Export',
      import: 'Import',
      resetSettings: 'Reset Settings',
      saveChanges: 'Save Changes',
      cancel: 'Cancel',
    },
    books: {
      addBook: 'Add Book',
      editBook: 'Edit Book',
      deleteBook: 'Delete Book',
      bookDetails: 'Book Details',
      title: 'Title',
      author: 'Author',
      genre: 'Genre',
      publisher: 'Publisher',
      publishDate: 'Publish Date',
      isbn: 'ISBN',
      description: 'Description',
      tags: 'Tags',
      rating: 'Rating',
      review: 'Review',
      cover: 'Cover',
      uploadCover: 'Upload Cover',
      changeCover: 'Change Cover',
      file: 'File',
      uploadFile: 'Upload File',
      format: 'Format',
    },
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      remove: 'Remove',
      close: 'Close',
      open: 'Open',
      yes: 'Yes',
      no: 'No',
      ok: 'OK',
      confirm: 'Confirm',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Info',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      more: 'More',
      less: 'Less',
      show: 'Show',
      hide: 'Hide',
    },
    errors: {
      general: 'An error occurred. Please try again.',
      network: 'Network connection error',
      fileUpload: 'File upload error',
      invalidFormat: 'Unsupported file format',
      fileTooLarge: 'File too large',
      bookNotFound: 'Book not found',
      collectionNotFound: 'Collection not found',
      noPermission: 'Insufficient permissions',
      storageLimit: 'Storage limit exceeded',
      corruptedFile: 'File corrupted',
    },
    success: {
      bookAdded: 'Book added successfully',
      bookUpdated: 'Book updated successfully',
      bookDeleted: 'Book deleted successfully',
      collectionCreated: 'Collection created',
      collectionUpdated: 'Collection updated',
      collectionDeleted: 'Collection deleted',
      settingsSaved: 'Settings saved',
      bookmarkAdded: 'Bookmark added',
      backupCreated: 'Backup created',
      dataImported: 'Data imported',
    },
    time: {
      minutesAgo: 'minutes ago',
      hoursAgo: 'hours ago',
      daysAgo: 'days ago',
      weeksAgo: 'weeks ago',
      monthsAgo: 'months ago',
      yearsAgo: 'years ago',
      justNow: 'just now',
      minute: 'minute',
      minutes: 'minutes',
      hour: 'hour',
      hours: 'hours',
      day: 'day',
      days: 'days',
      week: 'week',
      weeks: 'weeks',
      month: 'month',
      months: 'months',
      year: 'year',
      years: 'years',
    },
  },
};

// Language configuration with RTL support for future expansion
const languageConfig: Record<Language, { name: string; direction: Direction; flag: string }> = {
  ru: {
    name: 'Русский',
    direction: 'ltr',
    flag: '🇷🇺',
  },
  en: {
    name: 'English',
    direction: 'ltr',
    flag: '🇺🇸',
  },
};

// Context interface
interface LanguageContextType {
  language: Language;
  direction: Direction;
  translations: TranslationKeys;
  availableLanguages: Language[];
  changeLanguage: (language: Language) => void;
  t: (key: string) => string;
  getLanguageConfig: (lang: Language) => { name: string; direction: Direction; flag: string };
}

// Create context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Storage key for persistence
const LANGUAGE_STORAGE_KEY = 'mybook-language';

// Helper function to get nested translation value
function getNestedTranslation(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : path;
  }, obj);
}

// Provider component
interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: Language;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  defaultLanguage = 'ru',
}) => {
  const [language, setLanguage] = useState<Language>(defaultLanguage);

  // Load language from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
      if (savedLanguage && translations[savedLanguage]) {
        setLanguage(savedLanguage);
      } else {
        // Try to detect browser language
        const browserLang = navigator.language.split('-')[0] as Language;
        if (translations[browserLang]) {
          setLanguage(browserLang);
        }
      }
    }
  }, []);

  // Save language to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      
      // Set HTML direction attribute for future RTL support
      document.documentElement.setAttribute('dir', languageConfig[language].direction);
      document.documentElement.setAttribute('lang', language);
    }
  }, [language]);

  const changeLanguage = (newLanguage: Language) => {
    if (translations[newLanguage]) {
      setLanguage(newLanguage);
    }
  };

  // Translation function with dot notation support
  const t = (key: string): string => {
    const currentTranslations = translations[language];
    const translation = getNestedTranslation(currentTranslations, key);
    
    // If translation not found, try English as fallback
    if (translation === key && language !== 'en') {
      return getNestedTranslation(translations.en, key);
    }
    
    return translation;
  };

  const getLanguageConfig = (lang: Language) => languageConfig[lang];

  const contextValue: LanguageContextType = {
    language,
    direction: languageConfig[language].direction,
    translations: translations[language],
    availableLanguages: Object.keys(translations) as Language[],
    changeLanguage,
    t,
    getLanguageConfig,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Language switcher component
interface LanguageSwitcherProps {
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className = '' }) => {
  const { language, availableLanguages, changeLanguage, getLanguageConfig } = useLanguage();

  return (
    <div className={`language-switcher ${className}`}>
      <select
        value={language}
        onChange={(e) => changeLanguage(e.target.value as Language)}
        className="bg-card border border-border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:border-transparent"
        aria-label="Select language"
      >
        {availableLanguages.map((lang) => {
          const config = getLanguageConfig(lang);
          return (
            <option key={lang} value={lang}>
              {config.flag} {config.name}
            </option>
          );
        })}
      </select>
    </div>
  );
};

// Utility function to pluralize Russian words
export const pluralize = (count: number, forms: [string, string, string]): string => {
  const cases = [2, 0, 1, 1, 1, 2];
  return forms[(count % 100 > 4 && count % 100 < 20) ? 2 : cases[Math.min(count % 10, 5)]];
};

// Utility function for time formatting
export const formatTimeAgo = (date: Date, language: Language): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  const t = translations[language].time;

  if (seconds < 60) return t.justNow;
  if (minutes < 60) return `${minutes} ${t.minutesAgo}`;
  if (hours < 24) return `${hours} ${t.hoursAgo}`;
  if (days < 7) return `${days} ${t.daysAgo}`;
  if (weeks < 4) return `${weeks} ${t.weeksAgo}`;
  if (months < 12) return `${months} ${t.monthsAgo}`;
  return `${years} ${t.yearsAgo}`;
};