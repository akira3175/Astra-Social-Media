import type React from "react"
import { Avatar, Box, Button, Grid, Paper, Typography } from "@mui/material"

const ProfileFriends: React.FC = () => {
    // Dữ liệu mẫu cho bạn bè
    const SAMPLE_FRIENDS = [
        { name: "Nguyễn Văn A", avatar: "https://i.pravatar.cc/150?img=1" },
        { name: "Trần Thị B", avatar: "https://i.pravatar.cc/150?img=2" },
        { name: "Lê Văn C", avatar: "https://i.pravatar.cc/150?img=3" },
        { name: "Phạm Thị D", avatar: "https://i.pravatar.cc/150?img=4" },
        { name: "Hoàng Văn E", avatar: "https://i.pravatar.cc/150?img=5" },
        { name: "Ngô Thị F", avatar: "https://i.pravatar.cc/150?img=6" },
        { name: "Đỗ Văn G", avatar: "https://i.pravatar.cc/150?img=7" },
        { name: "Vũ Thị H", avatar: "https://i.pravatar.cc/150?img=8" },
        { name: "Bùi Văn I", avatar: "https://i.pravatar.cc/150?img=9" },
    ]

    return (
        <Paper sx={{ p: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6">Bạn bè</Typography>
                <Button size="small" sx={{ textTransform: "none", outline: "none", "&:focus": { outline: "none" } }}>
                    Xem tất cả
                </Button>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {SAMPLE_FRIENDS.length} bạn bè
            </Typography>
            <Grid container spacing={1}>
                {SAMPLE_FRIENDS.map((friend, index) => (
                    <Grid item xs={4} key={index}>
                        <Box sx={{ textAlign: "center" }}>
                            <Box
                                sx={{
                                    width: "100%",
                                    paddingTop: "100%", // Tạo hình vuông
                                    position: "relative",
                                    overflow: "hidden",
                                    borderRadius: 1,
                                    mb: 0.5,
                                }}
                            >
                                <Avatar
                                    src={friend.avatar}
                                    alt={friend.name}
                                    sx={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        width: "100%",
                                        height: "100%",
                                    }}
                                />
                            </Box>
                            <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                                {friend.name}
                            </Typography>
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Paper>
    )
}

export default ProfileFriends

