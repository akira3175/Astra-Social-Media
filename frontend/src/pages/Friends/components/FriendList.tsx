import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Grid,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { PersonRemove } from "@mui/icons-material";
import { useCurrentUser } from "../../../contexts/currentUserContext";
import friendshipService from "../../../services/friendshipService";
import { Link } from "react-router-dom";
import { Friendship } from "../../../types/friendship";

interface Friend {
  id: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string;
  };
  friend: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string;
  };
  createdAt: string;
}

const FriendList: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const { currentUser } = useCurrentUser();

  useEffect(() => {
    if (currentUser?.id) {
      loadFriends();
    }
  }, [currentUser?.id]);

  const loadFriends = async () => {
    try {
      setLoading(true);
      const data = await friendshipService.getFriends();
      const formattedData = data.map((friend: Friendship) => ({
        ...friend,
        user: {
          ...friend.requester,
          avatar: friend.requester?.avatar
            ? `http://localhost:8080${friend.requester.avatar}`
            : "",
        },
        friend: {
          ...friend.receiver,
          avatar: friend.receiver?.avatar
            ? `http://localhost:8080${friend.receiver.avatar}`
            : "",
        },
      }));
      setFriends(formattedData as unknown as Friend[]);
      setError(null);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Không thể tải danh sách bạn bè");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUnfriend = async (friend: Friend) => {
    setSelectedFriend(friend);
    setOpenDialog(true);
  };

  const confirmUnfriend = async () => {
    if (!selectedFriend) return;

    try {
      await friendshipService.removeFriend(selectedFriend.id);
      // Cập nhật lại danh sách
      setFriends(friends.filter((friend) => friend.id !== selectedFriend.id));
      setOpenDialog(false);
      setSelectedFriend(null);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  };

  const getFriendInfo = (friend: Friend) => {
    return friend.user.id === currentUser?.id ? friend.friend : friend.user;
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (friends.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          Bạn chưa có bạn bè nào
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Grid container spacing={2}>
        {friends.map((friend) => {
          const friendInfo = getFriendInfo(friend);
          return (
            <Grid item xs={12} sm={6} md={4} key={friend.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      src={friendInfo.avatar}
                      alt={`${friendInfo.firstName} ${friendInfo.lastName}`}
                      sx={{ width: 56, height: 56, mr: 2 }}
                    />
                    <Box>
                      <Typography
                        variant="h6"
                        component={Link}
                        to={`/profile/${friendInfo.email}`}
                        sx={{
                          textDecoration: "none",
                          color: "inherit",
                          "&:hover": {
                            color: "primary.main",
                          },
                        }}
                      >
                        {friendInfo.firstName} {friendInfo.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {friendInfo.email}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Đã kết bạn từ {new Date(friend.createdAt).toLocaleString()}
                  </Typography>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<PersonRemove />}
                    onClick={() => handleUnfriend(friend)}
                    fullWidth
                  >
                    Xóa bạn bè
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Xác nhận xóa bạn bè</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa{" "}
            {selectedFriend
              ? `${getFriendInfo(selectedFriend).firstName} ${
                  getFriendInfo(selectedFriend).lastName
                }`
              : ""}{" "}
            khỏi danh sách bạn bè?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button onClick={confirmUnfriend} color="error">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FriendList;
