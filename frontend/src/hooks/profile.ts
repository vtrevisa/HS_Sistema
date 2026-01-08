import { useState } from "react"
import type { UserRequest, UserRole } from "@/http/types/user"
import { useUser } from "@/http/use-user"

export function useUserActions() {

const { updateUser, deleteUser } = useUser()

const [selectedUser, setSelectedUser] = useState<UserRequest | null>(null)
const [editModalOpen, setEditModalOpen] = useState(false)
const [roleModalOpen, setRoleModalOpen] = useState(false)
const [deleteModalOpen, setDeleteModalOpen] = useState(false)

function handleEditUser(user: UserRequest) {
  setSelectedUser(user)
  setEditModalOpen(true)
}

function handleToggleDeleteUser(user: UserRequest) {
  setSelectedUser(user)
  setDeleteModalOpen(true)
}

function handleToggleRole(user: UserRequest) {
  setSelectedUser(user)
  setRoleModalOpen(true)
}

function confirmToggleRole(newRole: UserRole) {
  if (!selectedUser) return

  updateUser.mutate(
   {
    ...selectedUser,
    role: newRole
   },
   {
    onSuccess: () => {
     setRoleModalOpen(false)
     setSelectedUser(null)
    }
   }
  )
 }

function handleDeleteUser() {
  if (!selectedUser) return

  deleteUser.mutate(selectedUser.id, {
   onSuccess: () => {
    setDeleteModalOpen(false)
    setSelectedUser(null)
   }
  })
 }


  return {
    selectedUser,
    setSelectedUser,
    deleteUser,

    editModalOpen,
    roleModalOpen,
    deleteModalOpen,

    setEditModalOpen,
    setRoleModalOpen,
    setDeleteModalOpen,

    handleEditUser,
    handleToggleDeleteUser,
    handleToggleRole,
    confirmToggleRole,
    handleDeleteUser
  }
}