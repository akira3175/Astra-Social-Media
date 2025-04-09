import type React from "react"
import { Box, Typography, Button } from "@mui/material"
import { Link } from "react-router-dom"
import BasePage from "../Base/BasePage"

const NotFound: React.FC = () => {
  return (
    <BasePage>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          maxHeight="80vh"
          minHeight="80vh"
          textAlign="center"
        >
          <Typography variant="h1" component="h1" gutterBottom>
            404
          </Typography>
          <Typography variant="h4" component="h2" gutterBottom>
            Page Not Found
          </Typography>
          <Typography variant="body1" paragraph>
            The page you are looking for doesn't exist or has been moved.
          </Typography>
          <Button component={Link} to="/" variant="contained" color="primary">
            Go to Home
          </Button>
        </Box>
    </BasePage>
  )
}

export default NotFound