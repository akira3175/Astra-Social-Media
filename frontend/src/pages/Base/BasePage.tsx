import type React from "react"
import type { ReactNode } from "react"
import { Box, Toolbar } from "@mui/material"
import Navbar from "./components/Navbar"
import { CurrentUserProvider } from "../../contexts/currentUserContext";

interface BasePageProps {
  children: ReactNode
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false
  disablePadding?: boolean
}

const BasePage: React.FC<BasePageProps> = ({ children }) => {

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "auto", 
        width: "100%",
        maxWidth: "100%",
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
        overflow: "auto",
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
          overflow: "auto", 
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

