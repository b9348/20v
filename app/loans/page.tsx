"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, RotateCcw } from "lucide-react"
import type { Loan, Book, Member } from "@/lib/types"
import { loadLoans, saveLoans, loadBooks, saveBooks as saveBooksData, loadMembers } from "@/lib/local-storage"
import { Badge } from "@/components/ui/badge"

const LOAN_DURATION_DAYS = 14

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [members, setMembers] = useState<Member[]>([])

  const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false)
  const [selectedBookId, setSelectedBookId] = useState<string>("")
  const [selectedMemberId, setSelectedMemberId] = useState<string>("")

  useEffect(() => {
    setLoans(loadLoans())
    setBooks(loadBooks())
    setMembers(loadMembers())
  }, [])

  useEffect(() => {
    saveLoans(loans)
  }, [loans])

  useEffect(() => {
    saveBooksData(books) // Save books if their 'available' count changes
  }, [books])

  const getBookTitle = (bookId: string) => books.find((b) => b.id === bookId)?.title || "Unknown Book"
  const getMemberName = (memberId: string) => members.find((m) => m.id === memberId)?.name || "Unknown Member"

  const handleIssueBook = () => {
    if (!selectedBookId || !selectedMemberId) {
      alert("Please select a book and a member.")
      return
    }

    const bookToLoan = books.find((b) => b.id === selectedBookId)
    if (!bookToLoan || bookToLoan.available <= 0) {
      alert("Selected book is not available.")
      return
    }

    const borrowDate = new Date()
    const dueDate = new Date(borrowDate)
    dueDate.setDate(borrowDate.getDate() + LOAN_DURATION_DAYS)

    const newLoan: Loan = {
      id: crypto.randomUUID(),
      bookId: selectedBookId,
      memberId: selectedMemberId,
      borrowDate: borrowDate.toISOString(),
      dueDate: dueDate.toISOString(),
      returnDate: null,
    }

    setLoans((prevLoans) => [...prevLoans, newLoan])
    setBooks((prevBooks) =>
      prevBooks.map((b) =>
        b.id === selectedBookId ? { ...b, available: b.available - 1, timesBorrowed: (b.timesBorrowed || 0) + 1 } : b,
      ),
    )

    setIsIssueDialogOpen(false)
    setSelectedBookId("")
    setSelectedMemberId("")
  }

  const handleReturnBook = (loanId: string) => {
    const loanToReturn = loans.find((l) => l.id === loanId)
    if (!loanToReturn) return

    setLoans((prevLoans) =>
      prevLoans.map((l) => (l.id === loanId ? { ...l, returnDate: new Date().toISOString() } : l)),
    )
    setBooks((prevBooks) =>
      prevBooks.map((b) => (b.id === loanToReturn.bookId ? { ...b, available: b.available + 1 } : b)),
    )
  }

  const activeLoans = useMemo(() => {
    return loans
      .filter((loan) => !loan.returnDate)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  }, [loans])

  const availableBooksForLoan = useMemo(() => books.filter((b) => b.available > 0), [books])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Loans</h1>
        <Button
          onClick={() => setIsIssueDialogOpen(true)}
          disabled={availableBooksForLoan.length === 0 || members.length === 0}
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Issue New Loan
        </Button>
      </div>
      {availableBooksForLoan.length === 0 && <p className="text-orange-600">No books currently available to loan.</p>}
      {members.length === 0 && <p className="text-orange-600">No members registered to issue loans to.</p>}

      <Dialog open={isIssueDialogOpen} onOpenChange={setIsIssueDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Issue New Loan</DialogTitle>
            <DialogDescription>Select a book and a member to issue a new loan.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="book" className="text-right">
                Book
              </Label>
              <Select value={selectedBookId} onValueChange={setSelectedBookId}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a book" />
                </SelectTrigger>
                <SelectContent>
                  {availableBooksForLoan.map((book) => (
                    <SelectItem key={book.id} value={book.id}>
                      {book.title} ({book.author}) - {book.available} available
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="member" className="text-right">
                Member
              </Label>
              <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a member" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} ({member.memberId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsIssueDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleIssueBook}>
              Issue Loan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <h2 className="text-2xl font-semibold">Active Loans</h2>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Book Title</TableHead>
              <TableHead>Member Name</TableHead>
              <TableHead>Borrow Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeLoans.length > 0 ? (
              activeLoans.map((loan) => {
                const isOverdue = new Date(loan.dueDate) < new Date() && !loan.returnDate
                return (
                  <TableRow key={loan.id}>
                    <TableCell className="font-medium">{getBookTitle(loan.bookId)}</TableCell>
                    <TableCell>{getMemberName(loan.memberId)}</TableCell>
                    <TableCell>{new Date(loan.borrowDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(loan.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {isOverdue ? (
                        <Badge variant="destructive">Overdue</Badge>
                      ) : (
                        <Badge variant="secondary">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button onClick={() => handleReturnBook(loan.id)} size="sm">
                        <RotateCcw className="mr-2 h-4 w-4" /> Return Book
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  No active loans.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
