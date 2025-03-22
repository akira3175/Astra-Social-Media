import type React from "react"
import { Box, Card, CardActions, CardContent, CardHeader, Skeleton, type SxProps, type Theme } from "@mui/material"

interface PostSkeletonProps {
  className?: string
  sx?: SxProps<Theme>
}

const PostSkeleton: React.FC<PostSkeletonProps> = ({ className, sx }) => {
  return (
    <Card className={className} sx={sx}>
      {/* Header with avatar and username */}
      <CardHeader
        avatar={<Skeleton variant="circular" width={40} height={40} />}
        title={<Skeleton variant="text" width="40%" height={24} />}
        subheader={<Skeleton variant="text" width="20%" height={20} />}
      />

      {/* Content */}
      <CardContent>
        <Skeleton variant="text" height={20} />
        <Skeleton variant="text" height={20} />
        <Skeleton variant="text" width="80%" height={20} />
      </CardContent>

      {/* Image */}
      <Skeleton
        variant="rectangular"
        width="100%"
        height={300}
        sx={{
          opacity: 0.7,
          display: Math.random() > 0.3 ? "block" : "none", // Randomly show image skeleton
        }}
      />

      {/* Actions */}
      <CardActions>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Skeleton variant="circular" width={32} height={32} sx={{ mr: 1 }} />
            <Skeleton variant="text" width={20} height={24} sx={{ mr: 2 }} />
            <Skeleton variant="circular" width={32} height={32} sx={{ mr: 1 }} />
            <Skeleton variant="text" width={20} height={24} sx={{ mr: 2 }} />
            <Skeleton variant="circular" width={32} height={32} />
          </Box>
          <Skeleton variant="circular" width={32} height={32} />
        </Box>
      </CardActions>
    </Card>
  )
}

export default PostSkeleton

