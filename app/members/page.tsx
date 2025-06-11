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
import type { Member } from "@/lib/types"
import { loadMembers, saveMembers } from "@/lib/local-storage"

const initialMemberFormState: Omit<Member, "id" | "joinDate"> = {
  memberId: "",
  name: "",
  email: "",
  phone: "",
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentMember, setCurrentMember] = useState<Omit<Member, "id" | "joinDate"> | Member>(initialMemberFormState)
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null) // Store the main 'id' for editing

  useEffect(() => {
    setMembers(loadMembers())
  }, [])

  useEffect(() => {
    saveMembers(members)
  }, [members])

  const handleAddMember = () => {
    if (!currentMember.name || !currentMember.email || !currentMember.memberId) {
      alert("Please fill Member ID, Name, and Email.")
      return
    }
    if (members.some((m) => m.memberId === currentMember.memberId)) {
      alert("Member ID already exists.")
      return
    }
    const newMember: Member = {
      id: crypto.randomUUID(),
      ...currentMember,
      joinDate: new Date().toISOString(),
    }
    setMembers((prevMembers) => [...prevMembers, newMember])
    setIsDialogOpen(false)
    setCurrentMember(initialMemberFormState)
  }

  const handleUpdateMember = () => {
    if (!editingMemberId || !currentMember.name || !currentMember.email || !(currentMember as Member).memberId) {
      alert("Please fill Member ID, Name, and Email.")
      return
    }
    // Check if memberId is being changed to one that already exists (excluding the current member)
    if (members.some((m) => m.id !== editingMemberId && m.memberId === (currentMember as Member).memberId)) {
      alert("Another member with this Member ID already exists.")
      return
    }
    setMembers((prevMembers) =>
      prevMembers.map((member) =>
        member.id === editingMemberId ? { ...member, ...(currentMember as Member) } : member,
      ),
    )
    setIsDialogOpen(false)
    setCurrentMember(initialMemberFormState)
    setEditingMemberId(null)
  }

  const handleDeleteMember = (id: string) => {
    if (confirm("Are you sure you want to delete this member? This action cannot be undone.")) {
      // Add check here: if member has active loans, prevent deletion or handle accordingly.
      // For simplicity, we'll allow deletion for now.
      setMembers((prevMembers) => prevMembers.filter((member) => member.id !== id))
    }
  }

  const openEditDialog = (member: Member) => {
    setEditingMemberId(member.id)
    setCurrentMember(member)
    setIsDialogOpen(true)
  }

  const openAddDialog = () => {
    setEditingMemberId(null)
    setCurrentMember({
      ...initialMemberFormState,
      memberId: `MEM-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
    }) // Auto-generate a suggestion
    setIsDialogOpen(true)
  }

  const filteredMembers = useMemo(() => {
    return members.filter(
      (member) =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.memberId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [members, searchTerm])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCurrentMember((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Members</h1>
        <Button onClick={openAddDialog}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Member
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by name, Member ID, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingMemberId ? "Edit Member" : "Add New Member"}</DialogTitle>
            <DialogDescription>
              {editingMemberId ? "Update the details of this member." : "Enter the details of the new member."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="memberId" className="text-right">
                Member ID
              </Label>
              <Input
                id="memberId"
                name="memberId"
                value={currentMember.memberId}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={currentMember.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={currentMember.email}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                name="phone"
                value={currentMember.phone || ""}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={editingMemberId ? handleUpdateMember : handleAddMember}>
              {editingMemberId ? "Save Changes" : "Add Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.memberId}</TableCell>
                  <TableCell>{member.name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{member.phone || "N/A"}</TableCell>
                  <TableCell>{new Date(member.joinDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(member)} className="mr-2">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteMember(member.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  No members found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
