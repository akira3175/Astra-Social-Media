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

  const getDaysAgo = (dateString: string): number => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
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
                      <Avatar src={user.avatar} alt={user.firstName} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={user.firstName + " " + user.lastName}
                      secondary={`${getDaysAgo(user.dateJoined)} ngày trước`}
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
