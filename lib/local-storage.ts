"use client"

import type { Book, Member, Loan } from "./types"

const BOOKS_KEY = "library_books"
const MEMBERS_KEY = "library_members"
const LOANS_KEY = "library_loans"

export const loadBooks = (): Book[] => {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(BOOKS_KEY)
  return data ? JSON.parse(data) : []
}

export const saveBooks = (books: Book[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem(BOOKS_KEY, JSON.stringify(books))
}

export const loadMembers = (): Member[] => {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(MEMBERS_KEY)
  return data ? JSON.parse(data) : []
}

export const saveMembers = (members: Member[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members))
}

export const loadLoans = (): Loan[] => {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(LOANS_KEY)
  return data ? JSON.parse(data) : []
}

export const saveLoans = (loans: Loan[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem(LOANS_KEY, JSON.stringify(loans))
}
