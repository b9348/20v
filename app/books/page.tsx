"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { PlusCircle, Search, Edit2, Trash2 } from "lucide-react"
import type { Book } from "@/lib/types"
import { loadBooks, saveBooks } from "@/lib/local-storage"

const initialBookFormState: Omit<Book, "id" | "available" | "timesBorrowed"> = {
  title: "",
  author: "",
  isbn: "",
  publicationYear: "",
  quantity: 1,
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentBook, setCurrentBook] = useState<Omit<Book, "id" | "available" | "timesBorrowed"> | Book>(
    initialBookFormState,
  )
  const [editingBookId, setEditingBookId] = useState<string | null>(null)

  useEffect(() => {
    setBooks(loadBooks())
  }, [])

  useEffect(() => {
    saveBooks(books)
  }, [books])

  const handleAddBook = () => {
    if (
      !currentBook.title ||
      !currentBook.author ||
      !currentBook.isbn ||
      !currentBook.publicationYear ||
      currentBook.quantity < 1
    ) {
      alert("Please fill all fields correctly.")
      return
    }
    const newBook: Book = {
      id: crypto.randomUUID(),
      ...currentBook,
      quantity: Number(currentBook.quantity),
      available: Number(currentBook.quantity), // Initially all copies are available
      timesBorrowed: 0,
    }
    setBooks((prevBooks) => [...prevBooks, newBook])
    setIsDialogOpen(false)
    setCurrentBook(initialBookFormState)
  }

  const handleUpdateBook = () => {
    if (
      !editingBookId ||
      !currentBook.title ||
      !currentBook.author ||
      !currentBook.isbn ||
      !currentBook.publicationYear ||
      (currentBook as Book).quantity < 1
    ) {
      alert("Please fill all fields correctly.")
      return
    }
    setBooks((prevBooks) =>
      prevBooks.map((book) =>
        book.id === editingBookId
          ? { ...book, ...(currentBook as Book), quantity: Number((currentBook as Book).quantity) } // Ensure available is handled correctly if quantity changes
          : book,
      ),
    )
    setIsDialogOpen(false)
    setCurrentBook(initialBookFormState)
    setEditingBookId(null)
  }

  const handleDeleteBook = (id: string) => {
    if (confirm("Are you sure you want to delete this book? This action cannot be undone.")) {
      // Add check here: if book is currently on loan, prevent deletion or handle accordingly.
      // For simplicity, we'll allow deletion for now.
      setBooks((prevBooks) => prevBooks.filter((book) => book.id !== id))
    }
  }

  const openEditDialog = (book: Book) => {
    setEditingBookId(book.id)
    setCurrentBook(book)
    setIsDialogOpen(true)
  }

  const openAddDialog = () => {
    setEditingBookId(null)
    setCurrentBook(initialBookFormState)
    setIsDialogOpen(true)
  }

  const filteredBooks = useMemo(() => {
    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.isbn.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [books, searchTerm])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCurrentBook((prev) => ({ ...prev, [name]: name === "quantity" ? Number.parseInt(value, 10) : value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Books</h1>
        <Button onClick={openAddDialog}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Book
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by title, author, or ISBN..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingBookId ? "Edit Book" : "Add New Book"}</DialogTitle>
            <DialogDescription>
              {editingBookId ? "Update the details of this book." : "Enter the details of the new book."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                name="title"
                value={currentBook.title}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="author" className="text-right">
                Author
              </Label>
              <Input
                id="author"
                name="author"
                value={currentBook.author}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isbn" className="text-right">
                ISBN
              </Label>
              <Input
                id="isbn"
                name="isbn"
                value={currentBook.isbn}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="publicationYear" className="text-right">
                Year
              </Label>
              <Input
                id="publicationYear"
                name="publicationYear"
                type="number"
                value={currentBook.publicationYear}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantity
              </Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                value={currentBook.quantity}
                min="1"
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={editingBookId ? handleUpdateBook : handleAddBook}>
              {editingBookId ? "Save Changes" : "Add Book"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>ISBN</TableHead>
              <TableHead>Year</TableHead>
              <TableHead className="text-center">Quantity</TableHead>
              <TableHead className="text-center">Available</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBooks.length > 0 ? (
              filteredBooks.map((book) => (
                <TableRow key={book.id}>
                  <TableCell className="font-medium">{book.title}</TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>{book.isbn}</TableCell>
                  <TableCell>{book.publicationYear}</TableCell>
                  <TableCell className="text-center">{book.quantity}</TableCell>
                  <TableCell className="text-center">{book.available}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(book)} className="mr-2">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteBook(book.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">
                  No books found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
