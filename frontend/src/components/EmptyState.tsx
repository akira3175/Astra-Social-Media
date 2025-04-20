import type React from "react"
import { Box, Typography } from "@mui/material"
import { Notifications, People, Article, Search, Comment, Favorite, PersonAdd } from "@mui/icons-material"

interface EmptyStateProps {
  title: string
  description?: string
  icon?: "notifications" | "people" | "posts" | "search" | "comments" | "likes" | "friends" | string
  children?: React.ReactNode
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon = "notifications", children }) => {
  const getIcon = () => {
    switch (icon) {
      case "notifications":
        return <Notifications sx={{ fontSize: 64, color: "text.disabled" }} />
      case "people":
        return <People sx={{ fontSize: 64, color: "text.disabled" }} />
      case "posts":
        return <Article sx={{ fontSize: 64, color: "text.disabled" }} />
      case "search":
        return <Search sx={{ fontSize: 64, color: "text.disabled" }} />
      case "comments":
        return <Comment sx={{ fontSize: 64, color: "text.disabled" }} />
      case "likes":
        return <Favorite sx={{ fontSize: 64, color: "text.disabled" }} />
      case "friends":
        return <PersonAdd sx={{ fontSize: 64, color: "text.disabled" }} />
      default:
        return <Notifications sx={{ fontSize: 64, color: "text.disabled" }} />
    }
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        py: 6,
        px: 2,
      }}
    >
      <Box sx={{ mb: 2 }}>{getIcon()}</Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mb: 3 }}>
          {description}
        </Typography>
      )}
      {children}
    </Box>
  )
}

export default EmptyState
