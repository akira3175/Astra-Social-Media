import type React from "react"
import { Box, Typography, CircularProgress } from "@mui/material"
import UserItem from "./UserItem"
import { User } from "../../../types/user"

interface UserListProps {
  users: User[]
  isLoading: boolean
  onAddFriend: (userId: number) => void
  friendIds?: number[] // IDs of users that are already friends
}

const UserList: React.FC<UserListProps> = ({ users, isLoading, onAddFriend, friendIds = [] }) => {
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (users.length === 0) {
    return (
      <Box sx={{ textAlign: "center", my: 4 }}>
        <Typography variant="body1" color="text.secondary">
          Không tìm thấy người dùng nào
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      {users.map((user) => (
        <UserItem key={user.id} user={user} onAddFriend={onAddFriend} isFriend={friendIds.includes(user.id)} />
      ))}
    </Box>
  )
}

export default UserList
