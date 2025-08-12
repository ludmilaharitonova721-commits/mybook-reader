"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Image, Book, X, Check, Loader2, Search, Plus } from "lucide-react";

const bookFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  genre: z.string().optional(),
  description: z.string().optional(),
  collection: z.string().optional(),
  format: z.string(),
  isbn: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

type BookFormData = z.infer<typeof bookFormSchema>;

interface Collection {
  id: string;
  name: string;
}

interface BookAddDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onBookAdded: (book: BookFormData & { coverImage?: File }) => Promise<void>;
  collections: Collection[];
}

const BOOK_FORMATS = [
  { value: "epub", label: "EPUB" },
  { value: "pdf", label: "PDF" },
  { value: "txt", label: "TXT" },
  { value: "mobi", label: "MOBI" },
  { value: "azw", label: "AZW" },
  { value: "fb2", label: "FB2" },
];

export const BookAddDialog = ({ isOpen, onClose, onBookAdded, collections }: BookAddDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [isLookingUpISBN, setIsLookingUpISBN] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<BookFormData>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      title: "",
      author: "",
      genre: "",
      description: "",
      collection: "",
      format: "epub",
      isbn: "",
      tags: [],
    },
  });

  const handleFileUpload = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !form.getValues("tags").includes(trimmedTag)) {
      const currentTags = form.getValues("tags");
      form.setValue("tags", [...currentTags, trimmedTag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags");
    form.setValue("tags", currentTags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const lookupISBN = async () => {
    const isbn = form.getValues("isbn");
    if (!isbn) return;

    setIsLookingUpISBN(true);
    try {
      // Simulate ISBN lookup - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock data - replace with actual API response
      form.setValue("title", "Sample Book Title");
      form.setValue("author", "Sample Author");
      form.setValue("genre", "Fiction");
      form.setValue("description", "A sample book description from ISBN lookup.");
    } catch (error) {
      console.error("ISBN lookup failed:", error);
    } finally {
      setIsLookingUpISBN(false);
    }
  };

  const onSubmit = async (data: BookFormData) => {
    setIsLoading(true);
    try {
      await onBookAdded({ ...data, coverImage: coverImage || undefined });
      setIsSuccess(true);
      
      // Reset form and state after short delay to show success
      setTimeout(() => {
        form.reset();
        setCoverImage(null);
        setCoverPreview(null);
        setTagInput("");
        setIsSuccess(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Failed to add book:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      form.reset();
      setCoverImage(null);
      setCoverPreview(null);
      setTagInput("");
      setIsSuccess(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Book className="h-5 w-5" />
            Add New Book
          </DialogTitle>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="rounded-full bg-green-100 dark:bg-green-900 p-3">
              <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                Book Added Successfully!
              </h3>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                Your book has been added to the library.
              </p>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Cover Image Upload */}
              <div className="space-y-2">
                <FormLabel>Cover Image</FormLabel>
                <Card className="p-4">
                  <CardContent className="p-0">
                    {coverPreview ? (
                      <div className="relative">
                        <img
                          src={coverPreview}
                          alt="Cover preview"
                          className="w-32 h-48 object-cover rounded-lg mx-auto"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6"
                          onClick={() => {
                            setCoverImage(null);
                            setCoverPreview(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                          isDragOver
                            ? "border-primary bg-primary/10"
                            : "border-muted-foreground/25 hover:border-primary/50"
                        }`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                      >
                        <Image className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Drag and drop an image, or{" "}
                          <button
                            type="button"
                            className="text-primary hover:underline"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            browse
                          </button>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, JPEG up to 10MB
                        </p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* ISBN Lookup */}
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="isbn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ISBN (Optional)</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input
                            placeholder="Enter ISBN for auto-fill"
                            {...field}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={lookupISBN}
                          disabled={!field.value || isLookingUpISBN}
                        >
                          {isLookingUpISBN ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Search className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter book title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Author *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter author name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="genre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Genre</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Fiction, Science Fiction" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="format"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Format</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BOOK_FORMATS.map((format) => (
                            <SelectItem key={format.value} value={format.value}>
                              {format.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Collection */}
              <FormField
                control={form.control}
                name="collection"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Collection</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a collection" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {collections.map((collection) => (
                          <SelectItem key={collection.id} value={collection.id}>
                            {collection.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter book description"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tags */}
              <div className="space-y-2">
                <FormLabel>Tags</FormLabel>
                <div className="flex gap-2">
                  <Input