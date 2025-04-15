"use client"

import type React from "react"
import { Box, Avatar, Typography, Button, Card, CardContent } from "@mui/material"
import { Link } from "react-router-dom"
import { User } from "../../../types/user"

interface UserItemProps {
  user: User
  onAddFriend: (userId: number) => void
  isFriend?: boolean
}

const UserItem: React.FC<UserItemProps> = ({ user, onAddFriend, isFriend = false }) => {
  return (
    <Card sx={{ mb: 2, width: "100%" }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
            <Avatar
              src={user.avatar}
              alt={user.name}
              sx={{
                width: 60,
                height: 60,
                mr: 2,
                border: "2px solid",
                borderColor: "primary.light",
              }}
            />
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", flexDirection: "column", mb: 0.5 }}>
                <Typography
                  variant="h6"
                  component={Link}
                  to={`/profile/${user.email.replace("@", "")}`}
                  sx={{
                    fontWeight: 600,
                    color: "text.primary",
                    textDecoration: "none",
                    "&:hover": {
                      textDecoration: "underline",
                      color: "primary.main",
                    },
                  }}
                >
                  {user.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Button
            variant={isFriend ? "outlined" : "contained"}
            color={isFriend ? "primary" : "primary"}
            size="small"
            onClick={() => onAddFriend(user.id)}
            sx={{ minWidth: 100, ml: 2 }}
          >
            {isFriend ? "Đã kết bạn" : "Kết bạn"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}

export default UserItem
