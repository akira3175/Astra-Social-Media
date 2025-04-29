import React, { useEffect, useState } from 'react';
import { Box, List, ListItemAvatar, ListItemText, Avatar, Typography, Divider, ListItemButton } from '@mui/material';
import { styled } from '@mui/material/styles';

interface ChatUser {
    id: string;
    name: string;
    avatar?: string;
    lastMessage?: string;
    lastMessageTime?: string;
    unreadCount?: number;
}

interface ChatUserListProps {
    currentUserId: string;
    onSelectUser: (userId: string) => void;
}

const StyledListItem = styled(ListItemButton)(({ theme }) => ({
    '&.Mui-selected': {
        backgroundColor: theme.palette.primary.light,
        '&:hover': {
            backgroundColor: theme.palette.primary.light,
        },
    },
}));

const ChatUserList: React.FC<ChatUserListProps> = ({ currentUserId, onSelectUser }) => {
    const [users, setUsers] = useState<ChatUser[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    const loadUsers = () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            console.log('User not logged in, redirecting to login page');
            window.location.href = '/login';
            return;
        }

        fetch(`http://localhost:8080/api/chat/users/${currentUserId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        })
            .then(res => {
                if (!res.ok) {
                    if (res.status === 401) {
                        localStorage.removeItem('accessToken');
                        window.location.href = '/login';
                        return;
                    }
                    if (res.status === 400) {
                        throw new Error('Invalid request');
                    }
                    if (res.status === 404) {
                        setUsers([]);
                        return;
                    }
                    throw new Error(`Network response was not ok: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                if (data) {
                    console.log("Loaded chat users:", data);
                    setUsers(data);
                }
            })
            .catch(error => {
                console.error('Error fetching chat users:', error);
                setUsers([]);
            });
    };

    useEffect(() => {
        loadUsers();
        // Cập nhật danh sách người dùng mỗi 5 giây
        const interval = setInterval(loadUsers, 5000);
        return () => clearInterval(interval);
    }, [currentUserId]);

    const handleUserClick = (userId: string) => {
        setSelectedUserId(userId);
        onSelectUser(userId);
    };

    return (
        <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
            <Typography variant="h6" sx={{ p: 2 }}>
                Tin nhắn
            </Typography>
            <Divider />
            <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                {users.map((user) => (
                    <StyledListItem
                        key={user.id}
                        selected={selectedUserId === user.id}
                        onClick={() => handleUserClick(user.id)}
                    >
                        <ListItemAvatar>
                            <Avatar
                                alt={user.name}
                                src={user.avatar ? `http://localhost:8080${user.avatar}` : undefined}
                                sx={{
                                    width: 40,
                                    height: 40,
                                    bgcolor: !user.avatar ? 'primary.main' : 'transparent'
                                }}
                            >
                                {!user.avatar && user.name.charAt(0)}
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={user.name}
                            secondary={
                                <React.Fragment>
                                    <Typography
                                        sx={{ display: 'inline' }}
                                        component="span"
                                        variant="body2"
                                        color="text.primary"
                                    >
                                        {user.lastMessage}
                                    </Typography>
                                    {user.lastMessageTime && ` — ${new Date(user.lastMessageTime).toLocaleTimeString()}`}
                                </React.Fragment>
                            }
                        />
                        {user.unreadCount && user.unreadCount > 0 && (
                            <Box
                                sx={{
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: 24,
                                    height: 24,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.75rem',
                                    animation: 'pulse 2s infinite',
                                    '@keyframes pulse': {
                                        '0%': {
                                            transform: 'scale(1)',
                                        },
                                        '50%': {
                                            transform: 'scale(1.1)',
                                        },
                                        '100%': {
                                            transform: 'scale(1)',
                                        },
                                    },
                                }}
                            >
                                {user.unreadCount}
                            </Box>
                        )}
                    </StyledListItem>
                ))}
            </List>
        </Box>
    );
};

export default ChatUserList; 