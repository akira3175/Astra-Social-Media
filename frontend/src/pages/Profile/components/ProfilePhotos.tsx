import type React from "react"
import { Box, Button, Grid, Paper, Typography } from "@mui/material"

const ProfilePhotos: React.FC = () => {
  // Dữ liệu mẫu cho ảnh
  const SAMPLE_PHOTOS = [
    "https://source.unsplash.com/random/300x300?nature",
    "https://source.unsplash.com/random/300x300?city",
    "https://source.unsplash.com/random/300x300?people",
    "https://source.unsplash.com/random/300x300?food",
    "https://source.unsplash.com/random/300x300?travel",
    "https://source.unsplash.com/random/300x300?animals",
  ]

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6">Ảnh</Typography>
        <Button size="small" sx={{ textTransform: "none", outline: "none", "&:focus": { outline: "none" } }}>
          Xem tất cả
        </Button>
      </Box>
      <Grid container spacing={1}>
        {SAMPLE_PHOTOS.map((photo, index) => (
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
                src={photo}
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

