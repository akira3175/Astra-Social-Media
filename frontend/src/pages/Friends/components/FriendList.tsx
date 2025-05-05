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

const FriendList: React.FC = () => {
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<Friendship | null>(null);
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
      setFriends(data as unknown as Friendship[]);
      console.log("friends", data);
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

  const handleUnfriend = async (friend: Friendship) => {
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
          const friendInfo = friend;
          return (
            <Grid item xs={12} sm={6} md={4} key={friend.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      src={friendInfo.user.avatar}
                      alt={`${friendInfo.user.firstName} ${friendInfo.user.lastName}`}
                      sx={{ width: 56, height: 56, mr: 2 }}
                    />
                    <Box>
                      <Typography
                        variant="h6"
                        component={Link}
                        to={`/profile/${friendInfo.user.email}`}
                        sx={{
                          textDecoration: "none",
                          color: "inherit",
                          "&:hover": {
                            color: "primary.main",
                          },
                        }}
                      >
                        {friendInfo.user.lastName} {friendInfo.user.firstName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {friendInfo.user.email}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Đã kết bạn từ{" "}
                    {new Date(
                      friend.acceptedAt[0] as unknown as number,
                      friend.acceptedAt[1] as unknown as number - 1,
                      friend.acceptedAt[2] as unknown as number,
                      friend.acceptedAt[3] as unknown as number,
                      friend.acceptedAt[4] as unknown as number,
                      friend.acceptedAt[5] as unknown as number
                    ).toLocaleDateString()}
                  </Typography>
                  <Button
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
              ? `${selectedFriend.user.firstName} ${selectedFriend.user.lastName}`
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
