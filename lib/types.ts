export interface Book {
  id: string
  title: string
  author: string
  isbn: string
  publicationYear: string
  quantity: number
  available: number
  timesBorrowed: number
}

export interface Member {
  id: string
  memberId: string // Library-specific ID
  name: string
  email: string
  phone?: string
  joinDate: string // ISO string
}

export interface Loan {
  id: string
  bookId: string
  memberId: string
  borrowDate: string // ISO string
  dueDate: string // ISO string
  returnDate?: string | null // ISO string or null if not returned
}
