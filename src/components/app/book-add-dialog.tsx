"use client";

import React, { useState, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Upload, 
  FileText, 
  Link, 
  Image as ImageIcon, 
  Book, 
  Calendar, 
  Tag, 
  User, 
  Hash, 
  AlignLeft,
  CheckCircle,
  AlertCircle,
  X,
  Plus,
  File
} from 'lucide-react';

interface BookMetadata {
  title: string;
  author: string;
  genre: string;
  description: string;
  isbn: string;
  publicationYear: string;
  collection: string;
  cover?: File | string;
}

interface BookAddDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onBookAdded: (book: BookMetadata & { file?: File }) => void;
  collections: string[];
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'processing' | 'extracting' | 'completed' | 'error';
  error?: string;
  metadata?: Partial<BookMetadata>;
}

const SUPPORTED_BOOK_FORMATS = [
  '.epub', '.pdf', '.mobi', '.azw', '.azw3',
  '.txt', '.docx', '.doc', '.rtf',
  '.fb2', '.fb2.zip',
  '.cbr', '.cbz',
  '.zip', '.rar'
];

const BOOK_GENRES = [
  'Художественная литература',
  'Научная фантастика',
  'Фэнтези',
  'Детектив',
  'Роман',
  'Биография',
  'История',
  'Наука',
  'Психология',
  'Бизнес',
  'Саморазвитие',
  'Классика',
  'Поэзия',
  'Драма'
];

