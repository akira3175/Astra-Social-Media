import { Person } from "@mui/icons-material";
import {
  Grid,
  Card,
  CardContent,
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
} from "@mui/material";
import { User } from "../../../services/adminService";

const NewUserOveriew = ({
  users,
  isLoading,
}: {
  users: User[];
  isLoading: boolean;
}) => {
  const top4NewUsers = users
    .sort(
      (a, b) =>
        new Date(b.dateJoined).getTime() - new Date(a.dateJoined).getTime()
    )
    .slice(0, 4);

    const getTimeAgo = (dateString: string): string => {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
    
      const minutes = Math.floor(diffTime / (1000 * 60));
      const hours = Math.floor(diffTime / (1000 * 60 * 60));
      const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const weeks = Math.floor(days / 7);
      const months = Math.floor(days / 30); // Approximation
      const years = Math.floor(days / 365); // Approximation
    
      if (minutes < 60) {
        return `${minutes} phút trước`;
      } else if (hours < 24) {
        return `${hours} giờ trước`;
      } else if (days < 7) {
        return `${days} ngày trước`;
      } else if (weeks < 4) {
        return `${weeks} tuần trước`;
      } else if (months < 12) {
        return `${months} tháng trước`;
      } else {
        return `${years} năm trước`;
      }
    };

  return (
    <Grid item xs={12} md={6} lg={4}>
      <Card sx={{ height: "100%" }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Person sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6">Người dùng mới</Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          {isLoading && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="body2">Đang tải...</Typography>
            </Box>
          )}
          {!isLoading && (
            <List disablePadding>
              {users.length === 0 && (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography variant="body2">
                    Không có người dùng nào {":("}
                  </Typography>
                </Box>
              )}
              {users.length > 0 &&
                top4NewUsers.map((user) => (
                  <ListItem key={user.id} disablePadding sx={{ mb: 2 }}>
                    <ListItemAvatar>
                      <Avatar src={user.avatar ||""} alt={user.firstName} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={user.firstName + " " + user.lastName}
                      secondary={`${getTimeAgo(user.dateJoined)}`}
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </ListItem>
                ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Grid>
  );
};

export default NewUserOveriew;
