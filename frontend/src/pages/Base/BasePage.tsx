import type React from "react"
import type { ReactNode } from "react"
import { Box, Toolbar, useMediaQuery, useTheme } from "@mui/material"
import Navbar from "./components/Navbar"

interface BasePageProps {
  children: ReactNode
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false
  disablePadding?: boolean
}

const BasePage: React.FC<BasePageProps> = ({ children, maxWidth = "xl", disablePadding = false }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh", 
        width: "100%",
        maxWidth: "100%",
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
        overflow: "hidden", // Ngăn scroll ngang
      }}
    >
      <Navbar />
      {/* Toolbar component acts as a spacer with the same height as the AppBar */}
      <Toolbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: "100%",
          boxSizing: "border-box",
          overflow: "hidden", // Ngăn scroll ngang
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

export default BasePage

