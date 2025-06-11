"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, ListChecks } from "lucide-react"
import { loadBooks, loadMembers, loadLoans } from "@/lib/local-storage"
import Link from "next/link"

export default function DashboardPage() {
  const [bookCount, setBookCount] = useState(0)
  const [memberCount, setMemberCount] = useState(0)
  const [activeLoanCount, setActiveLoanCount] = useState(0)

  useEffect(() => {
    setBookCount(loadBooks().length)
    setMemberCount(loadMembers().length)
    setActiveLoanCount(loadLoans().filter((loan) => !loan.returnDate).length)
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Library Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Books</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookCount}</div>
            <p className="text-xs text-muted-foreground">Number of unique book titles</p>
            <Link href="/books" className="text-sm text-primary hover:underline mt-2 block">
              Manage Books
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memberCount}</div>
            <p className="text-xs text-muted-foreground">Total library members</p>
            <Link href="/members" className="text-sm text-primary hover:underline mt-2 block">
              Manage Members
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLoanCount}</div>
            <p className="text-xs text-muted-foreground">Books currently borrowed</p>
            <Link href="/loans" className="text-sm text-primary hover:underline mt-2 block">
              Manage Loans
            </Link>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8 p-4 bg-secondary/50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Welcome to the Library Management System!</h2>
        <p className="text-muted-foreground">
          Use the sidebar to navigate through different sections: manage books, register members, track loans, and view
          reports. This demo uses browser localStorage to save data, so it will persist in your current browser session.
          For a real application, a database backend would be used.
        </p>
      </div>
    </div>
  )
}
