"use client";

import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Book, 
  Grid3X3, 
  Search, 
  ArrowLeft,
  BookOpen,
  Check,
  Clock,
  MoreHorizontal
} from "lucide-react";

interface Book {
  id: string;
  title: string;
  author: string;
  cover?: string;
  status?: "want-to-read" | "currently-reading" | "read";
}

interface Collection {
  id: string;
  name: string;
  description?: string;
  books: Book[];
  isDefault?: boolean;
  createdAt: Date;
}

interface BookCollectionManagerProps {
  onCollectionCreate?: (collection: Omit<Collection, 'id' | 'createdAt'>) => void;
  onCollectionSelect?: (collectionId: string) => void;
  onBookAdd?: (collectionId: string, book: Book) => void;
}

export const BookCollectionManager = ({
  onCollectionCreate,
  onCollectionSelect,
  onBookAdd
}: BookCollectionManagerProps) => {
  const [collections, setCollections] = useState<Collection[]>([
    {
      id: "want-to-read",
      name: "Want to Read",
      description: "Books you plan to read",
      books: [],
      isDefault: true,
      createdAt: new Date()
    },
    {
      id: "currently-reading",
      name: "Currently Reading", 
      description: "Books you're reading now",
      books: [],
      isDefault: true,
      createdAt: new Date()
    },
    {
      id: "read",
      name: "Read",
      description: "Books you've finished",
      books: [],
      isDefault: true,
      createdAt: new Date()
    }
  ]);

  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAddBookDialogOpen, setIsAddBookDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDescription, setNewCollectionDescription] = useState("");
  const [newBookTitle, setNewBookTitle] = useState("");
  const [newBookAuthor, setNewBookAuthor] = useState("");

  const filteredCollections = useMemo(() => {
    return collections.filter(collection =>
      collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collection.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [collections, searchQuery]);

  const handleCreateCollection = useCallback(() => {
    if (!newCollectionName.trim()) return;

    const newCollection: Collection = {
      id: Date.now().toString(),
      name: newCollectionName,
      description: newCollectionDescription,
      books: [],
      createdAt: new Date()
    };

    setCollections(prev => [...prev, newCollection]);
    onCollectionCreate?.(newCollection);
    
    setNewCollectionName("");
    setNewCollectionDescription("");
    setIsCreateDialogOpen(false);
  }, [newCollectionName, newCollectionDescription, onCollectionCreate]);

  const handleEditCollection = useCallback((collection: Collection) => {
    setEditingCollection(collection);
    setNewCollectionName(collection.name);
    setNewCollectionDescription(collection.description || "");
    setIsCreateDialogOpen(true);
  }, []);

  const handleUpdateCollection = useCallback(() => {
    if (!editingCollection || !newCollectionName.trim()) return;

    setCollections(prev => prev.map(col => 
      col.id === editingCollection.id 
        ? { ...col, name: newCollectionName, description: newCollectionDescription }
        : col
    ));

    setEditingCollection(null);
    setNewCollectionName("");
    setNewCollectionDescription("");
    setIsCreateDialogOpen(false);
  }, [editingCollection, newCollectionName, newCollectionDescription]);

  const handleDeleteCollection = useCallback((collectionId: string) => {
    setCollections(prev => prev.filter(col => col.id !== collectionId));
    if (selectedCollection === collectionId) {
      setSelectedCollection(null);
    }
  }, [selectedCollection]);

  const handleAddBook = useCallback(() => {
    if (!selectedCollection || !newBookTitle.trim() || !newBookAuthor.trim()) return;

    const newBook: Book = {
      id: Date.now().toString(),
      title: newBookTitle,
      author: newBookAuthor,
      status: selectedCollection === "want-to-read" ? "want-to-read" : 
             selectedCollection === "currently-reading" ? "currently-reading" : "read"
    };

    setCollections(prev => prev.map(col => 
      col.id === selectedCollection 
        ? { ...col, books: [...col.books, newBook] }
        : col
    ));

    onBookAdd?.(selectedCollection, newBook);
    
    setNewBookTitle("");
    setNewBookAuthor("");
    setIsAddBookDialogOpen(false);
  }, [selectedCollection, newBookTitle, newBookAuthor, onBookAdd]);

  const handleRemoveBook = useCallback((collectionId: string, bookId: string) => {
    setCollections(prev => prev.map(col => 
      col.id === collectionId 
        ? { ...col, books: col.books.filter(book => book.id !== bookId) }
        : col
    ));
  }, []);

  const getCollectionStats = useCallback((collection: Collection) => {
    const total = collection.books.length;
    const completed = collection.books.filter(book => book.status === "read").length;
    const inProgress = collection.books.filter(book => book.status === "currently-reading").length;
    return { total, completed, inProgress };
  }, []);

  const getCollectionCover = useCallback((collection: Collection) => {
    const bookWithCover = collection.books.find(book => book.cover);
    return bookWithCover?.cover;
  }, []);

  const selectedCollectionData = collections.find(col => col.id === selectedCollection);

  if (selectedCollection && selectedCollectionData) {
    const stats = getCollectionStats(selectedCollectionData);
    
    return (
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCollection(null)}
              className="hover:bg-accent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Collections
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{selectedCollectionData.name}</h1>
              {selectedCollectionData.description && (
                <p className="text-muted-foreground mt-1">{selectedCollectionData.description}</p>
              )}
            </div>
          </div>
          
          <Dialog open={isAddBookDialogOpen} onOpenChange={setIsAddBookDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Book
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Book to {selectedCollectionData.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Book title"
                  value={newBookTitle}
                  onChange={(e) => setNewBookTitle(e.target.value)}
                />
                <Input
                  placeholder="Author"
                  value={newBookAuthor}
                  onChange={(e) => setNewBookAuthor(e.target.value)}
                />
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleAddBook} className="flex-1">
                    Add Book
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAddBookDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4 mb-6">
          <Card className="flex-1">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Book className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-sm text-muted-foreground">Total Books</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="flex-1">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{stats.completed}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="flex-1">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{stats.inProgress}</div>
                  <div className="text-sm text-muted-foreground">In Progress</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4">
          {selectedCollectionData.books.length === 0 ? (
            <Card className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No books yet</h3>
              <p className="text-muted-foreground mb-4">
                Start building your collection by adding your first book.
              </p>
              <Button onClick={() => setIsAddBookDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Book
              </Button>
            </Card>
          ) : (
            selectedCollectionData.books.map((book) => (
              <Card key={book.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                        <Book className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{book.title}</h3>
                        <p className="text-sm text-muted-foreground">by {book.author}</p>
                        {book.status && (
                          <Badge variant="secondary" className="mt-1">
                            {book.status.replace('-', ' ')}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveBook(selectedCollection, book.id)}
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Collections</h1>
          <p className="text-muted-foreground mt-1">Organize your books into collections</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              New Collection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCollection ? 'Edit Collection' : 'Create New Collection'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Collection name"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
              />
              <Textarea
                placeholder="Description (optional)"
                value={newCollectionDescription}
                onChange={(e) => setNewCollectionDescription(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={editingCollection ? handleUpdateCollection : handleCreateCollection}
                  className="flex-1"
                >
                  {editingCollection ? 'Update' : 'Create'} Collection
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setEditingCollection(null);
                    setNewCollectionName("");
                    setNewCollectionDescription("");
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search collections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Grid3X3 className="h-4 w-4 mr-2" />
          View
        </Button>
      </div>

      