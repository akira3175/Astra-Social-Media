import type React from "react"
import { Box, Grid, Paper, Typography } from "@mui/material"
import { getImages } from "../../../services/PostService"
import { useEffect } from "react"
import { useState } from "react"
import type { Image } from "../../../types/image"
import type { User } from "../../../types/user"

const ProfilePhotos: React.FC<{ user: User }> = ({ user }) => {
  const [images, setImages] = useState<Image[]>([])

  useEffect(() => {
    console.log(user)
    getImages(user.email).then(setImages)
  }, [])

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6">Ảnh</Typography>
        {/* <Button size="small" sx={{ textTransform: "none", outline: "none", "&:focus": { outline: "none" } }}>
          Xem tất cả
        </Button> */}
      </Box>
      <Grid container spacing={1}>
        {images.map((photo, index) => (
          <Grid item xs={4} key={index}>
            <Box
              sx={{
                width: "100%",
                paddingTop: "100%", // Tạo hình vuông
                position: "relative",
                overflow: "hidden",
                borderRadius: 1,
              }}
            >
              <Box
                component="img"
                src={photo.url}
                alt={`Photo ${index + 1}`}
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  )
}

export default ProfilePhotos

