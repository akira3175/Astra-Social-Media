import React, { useEffect, useRef, useState } from "react"
import ReactDOM from "react-dom"
import {
    Box,
    Paper,
    Typography,
    TextField,
    IconButton,
    List,
    ListItem,
    Avatar,
    CircularProgress,
    Badge,
    Tooltip,
    Fade,
    useTheme,
    Popover,
} from "@mui/material"
import { Send, Close, MoreVert, Search, AttachFile, EmojiEmotions } from "@mui/icons-material"
import { styled } from "@mui/material/styles"
import SockJS from 'sockjs-client'
import { Stomp, CompatClient } from '@stomp/stompjs'
import ChatUserList from './ChatUserList'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

interface Message {
    id: string
    senderId: string
    receiverId: string
    content: string
    timestamp: string
    senderAvatar?: string
    senderName: string
    fileUrl?: string
    fileType?: string
    fileName?: string
}

interface ChatUser {
    id: string
    name: string
    avatar?: string
    lastMessage?: string
    lastMessageTime?: string
    unreadCount?: number
}

interface ChatBoxProps {
    isOpen: boolean
    onClose: () => void
    receiverId: string
    currentUserId: string
    onSelectUser?: (userId: string) => void
}

const ChatContainer = styled(Paper)(({ theme }) => ({
    position: "fixed",
    top: 80,
    right: 20,
    width: 800,
    height: 500,
    display: "flex",
    flexDirection: "row",
    zIndex: 1000,
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
    borderRadius: "16px",
    overflow: "hidden",
    background: theme.palette.background.paper,
    transition: "all 0.3s ease-in-out",
    "&:hover": {
        boxShadow: "0 12px 40px rgba(0, 0, 0, 0.2)",
    }
}))

const ChatList = styled(Box)(({ theme }) => ({
    width: 300,
    borderRight: `1px solid ${theme.palette.divider}`,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    background: theme.palette.background.default,
    "&::-webkit-scrollbar": {
        width: "6px",
    },
    "&::-webkit-scrollbar-thumb": {
        backgroundColor: theme.palette.primary.main,
        borderRadius: "3px",
    },
}))

const ChatMain = styled(Box)(({ theme }) => ({
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    background: theme.palette.background.paper,
}))

const MessageList = styled(List)(({ theme }) => ({
    flex: 1,
    overflow: "auto",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    alignItems: "stretch",
    "&::-webkit-scrollbar": {
        width: "6px",
    },
    "&::-webkit-scrollbar-thumb": {
        backgroundColor: theme.palette.primary.main,
        borderRadius: "3px",
    },
}))

const MessageItem = styled(ListItem)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    padding: "4px 8px",
    maxWidth: "70%",
    margin: "4px 0",
    width: "auto",
    animation: "fadeIn 0.3s ease-in-out",
    "@keyframes fadeIn": {
        from: {
            opacity: 0,
            transform: "translateY(10px)",
        },
        to: {
            opacity: 1,
            transform: "translateY(0)",
        },
    },
}))

const MessageBubble = styled(Paper)(({ theme }) => ({
    padding: "8px 12px",
    borderRadius: "16px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
    },
}))

const ChatHeader = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    background: theme.palette.background.paper,
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
}))

const InputContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`,
    display: "flex",
    gap: theme.spacing(1),
    alignItems: "center",
    background: theme.palette.background.paper,
}))

const StyledTextField = styled(TextField)(({ theme }) => ({
    "& .MuiOutlinedInput-root": {
        borderRadius: "24px",
        backgroundColor: theme.palette.background.default,
        transition: "all 0.2s ease-in-out",
        "&:hover": {
            backgroundColor: theme.palette.grey[50],
        },
        "&.Mui-focused": {
            backgroundColor: theme.palette.background.paper,
            boxShadow: "0 0 0 2px " + theme.palette.primary.main,
        },
        "& .MuiOutlinedInput-input": {
            zIndex: 1001,
            position: "relative",
        }
    },
}))

const ActionButton = styled(IconButton)(({ theme }) => ({
    color: theme.palette.primary.main,
    transition: "all 0.2s ease-in-out",
    "&:hover": {
        backgroundColor: theme.palette.primary.light,
        color: theme.palette.primary.contrastText,
    },
}))

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const ChatBox: React.FC<ChatBoxProps> = ({ isOpen, onClose, receiverId, currentUserId, onSelectUser }) => {
    const [messages, setMessages] = useState<Message[]>([])
    const [allMessages, setAllMessages] = useState<Message[]>([])
    const messageInputRef = useRef<HTMLInputElement>(null)
    const [ws, setWs] = useState<CompatClient | null>(null)
    const [chatUsers, setChatUsers] = useState<ChatUser[]>([])
    const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isConnecting, setIsConnecting] = useState(false)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [hasMoreMessages, setHasMoreMessages] = useState(true)
    const [sentMessageIds, setSentMessageIds] = useState<Set<string>>(new Set())
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const messageListRef = useRef<any>(null)
    const reconnectAttempts = useRef(0)
    const maxReconnectAttempts = 10
    const lastMessageSenderRef = useRef<string | null>(null)
    const lastUpdateTimeRef = useRef<Date>(new Date())
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const pageSize = 20
    const theme = useTheme()
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [hasNewMessages, setHasNewMessages] = useState(false)
    const [shouldScroll, setShouldScroll] = useState(true)

    // Thêm hàm scrollToBottom
    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }

    const getFileUrl = (fileUrl: string) => {
        if (!fileUrl) return '';

        // Nếu là URL Cloudinary
        if (fileUrl.includes('cloudinary.com')) {
            // Nếu là file PDF hoặc file khác không phải ảnh, thay thế /image/ bằng /raw/
            if (fileUrl.includes('/image/') && !fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                fileUrl = fileUrl.replace('/image/', '/raw/');
            }
            const token = localStorage.getItem('accessToken');
            return `${fileUrl}?token=${token}`;
        }

        // Nếu là URL local
        return fileUrl.startsWith('http') ? fileUrl : `${API_URL}${fileUrl}`;
    };

    // Thêm hàm format thời gian
    const formatTime = (timestamp: string | number[]) => {
        try {
            if (!timestamp) {
                return "00:00"
            }

            let date: Date
            if (Array.isArray(timestamp)) {
                // Xử lý timestamp dạng mảng [year, month, day, hour, minute]
                if (timestamp.length === 5) {
                    date = new Date(timestamp[0], timestamp[1] - 1, timestamp[2], timestamp[3], timestamp[4])
                }
                // Xử lý timestamp dạng mảng [year, month, day, hour, minute, second]
                else if (timestamp.length === 6) {
                    date = new Date(timestamp[0], timestamp[1] - 1, timestamp[2], timestamp[3], timestamp[4], timestamp[5])
                } else {
                    console.error('Invalid timestamp array length:', timestamp)
                    return "00:00"
                }
            } else {
                // Xử lý timestamp dạng chuỗi ISO
                date = new Date(timestamp)
            }

            if (isNaN(date.getTime())) {
                console.error('Invalid timestamp:', timestamp)
                return "00:00"
            }

            const now = new Date()
            const messageDate = date

            // Nếu tin nhắn được gửi trong cùng ngày
            if (messageDate.toDateString() === now.toDateString()) {
                return messageDate.toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                })
            }
            // Nếu tin nhắn được gửi trong cùng tuần
            else if (now.getTime() - messageDate.getTime() <= 7 * 24 * 60 * 60 * 1000) {
                return messageDate.toLocaleDateString('vi-VN', {
                    weekday: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                })
            }
            // Nếu tin nhắn được gửi trước đó
            else {
                return messageDate.toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                })
            }
        } catch (error) {
            console.error('Error formatting time:', error, 'Timestamp:', timestamp)
            return "00:00"
        }
    }

    // Hàm để tải thêm tin nhắn khi cuộn lên
    const loadMoreMessages = () => {
        if (isLoadingMore || !hasMoreMessages) return;

        setIsLoadingMore(true);

        // Lấy tin nhắn tiếp theo từ allMessages
        const currentLength = messages.length;
        const nextMessages = allMessages.slice(currentLength, currentLength + pageSize);

        if (nextMessages.length > 0) {
            setMessages(prev => [...nextMessages, ...prev]);

            // Kiểm tra xem còn tin nhắn để tải không
            if (currentLength + nextMessages.length >= allMessages.length) {
                setHasMoreMessages(false);
            }
        } else {
            setHasMoreMessages(false);
        }

        setIsLoadingMore(false);
    }

    // Xử lý sự kiện cuộn
    const handleScroll = () => {
        if (!messageListRef.current) return;

        const { scrollTop } = messageListRef.current;

        // Nếu cuộn lên gần đầu danh sách, tải thêm tin nhắn
        if (scrollTop < 100 && hasMoreMessages && !isLoadingMore) {
            loadMoreMessages();
        }
    }

    const loadMessages = () => {
        const token = localStorage.getItem('accessToken')
        if (!token) {
            console.log('User not logged in, redirecting to login page')
            window.location.href = '/login'
            return
        }

        if (!receiverId) {
            console.log('No receiver selected')
            return
        }

        setIsLoading(true)
        setShouldScroll(true) // Reset shouldScroll khi load tin nhắn mới

        fetch(`${API_URL}/api/chat/messages/${currentUserId}/${receiverId}`, {
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
                        localStorage.removeItem('accessToken')
                        window.location.href = '/login'
                        return
                    }
                    throw new Error(`Network response was not ok: ${res.status}`)
                }
                return res.json()
            })
            .then(data => {
                console.log("Loaded messages:", data)
                if (data.length > 0) {
                    // Sắp xếp tin nhắn theo thời gian
                    const sortedMessages = data.sort((a: Message, b: Message) =>
                        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                    );

                    // Lưu tất cả tin nhắn
                    setAllMessages(sortedMessages);

                    // Chỉ hiển thị 20 tin nhắn mới nhất
                    const recentMessages = sortedMessages.slice(-pageSize);
                    setMessages(recentMessages);

                    // Kiểm tra xem còn tin nhắn cũ hơn không
                    setHasMoreMessages(sortedMessages.length > pageSize);
                }
                setIsLoading(false)
            })
            .catch(error => {
                console.error('Error fetching messages:', error)
                setIsLoading(false)
            })
    }

    // Thêm useEffect để load tin nhắn khi chọn người dùng
    useEffect(() => {
        if (receiverId) {
            loadMessages()
        }
    }, [receiverId])

    // Thêm useEffect để xử lý sự kiện chọn người dùng
    useEffect(() => {
        if (onSelectUser) {
            onSelectUser(receiverId)
        }
    }, [receiverId, onSelectUser])

    useEffect(() => {
        if (isOpen && currentUserId) {
            // Đóng kết nối cũ nếu có
            if (ws) {
                ws.disconnect()
                setWs(null)
            }

            const token = localStorage.getItem('accessToken')
            if (!token) {
                console.log('User not logged in, redirecting to login page')
                window.location.href = '/login'
                return
            }

            // Reset số lần thử kết nối lại
            reconnectAttempts.current = 0

            // Chờ một chút trước khi kết nối lại để đảm bảo kết nối cũ đã hoàn toàn đóng
            setTimeout(() => {
                connectWebSocket()
            }, 500)
        }

        return () => {
            if (ws) {
                ws.disconnect()
                setWs(null)
            }
            // Hủy timeout kết nối lại nếu có
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current)
                reconnectTimeoutRef.current = null
            }
        }
    }, [isOpen, currentUserId])

    const connectWebSocket = () => {
        // Kiểm tra nếu đang kết nối thì không kết nối lại
        if (isConnecting) {
            console.log("Already connecting, skipping...");
            return;
        }

        try {
            setIsConnecting(true);
            const token = localStorage.getItem('accessToken')
            if (!token) {
                console.log('User not logged in, redirecting to login page')
                window.location.href = '/login'
                return
            }

            // Đóng kết nối cũ nếu có
            if (ws && ws.connected) {
                ws.disconnect()
            }

            // Tạo kết nối mới với cấu hình đúng
            const socket = new SockJS(`${API_URL}/ws`)

            // Cấu hình STOMP client đúng cách
            const stompClient = Stomp.over(socket);

            // Cấu hình các tùy chọn
            stompClient.debug = (str: string) => {
                console.log(str);
            };

            // Kết nối với token trong header
            const headers = {
                'Authorization': `Bearer ${token}`
            }

            stompClient.connect(headers, (frame: any) => {
                console.log("Connected to WebSocket", frame);
                reconnectAttempts.current = 0;
                setIsConnecting(false);

                // Subscribe vào channel riêng cho user
                stompClient.subscribe(`/user/${currentUserId}/queue/messages`, (message: any) => {
                    try {
                        const data = JSON.parse(message.body)
                        console.log("Received private message:", data)

                        // Cập nhật tin nhắn ngay lập tức
                        if (data.senderId === currentUserId || data.receiverId === currentUserId) {
                            setMessages(prev => {
                                // Kiểm tra xem tin nhắn đã được gửi trước đó chưa
                                if (sentMessageIds.has(data.id)) {
                                    return prev;
                                }

                                if (prev.some(m => m.id === data.id)) {
                                    return prev;
                                }

                                const newMessages = [...prev, data];
                                setHasNewMessages(true)
                                return newMessages.sort((a, b) =>
                                    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                                );
                            });

                            // Cập nhật allMessages tương tự
                            setAllMessages(prev => {
                                if (sentMessageIds.has(data.id)) {
                                    return prev;
                                }

                                if (prev.some(m => m.id === data.id)) {
                                    return prev;
                                }

                                return [...prev, data];
                            });

                            // Cuộn xuống tin nhắn mới nhất
                            scrollToBottom()
                        }
                    } catch (error) {
                        console.error('Error parsing private message:', error);
                    }
                })

                // Subscribe vào channel chung để nhận tin nhắn mới
                stompClient.subscribe('/topic/public', (message: any) => {
                    try {
                        const data = JSON.parse(message.body)
                        console.log("Received public message:", data)

                        // Cập nhật tin nhắn cho cả người gửi và người nhận
                        if (data.senderId === currentUserId || data.receiverId === currentUserId) {
                            setMessages(prev => {
                                // Kiểm tra xem tin nhắn đã được gửi trước đó chưa
                                if (sentMessageIds.has(data.id)) {
                                    return prev;
                                }

                                if (prev.some(m => m.id === data.id)) {
                                    return prev;
                                }

                                const newMessages = [...prev, data];
                                setHasNewMessages(true)
                                return newMessages.sort((a, b) =>
                                    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                                );
                            });

                            // Cập nhật allMessages tương tự
                            setAllMessages(prev => {
                                if (sentMessageIds.has(data.id)) {
                                    return prev;
                                }

                                if (prev.some(m => m.id === data.id)) {
                                    return prev;
                                }

                                return [...prev, data];
                            });

                            // Cuộn xuống tin nhắn mới nhất
                            scrollToBottom()
                        }
                    } catch (error) {
                        console.error('Error parsing public message:', error);
                    }
                })
            }, (error: Error) => {
                console.error('STOMP connection error:', error);
                setIsConnecting(false);
                handleReconnect();
            });

            stompClient.onStompError = (frame: any) => {
                console.error('STOMP error:', frame)
                setIsConnecting(false);
                handleReconnect();
            }

            stompClient.onWebSocketError = (event: any) => {
                console.error('WebSocket error:', event)
                setIsConnecting(false);
                handleReconnect();
            }

            stompClient.onWebSocketClose = () => {
                console.log('WebSocket connection closed');
                setIsConnecting(false);
                handleReconnect();
            }

            setWs(stompClient)
        } catch (error) {
            console.error('Error initializing WebSocket:', error);
            setIsConnecting(false);
            handleReconnect();
        }
    }

    const handleReconnect = () => {
        // Hủy timeout kết nối lại trước đó nếu có
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        if (reconnectAttempts.current < maxReconnectAttempts) {
            reconnectAttempts.current++
            const delay = Math.min(1000 * (2 ** reconnectAttempts.current), 30000)
            console.log(`Attempting to reconnect in ${delay / 1000} seconds... (Attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`)

            // Thêm thời gian chờ trước khi thử kết nối lại
            reconnectTimeoutRef.current = setTimeout(() => {
                if (isOpen && !isConnecting) { // Chỉ thử kết nối lại nếu chat box vẫn đang mở và không đang kết nối
                    connectWebSocket()
                }
            }, delay)
        } else {
            console.error('Maximum reconnection attempts reached')
            // Hiển thị thông báo cho người dùng
            alert('Không thể kết nối đến máy chủ chat. Vui lòng thử lại sau.')
        }
    }

    const handleEmojiClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleEmojiClose = () => {
        setAnchorEl(null);
    };

    const handleEmojiSelect = (emoji: any) => {
        if (messageInputRef.current) {
            messageInputRef.current.value = (messageInputRef.current.value || "") + emoji.native
        }
    };

    const handleFileClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            uploadFile(file);
        }
    };

    const uploadFile = async (file: File) => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${API_URL}/api/chat/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            console.log('Upload response:', data);

            if (!data.data || !data.data.fileUrl) {
                throw new Error('Invalid response format');
            }

            const fileUrl = data.data.fileUrl;
            const fileType = file.type.startsWith('image/') ? 'image' : 'file';

            // Tạo tin nhắn mới với file đã upload
            const messageId = Date.now().toString();
            const currentTime = new Date().toISOString();

            const newMessage: Message = {
                id: messageId,
                senderId: currentUserId,
                receiverId: receiverId,
                content: '',
                timestamp: currentTime,
                senderName: "Me",
                fileUrl: fileUrl,
                fileType: fileType,
                fileName: file.name
            };

            // Cập nhật state messages trước
            setMessages(prevMessages => [...prevMessages, newMessage]);

            // Gửi tin nhắn qua WebSocket
            if (ws && ws.connected) {
                ws.publish({
                    destination: "/app/chat.send",
                    body: JSON.stringify(newMessage)
                });
            }

            setSelectedFile(null);

            // Scroll xuống cuối sau khi thêm tin nhắn mới
            setTimeout(() => {
                scrollToBottom();
            }, 100);

        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Không thể tải lên file. Vui lòng thử lại.');
        }
    };

    const handleSendMessage = () => {
        const messageText = messageInputRef.current?.value?.trim() || "";
        if (messageText) {
            const newMessage: Message = {
                id: Date.now().toString(),
                senderId: currentUserId,
                receiverId: receiverId,
                content: messageText,
                timestamp: new Date().toISOString(),
                senderName: "You"
            };

            // Cập nhật state messages trước
            setMessages(prevMessages => [...prevMessages, newMessage]);

            // Gửi tin nhắn qua WebSocket
            if (ws && ws.connected) {
                ws.publish({
                    destination: "/app/chat.send",
                    body: JSON.stringify(newMessage)
                });
            }

            if (messageInputRef.current) {
                messageInputRef.current.value = "";
            }

            // Scroll xuống cuối sau khi thêm tin nhắn mới
            setTimeout(() => {
                scrollToBottom();
            }, 100);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    // Thêm useEffect để scroll xuống cuối khi có tin nhắn mới
    useEffect(() => {
        if (messages.length > 0 && hasNewMessages) {
            scrollToBottom()
            setHasNewMessages(false)
        }
    }, [messages, hasNewMessages])

    // Thêm hàm load danh sách người dùng đã chat
    const loadChatUsers = () => {
        const token = localStorage.getItem('accessToken')
        if (!token) {
            console.log('User not logged in, redirecting to login page')
            window.location.href = '/login'
            return
        }

        fetch(`${API_URL}/api/chat/users/${currentUserId}`, {
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
                        localStorage.removeItem('accessToken')
                        window.location.href = '/login'
                        return
                    }
                    throw new Error(`Network response was not ok: ${res.status}`)
                }
                return res.json()
            })
            .then(data => {
                console.log("Loaded chat users:", data)
                setChatUsers(data)
                // Tìm và set người dùng được chọn ban đầu
                const initialUser = data.find((user: ChatUser) => user.id === receiverId)
                if (initialUser) {
                    setSelectedUser(initialUser)
                }
            })
            .catch(error => {
                console.error('Error fetching chat users:', error)
            })
    }

    // Thêm useEffect để load danh sách người dùng khi component mount
    useEffect(() => {
        if (isOpen) {
            loadChatUsers()
        }
    }, [isOpen, currentUserId])

    // Thêm useEffect để tự động cập nhật tin nhắn mỗi 10 giây
    useEffect(() => {
        if (isOpen && selectedUser) {
            const intervalId = setInterval(() => {
                loadMessages()
            }, 10000) // 10 giây

            return () => {
                clearInterval(intervalId)
            }
        }
    }, [isOpen, selectedUser, currentUserId, receiverId])

    // Thêm useEffect để tắt loading khi nhận được tin nhắn mới
    useEffect(() => {
        if (messages.length > 0) {
            setIsLoading(false)
        }
    }, [messages])

    // Thêm useEffect để xử lý sự kiện cuộn
    useEffect(() => {
        const messageList = messageListRef.current;
        if (messageList) {
            messageList.addEventListener('scroll', handleScroll);
            return () => {
                messageList.removeEventListener('scroll', handleScroll);
            };
        }
    }, [messages, allMessages, hasMoreMessages, isLoadingMore]);

    // Thêm useEffect để xử lý tin nhắn mới
    useEffect(() => {
        if (allMessages.length > 0 && messages.length > 0) {
            // Cập nhật allMessages khi có tin nhắn mới
            const lastMessage = messages[messages.length - 1];
            const lastMessageInAll = allMessages[allMessages.length - 1];

            if (lastMessage.id !== lastMessageInAll.id) {
                setAllMessages(prev => [...prev, lastMessage]);
            }
        }
    }, [messages]);

    // Thêm useEffect để xử lý tin nhắn nhận được từ WebSocket
    useEffect(() => {
        if (ws && ws.connected) {
            // Subscribe vào channel riêng cho user
            const privateSubscription = ws.subscribe(`/user/${currentUserId}/queue/messages`, (message: any) => {
                try {
                    const data = JSON.parse(message.body);
                    console.log("Received private message:", data);

                    // Kiểm tra xem tin nhắn đã tồn tại chưa
                    setMessages(prev => {
                        // Nếu tin nhắn đã tồn tại (có thể là tin nhắn mới gửi), không thêm lại
                        if (prev.some(m => m.id === data.id)) {
                            return prev;
                        }

                        // Nếu là tin nhắn mới, thêm vào danh sách
                        const newMessages = [...prev, data];
                        setHasNewMessages(true)
                        return newMessages.sort((a, b) =>
                            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                        );
                    });

                    // Cập nhật allMessages tương tự
                    setAllMessages(prev => {
                        if (prev.some(m => m.id === data.id)) {
                            return prev;
                        }
                        return [...prev, data];
                    });
                } catch (error) {
                    console.error('Error parsing private message:', error);
                }
            });

            // Subscribe vào channel chung
            const publicSubscription = ws.subscribe('/topic/public', (message: any) => {
                try {
                    const data = JSON.parse(message.body);
                    console.log("Received public message:", data);

                    // Chỉ xử lý tin nhắn liên quan đến người dùng hiện tại
                    if (data.senderId === currentUserId || data.receiverId === currentUserId) {
                        // Kiểm tra xem tin nhắn đã tồn tại chưa
                        setMessages(prev => {
                            if (prev.some(m => m.id === data.id)) {
                                return prev;
                            }

                            const newMessages = [...prev, data];
                            setHasNewMessages(true)
                            return newMessages.sort((a, b) =>
                                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                            );
                        });

                        // Cập nhật allMessages tương tự
                        setAllMessages(prev => {
                            if (prev.some(m => m.id === data.id)) {
                                return prev;
                            }
                            return [...prev, data];
                        });
                    }
                } catch (error) {
                    console.error('Error parsing public message:', error);
                }
            });

            return () => {
                if (privateSubscription) {
                    privateSubscription.unsubscribe();
                }
                if (publicSubscription) {
                    publicSubscription.unsubscribe();
                }
            };
        }
    }, [ws, currentUserId]);

    // Thêm hàm đánh dấu tin nhắn đã đọc
    const markMessagesAsRead = async () => {
        if (!receiverId || !currentUserId) return;

        const token = localStorage.getItem('accessToken');
        if (!token) return;

        try {
            const response = await fetch(`${API_URL}/api/chat/read-all/${currentUserId}/${receiverId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to mark messages as read');
            }

            // Cập nhật lại danh sách người dùng chat để cập nhật số tin nhắn chưa đọc
            loadChatUsers();
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    };

    // Thêm useEffect để đánh dấu tin nhắn đã đọc khi component mount
    useEffect(() => {
        if (isOpen && receiverId) {
            markMessagesAsRead();
        }
    }, [isOpen, receiverId]);

    // Thêm useEffect để đánh dấu tin nhắn đã đọc khi có tin nhắn mới
    useEffect(() => {
        if (messages.length > 0) {
            markMessagesAsRead();
        }
    }, [messages]);

    // Thêm useEffect để đánh dấu tin nhắn đã đọc khi cuộn đến tin nhắn mới
    useEffect(() => {
        const messageList = messageListRef.current;
        if (messageList) {
            const handleScroll = () => {
                const { scrollTop, scrollHeight, clientHeight } = messageList;
                // Nếu đã cuộn đến gần cuối (còn 100px)
                if (scrollHeight - scrollTop - clientHeight < 100) {
                    markMessagesAsRead();
                }
            };

            messageList.addEventListener('scroll', handleScroll);
            return () => {
                messageList.removeEventListener('scroll', handleScroll);
            };
        }
    }, [messageListRef.current]);

    // Thêm hàm truncateFileName
    const truncateFileName = (fileName: string, maxLength: number = 15) => {
        if (fileName.length <= maxLength) return fileName;
        const extension = fileName.split('.').pop();
        const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
        const truncatedName = nameWithoutExt.substring(0, maxLength - 3) + '...';
        return `${truncatedName}.${extension}`;
    };

    // Thêm useEffect để xử lý cuộn
    useEffect(() => {
        if (shouldScroll && messages.length > 0) {
            setTimeout(() => {
                if (messagesEndRef.current) {
                    messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
                }
                setShouldScroll(false) // Đánh dấu đã cuộn xong
            }, 100)
        }
    }, [messages, shouldScroll])

    if (!isOpen) return null

    // Render vào một portal tách biệt
    const chatContent = (
        <ChatContainer elevation={3}>
            <ChatList>
                <ChatUserList
                    currentUserId={currentUserId}
                    onSelectUser={(userId) => {
                        if (onSelectUser) {
                            onSelectUser(userId)
                        }
                    }}
                />
            </ChatList>
            <ChatMain>
                <ChatHeader>
                    {selectedUser && (
                        <>
                            <Avatar
                                src={selectedUser.avatar}
                                sx={{
                                    width: 40,
                                    height: 40,
                                    bgcolor: !selectedUser.avatar ? "grey.300" : "transparent",
                                }}
                            >
                                {!selectedUser.avatar && selectedUser.name.charAt(0)}
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle1">{selectedUser.name}</Typography>
                            </Box>
                        </>
                    )}
                    <Box sx={{ flex: 1 }} />
                    <IconButton onClick={onClose} size="small">
                        <Close />
                    </IconButton>
                </ChatHeader>

                <MessageList ref={messageListRef}>
                    {isLoadingMore && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                            <CircularProgress size={24} />
                        </Box>
                    )}

                    {messages.map((message) => {
                        const isOwnMessage = message.senderId === currentUserId;
                        return (
                            <Fade in={true} key={message.id} timeout={300}>
                                <MessageItem
                                    sx={{
                                        alignItems: isOwnMessage ? "flex-end" : "flex-start",
                                        alignSelf: isOwnMessage ? "flex-end" : "flex-start"
                                    }}
                                >
                                    <Box sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        mb: 0.5,
                                        alignSelf: isOwnMessage ? "flex-end" : "flex-start"
                                    }}>
                                        <Tooltip title={message.senderName || "User"}>
                                            <Avatar
                                                src={message.senderAvatar ? getFileUrl(message.senderAvatar) : undefined}
                                                sx={{
                                                    width: 24,
                                                    height: 24,
                                                    bgcolor: !message.senderAvatar ? "grey.300" : "transparent",
                                                }}
                                            >
                                                {(!message.senderAvatar && message.senderName) ? message.senderName.charAt(0) : "U"}
                                            </Avatar>
                                        </Tooltip>
                                        <Typography variant="caption" color="text.secondary">
                                            {message.senderName || "User"}
                                        </Typography>
                                    </Box>
                                    <MessageBubble
                                        sx={{
                                            background: isOwnMessage ? theme.palette.primary.main : theme.palette.grey[100],
                                            color: isOwnMessage ? theme.palette.primary.contrastText : theme.palette.text.primary,
                                        }}
                                    >
                                        {message.content && (
                                            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                                                {message.content}
                                            </Typography>
                                        )}
                                        {message.fileUrl && (
                                            <Box sx={{ mt: 1 }}>
                                                {message.fileType === 'image' ? (
                                                    <img
                                                        src={getFileUrl(message.fileUrl)}
                                                        alt={message.fileName}
                                                        style={{
                                                            maxWidth: '200px',
                                                            maxHeight: '200px',
                                                            borderRadius: '8px',
                                                            display: 'block'
                                                        }}
                                                    />
                                                ) : (
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1,
                                                            p: 1,
                                                            bgcolor: 'rgba(0,0,0,0.05)',
                                                            borderRadius: '8px'
                                                        }}
                                                    >
                                                        <AttachFile />
                                                        <Typography variant="body2">
                                                            {message.fileName ? truncateFileName(message.fileName) : 'File đính kèm'}
                                                        </Typography>
                                                        <a
                                                            href={getFileUrl(message.fileUrl)}
                                                            download={message.fileName}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                if (message.fileUrl) {
                                                                    window.open(getFileUrl(message.fileUrl), '_blank', 'noopener,noreferrer');
                                                                }
                                                            }}
                                                            style={{
                                                                color: isOwnMessage ? 'white' : theme.palette.primary.main,
                                                                textDecoration: 'none'
                                                            }}
                                                        >
                                                            Tải xuống
                                                        </a>
                                                    </Box>
                                                )}
                                            </Box>
                                        )}
                                    </MessageBubble>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{
                                            mt: 0.5,
                                            alignSelf: isOwnMessage ? "flex-end" : "flex-start"
                                        }}
                                    >
                                        {formatTime(message.timestamp)}
                                    </Typography>
                                </MessageItem>
                            </Fade>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </MessageList>

                <InputContainer>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />
                    <ActionButton onClick={handleEmojiClick} size="small">
                        <EmojiEmotions />
                    </ActionButton>
                    <ActionButton onClick={handleFileClick} size="small">
                        <AttachFile />
                    </ActionButton>
                    <StyledTextField
                        fullWidth
                        placeholder="Nhập tin nhắn..."
                        inputRef={messageInputRef}
                        onKeyPress={handleKeyPress}
                    />
                    <ActionButton onClick={handleSendMessage} disabled={isLoading}>
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : <Send />}
                    </ActionButton>
                </InputContainer>
            </ChatMain>

            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleEmojiClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                sx={{
                    zIndex: 1002,
                    '& .MuiPopover-paper': {
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                    }
                }}
            >
                <Box sx={{ p: 1 }}>
                    <Picker
                        data={data}
                        onEmojiSelect={handleEmojiSelect}
                        theme="light"
                        previewPosition="none"
                        skinTonePosition="none"
                        searchPosition="none"
                        perLine={8}
                        emojiSize={24}
                        emojiButtonSize={28}
                    />
                </Box>
            </Popover>
        </ChatContainer>
    );

    return ReactDOM.createPortal(chatContent, document.body);
}

export default ChatBox 