export const BookAddDialog = ({ isOpen, onClose, onBookAdded, collections }: BookAddDialogProps) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [metadata, setMetadata] = useState<BookMetadata>({
    title: '',
    author: '',
    genre: '',
    description: '',
    isbn: '',
    publicationYear: '',
    collection: collections[0] || ''
  });
  const [urlInput, setUrlInput] = useState('');
  const [isProcessingUrl, setIsProcessingUrl] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!SUPPORTED_BOOK_FORMATS.includes(extension)) {
      return `Неподдерживаемый формат файла: ${extension}`;
    }
    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      return 'Размер файла превышает 100MB';
    }
    return null;
  };

  const simulateFileProcessing = (file: File): Promise<Partial<BookMetadata>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate metadata extraction
        const filename = file.name.replace(/\.[^/.]+$/, "");
        const parts = filename.split(/[-_]/);
        
        resolve({
          title: parts[0] || filename,
          author: parts[1] || 'Неизвестный автор',
          genre: BOOK_GENRES[Math.floor(Math.random() * BOOK_GENRES.length)]
        });
      }, 2000 + Math.random() * 1000);
    });
  };

  const processFiles = async (files: File[]) => {
    const newUploads: UploadProgress[] = files
      .filter(file => !validateFile(file))
      .map(file => ({
        file,
        progress: 0,
        status: 'uploading' as const
      }));

    if (newUploads.length === 0) {
      setErrors({ upload: 'Не выбраны подходящие файлы' });
      return;
    }

    setUploads(prev => [...prev, ...newUploads]);
    setErrors({});

    // Process each file
    for (const upload of newUploads) {
      try {
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setUploads(prev => prev.map(u => 
            u.file === upload.file ? { ...u, progress } : u
          ));
        }

        // Change to processing
        setUploads(prev => prev.map(u => 
          u.file === upload.file ? { ...u, status: 'processing' } : u
        ));

        // Change to extracting metadata
        setUploads(prev => prev.map(u => 
          u.file === upload.file ? { ...u, status: 'extracting' } : u
        ));

        // Extract metadata
        const extractedMetadata = await simulateFileProcessing(upload.file);
        
        // Complete
        setUploads(prev => prev.map(u => 
          u.file === upload.file ? { 
            ...u, 
            status: 'completed',
            metadata: extractedMetadata 
          } : u
        ));

      } catch (error) {
        setUploads(prev => prev.map(u => 
          u.file === upload.file ? { 
            ...u, 
            status: 'error',
            error: 'Ошибка при обработке файла'
          } : u
        ));
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(event.dataTransfer.files);
    processFiles(files);
  }, []);

  const handleCoverUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setMetadata(prev => ({ ...prev, cover: file }));
      const reader = new FileReader();
      reader.onload = (e) => setCoverPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUrlImport = async () => {
    if (!urlInput.trim()) return;
    
    setIsProcessingUrl(true);
    try {
      // Simulate URL processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setMetadata(prev => ({
        ...prev,
        title: 'Книга из интернета',
        author: 'Автор',
        description: 'Описание книги, загруженной по URL'
      }));
      
      setActiveTab('manual');
    } catch (error) {
      setErrors({ url: 'Не удалось загрузить книгу по ссылке' });
    } finally {
      setIsProcessingUrl(false);
    }
  };

  const validateMetadata = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!metadata.title.trim()) newErrors.title = 'Название обязательно';
    if (!metadata.author.trim()) newErrors.author = 'Автор обязателен';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateMetadata()) return;
    
    const completedUpload = uploads.find(u => u.status === 'completed');
    
    onBookAdded({
      ...metadata,
      ...(completedUpload?.file && { file: completedUpload.file })
    });
    
    handleClose();
  };

  const handleClose = () => {
    setActiveTab('upload');
    setUploads([]);
    setMetadata({
      title: '',
      author: '',
      genre: '',
      description: '',
      isbn: '',
      publicationYear: '',
      collection: collections[0] || ''
    });
    setUrlInput('');
    setCoverPreview(null);
    setErrors({});
    onClose();
  };

  const removeUpload = (file: File) => {
    setUploads(prev => prev.filter(u => u.file !== file));
  };

  const getStatusIcon = (status: UploadProgress['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <File className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusText = (status: UploadProgress['status']) => {
    switch (status) {
      case 'uploading':
        return 'Загрузка...';
      case 'processing':
        return 'Обработка...';
      case 'extracting':
        return 'Извлечение метаданных...';
      case 'completed':
        return 'Завершено';
      case 'error':
        return 'Ошибка';
      default:
        return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">Добавить книгу</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Загрузка файла
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Ручной ввод
            </TabsTrigger>
            <TabsTrigger value="url" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              По ссылке
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                Перетащите файлы сюда или выберите
              </h3>
              <p className="text-muted-foreground mb-4">
                Поддерживаются форматы: EPUB, PDF, MOBI, TXT, DOCX, FB2 и др.
              </p>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Выбрать файлы
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={SUPPORTED_BOOK_FORMATS.join(',')}
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {SUPPORTED_BOOK_FORMATS.slice(0, 8).map(format => (
                  <Badge key={format} variant="secondary" className="text-xs">
                    {format.toUpperCase()}
                  </Badge>
                ))}
                <Badge variant="secondary" className="text-xs">
                  +{SUPPORTED_BOOK_FORMATS.length - 8} ещё
                </Badge>
              </div>
            </div>

            {errors.upload && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4" />
                {errors.upload}
              </div>
            )}

            {uploads.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-semibold">Загруженные файлы:</h4>
                {uploads.map((upload) => (
                  <Card key={upload.file.name}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(upload.status)}
                          <span className="font-medium">{upload.file.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {(upload.file.size / 1024 / 1024).toFixed(1)} MB
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUpload(upload.file)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {upload.status === 'uploading' && (
                        <div className="space-y-2">
                          <Progress value={upload.progress} className="h-2" />
                          <p className="text-sm text-muted-foreground">
                            {getStatusText(upload.status)} {upload.progress}%
                          </p>
                        </div>
                      )}

                      {(upload.status === 'processing' || upload.status === 'extracting') && (
                        <div className="space-y-2">
                          <Progress value={100} className="h-2" />
                          <p className="text-sm text-muted-foreground">
                            {getStatusText(upload.status)}
                          </p>
                        </div>
                      )}

                      {upload.status === 'completed' && upload.metadata && (
                        <div className="mt-3 p-3 bg-green-50 rounded-md">
                          <p className="text-sm text-green-700 mb-2">
                            ✓ Метаданные извлечены успешно
                          </p>
                          <div className="text-xs text-green-600 space-y-1">
                            <p><strong>Название:</strong> {upload.metadata.title}</p>
                            <p><strong>Автор:</strong> {upload.metadata.author}</p>
                            {upload.metadata.genre && (
                              <p><strong>Жанр:</strong> {upload.metadata.genre}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {upload.status === 'error' && (
                        <div className="mt-3 p-3 bg-red-50 rounded-md">
                          <p className="text-sm text-red-700">
                            ❌ {upload.error}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="url" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5" />
                  Импорт по ссылке
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url-input">Ссылка на книгу</Label>
                  <div className="flex gap-2">
                    <Input
                      id="url-input"
                      placeholder="https://example.com/book.epub"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleUrlImport}
                      disabled={isProcessingUrl || !urlInput.trim()}
                    >
                      {isProcessingUrl ? 'Загрузка...' : 'Импорт'}
                    </Button>
                  </div>
                </div>

                {errors.url && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {errors.url}
                  </div>
                )}

                <div className="text-sm text-muted-foreground">
                  <p>Поддерживаются прямые ссылки на файлы книг или страницы с метаданными:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Прямые ссылки на файлы (*.epub, *.pdf, etc.)</li>
                    <li>Project Gutenberg</li>
                    <li>Internet Archive</li>
                    <li>Другие открытые библиотеки</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manual" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main form */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Book className="h-5 w-5" />
                      Основная информация
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title" className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Название *
                        </Label>
                        <Input
                          id="title"
                          value={metadata.title}
                          onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                          className={errors.title ? 'border-red-500' : ''}
                        />
                        {errors.title && (
                          <p className="text-sm text-red-500">{errors.title}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="author" className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Автор *
                        </Label>
                        <Input
                          id="author"
                          value={metadata.author}
                          onChange={(e) => setMetadata(prev => ({ ...prev, author: e.target.value }))}
                          className={errors.author ? 'border-red-500' : ''}
                        />
                        {errors.author && (
                          <p className="text-sm text-red-500">{errors.author}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="genre" className="flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          Жанр
                        </Label>
                        <Select
                          value={metadata.genre}
                          onValueChange={(value) => setMetadata(prev => ({ ...prev, genre: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите жанр" />
                          </SelectTrigger>
                          <SelectContent>
                            {BOOK_GENRES.map(genre => (
                              <SelectItem key={genre} value={genre}>
                                {genre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="collection" className="flex items-center gap-2">
                          <Book className="h-4 w-4" />
                          Коллекция
                        </Label>
                        <Select
                          value={metadata.collection}
                          onValueChange={(value) => setMetadata(prev => ({ ...prev, collection: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {collections.map(collection => (
                              <SelectItem key={collection} value={collection}>
                                {collection}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="flex items-center gap-2">
                        <AlignLeft className="h-4 w-4" />
                        Описание
                      </Label>
                      <Textarea
                        id="description"
                        value={metadata.description}
                        onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Дополнительные данные</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="isbn" className="flex items-center gap-2">
                          <Hash className="h-4 w-4" />
                          ISBN
                        </Label>
                        <Input
                          id="isbn"
                          value={metadata.isbn}
                          onChange={(e) => setMetadata(prev => ({ ...prev, isbn: e.target.value }))}
                          placeholder="978-0-123456-78-9"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="year" className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Год издания
                        </Label>
                        <Input
                          id="year"
                          type="number"
                          value={metadata.publicationYear}
                          onChange={(e) => setMetadata(prev => ({ ...prev, publicationYear: e.target.value }))}
                          placeholder="2024"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Cover upload */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="h-5 w-5" />
                      Обложка
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="aspect-[3/4] border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center">
                      {coverPreview ? (
                        <div className="relative w-full h-full">
                          <img
                            src={coverPreview}
                            alt="Cover preview"
                            className="w-full h-full object-cover rounded-md"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => {
                              setCoverPreview(null);
                              setMetadata(prev => ({ ...prev, cover: undefined }));
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                          <p className="text-sm text-muted-foreground text-center mb-4">
                            Загрузите обложку книги
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => coverInputRef.current?.click()}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Выбрать
                          </Button>
                        </>
                      )}
                    </div>
                    
                    <input
                      ref={coverInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      className="hidden"
                    />
                    
                    <p className="text-xs text-muted-foreground">
                      Рекомендуемое соотношение 3:4 (например, 300×400px)
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button variant="outline" onClick={handleClose}>
            Отмена
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={
              (activeTab === 'upload' && !uploads.some(u => u.status === 'completed')) ||
              (activeTab === 'manual' && (!metadata.title.trim() || !metadata.author.trim()))
            }
          >
            <Plus className="h-4 w-4 mr-2" />
            Добавить книгу
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};