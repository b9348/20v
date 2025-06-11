"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Loan, Book, Member } from "@/lib/types"
import { loadLoans, loadBooks, loadMembers } from "@/lib/local-storage"
import { AlertTriangle, TrendingUp } from "lucide-react"

export default function ReportsPage() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [members, setMembers] = useState<Member[]>([])

  useEffect(() => {
    setLoans(loadLoans())
    setBooks(loadBooks())
    setMembers(loadMembers())
  }, [])

  const getBookTitle = (bookId: string) => books.find((b) => b.id === bookId)?.title || "Unknown Book"
  const getMemberName = (memberId: string) => members.find((m) => m.id === memberId)?.name || "Unknown Member"

  const overdueBooksReport = useMemo(() => {
    const today = new Date()
    return loans
      .filter((loan) => !loan.returnDate && new Date(loan.dueDate) < today)
      .map((loan) => ({
        ...loan,
        bookTitle: getBookTitle(loan.bookId),
        memberName: getMemberName(loan.memberId),
        daysOverdue: Math.floor((today.getTime() - new Date(loan.dueDate).getTime()) / (1000 * 3600 * 24)),
      }))
      .sort((a, b) => b.daysOverdue - a.daysOverdue)
  }, [loans, books, members])

  const mostBorrowedBooksReport = useMemo(() => {
    return books
      .filter((book) => book.timesBorrowed > 0)
      .sort((a, b) => b.timesBorrowed - a.timesBorrowed)
      .slice(0, 10) // Top 10
  }, [books])

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Library Reports</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Overdue Books
          </CardTitle>
          <CardDescription>Books that are past their due date and not yet returned.</CardDescription>
        </CardHeader>
        <CardContent>
          {overdueBooksReport.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book Title</TableHead>
                  <TableHead>Member Name</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Days Overdue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overdueBooksReport.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell className="font-medium">{loan.bookTitle}</TableCell>
                    <TableCell>{loan.memberName}</TableCell>
                    <TableCell>{new Date(loan.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right text-destructive font-semibold">{loan.daysOverdue}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">No overdue books at the moment. Great!</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Most Frequently Borrowed Books
          </CardTitle>
          <CardDescription>Top books based on the number of times they have been borrowed.</CardDescription>
        </CardHeader>
        <CardContent>
          {mostBorrowedBooksReport.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Book Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead className="text-right">Times Borrowed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mostBorrowedBooksReport.map((book, index) => (
                  <TableRow key={book.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{book.title}</TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell className="text-right font-semibold">{book.timesBorrowed}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">No borrowing data available yet. Start loaning books!</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
