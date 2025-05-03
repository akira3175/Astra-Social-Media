// import React, { useEffect, useState } from 'react';
// import { Box, List, ListItemAvatar, ListItemText, Avatar, Typography, Divider, ListItemButton } from '@mui/material';
// import { styled } from '@mui/material/styles';
// import MessageService from '../../services/messageService';
// import { User } from '../../types/user';

// interface ChatUserListProps {
//     currentUserId: string;
//     onSelectUser: (userId: string) => void;
// }

// const StyledListItem = styled(ListItemButton)(({ theme }) => ({
//     '&.Mui-selected': {
//         backgroundColor: theme.palette.primary.light,
//         '&:hover': {
//             backgroundColor: theme.palette.primary.light,
//         },
//     },
// }));

// const ChatUserList: React.FC<ChatUserListProps> = ({ currentUserId, onSelectUser }) => {
//     const [users, setUsers] = useState<User[]>([]);
//     const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

//     const loadUsers = () => {
//         MessageService.getChatUsers().then((users: User[]) => {
//             setUsers(users);
//         });
//     };

//     useEffect(() => {
//         loadUsers();
//         // Cập nhật danh sách người dùng mỗi 5 giây
//         const interval = setInterval(loadUsers, 5000);
//         return () => clearInterval(interval);
//     }, [currentUserId]);

//     const handleUserClick = (userId: string) => {
//         setSelectedUserId(userId);
//         onSelectUser(userId);
//     };

//     return (
//         <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
//             <Typography variant="h6" sx={{ p: 2 }}>
//                 Tin nhắn
//             </Typography>
//             <Divider />
//             <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
//                 {users.map((user) => (
//                     <StyledListItem
//                         key={user.id}
//                         selected={selectedUserId === user.id.toString()}
//                         onClick={() => handleUserClick(user.id.toString())}
//                     >
//                         <ListItemAvatar>
//                             <Avatar
//                                 alt={user.name}
//                                 src={user.avatar ? `${user.avatar}` : undefined}
//                                 sx={{
//                                     width: 40,
//                                     height: 40,
//                                     bgcolor: !user.avatar ? 'primary.main' : 'transparent'
//                                 }}
//                             >
//                                 {!user.avatar && user.name.charAt(0)}
//                             </Avatar>
//                         </ListItemAvatar>
//                         <ListItemText
//                             primary={user.name}
//                             secondary={
//                                 <React.Fragment>
//                                     <Typography
//                                         sx={{ display: 'inline' }}
//                                         component="span"
//                                         variant="body2"
//                                         color="text.primary"
//                                     >
//                                         {user.lastMessage}
//                                     </Typography>
//                                     {user.lastMessageTime && ` — ${new Date(user.lastMessageTime).toLocaleTimeString()}`}
//                                 </React.Fragment>
//                             }
//                         />
//                         {user.unreadCount && user.unreadCount > 0 && (
//                             <Box
//                                 sx={{
//                                     bgcolor: 'primary.main',
//                                     color: 'white',
//                                     borderRadius: '50%',
//                                     width: 24,
//                                     height: 24,
//                                     display: 'flex',
//                                     alignItems: 'center',
//                                     justifyContent: 'center',
//                                     fontSize: '0.75rem',
//                                     animation: 'pulse 2s infinite',
//                                     '@keyframes pulse': {
//                                         '0%': {
//                                             transform: 'scale(1)',
//                                         },
//                                         '50%': {
//                                             transform: 'scale(1.1)',
//                                         },
//                                         '100%': {
//                                             transform: 'scale(1)',
//                                         },
//                                     },
//                                 }}
//                             >
//                                 {user.unreadCount}
//                             </Box>
//                         )}
//                     </StyledListItem>
//                 ))}
//             </List>
//         </Box>
//     );
// };

// export default ChatUserList; 