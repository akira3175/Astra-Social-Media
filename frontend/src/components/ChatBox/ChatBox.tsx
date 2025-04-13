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
} from "@mui/material"
import { Send, Close } from "@mui/icons-material"
import { styled } from "@mui/material/styles"
import SockJS from 'sockjs-client'
import { Stomp, CompatClient } from '@stomp/stompjs'
import ChatUserList from './ChatUserList'

interface Message {
    id: string
    senderId: string
    receiverId: string
    content: string
    timestamp: string
    senderAvatar?: string
    senderName: string
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
}

const ChatContainer = styled(Paper)(({ }) => ({
    position: "fixed",
    top: 80,
    right: 20,
    width: 800,
    height: 500,
    display: "flex",
    flexDirection: "row",
    zIndex: 99999,
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
    borderRadius: "8px",
    overflow: "hidden"
}))

const ChatList = styled(Box)(({ theme }) => ({
    width: 300,
    borderRight: `1px solid ${theme.palette.divider}`,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
}))

const ChatMain = styled(Box)(({ }) => ({
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
}))

const MessageList = styled(List)({
    flex: 1,
    overflow: "auto",
    padding: "10px",
    display: "flex",
    flexDirection: "column",
})

const ChatHeader = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
}))

const ChatBox: React.FC<ChatBoxProps> = ({ isOpen, onClose, receiverId, currentUserId }) => {
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [ws, setWs] = useState<CompatClient | null>(null)
    const [chatUsers, setChatUsers] = useState<ChatUser[]>([])
    const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const reconnectAttempts = useRef(0)
    const maxReconnectAttempts = 5
    const lastMessageSenderRef = useRef<string | null>(null)
    const lastUpdateTimeRef = useRef<Date>(new Date())

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

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const loadMessages = () => {
        const token = localStorage.getItem('accessToken')
        if (!token) {
            console.log('User not logged in, redirecting to login page')
            window.location.href = '/login'
            return
        }

        fetch(`http://localhost:8080/api/chat/messages/${currentUserId}/${receiverId}`, {
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
                    }
                    throw new Error('Network response was not ok')
                }
                return res.json()
            })
            .then(data => {
                console.log("Loaded messages:", data)
                if (data.length > 0) {
                    setMessages(data.sort((a: Message, b: Message) =>
                        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                    ))
                }
            })
            .catch(error => {
                console.error('Error fetching messages:', error)
            })
    }

    // Thêm useEffect để load tin nhắn khi chọn người dùng
    useEffect(() => {
        if (receiverId) {
            loadMessages()
        }
    }, [receiverId])

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
        }
    }, [isOpen, currentUserId])

    const connectWebSocket = () => {
        try {
            const token = localStorage.getItem('accessToken')
            if (!token) {
                console.log('User not logged in, redirecting to login page')
                window.location.href = '/login'
                return
            }

            // Truyền token như một parameter trong URL
            const socket = new SockJS(`http://localhost:8080/ws?token=${token}`)
            const stompClient = Stomp.over(() => socket)

            // Tùy chọn để tránh log quá nhiều
            stompClient.debug = () => { };

            // Không cần gửi token trong header vì đã có trong URL
            stompClient.connect({}, () => {
                console.log("Connected to WebSocket")
                reconnectAttempts.current = 0

                // Subscribe vào channel riêng cho user
                stompClient.subscribe(`/user/${currentUserId}/queue/messages`, (message) => {
                    try {
                        const data = JSON.parse(message.body)
                        console.log("Received private message:", data)

                        // Cập nhật tin nhắn ngay lập tức
                        if (data.senderId === currentUserId || data.receiverId === currentUserId) {
                            setMessages(prev => {
                                if (prev.some(m => m.id === data.id)) {
                                    return prev
                                }
                                const newMessages = [...prev, data]
                                return newMessages.sort((a, b) =>
                                    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                                )
                            })
                        }
                    } catch (error) {
                        console.error('Error parsing private message:', error)
                    }
                })

                // Subscribe vào channel chung để nhận tin nhắn mới
                stompClient.subscribe('/topic/public', (message) => {
                    try {
                        const data = JSON.parse(message.body)
                        console.log("Received public message:", data)

                        // Cập nhật tin nhắn cho cả người gửi và người nhận
                        if (data.senderId === currentUserId || data.receiverId === currentUserId) {
                            setMessages(prev => {
                                if (prev.some(m => m.id === data.id)) {
                                    return prev
                                }
                                const newMessages = [...prev, data]
                                return newMessages.sort((a, b) =>
                                    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                                )
                            })
                        }
                    } catch (error) {
                        console.error('Error parsing public message:', error)
                    }
                })
            }, (error: Error) => {
                console.error('STOMP connection error:', error);
                handleReconnect();
            })

            stompClient.onStompError = (frame) => {
                console.error('STOMP error:', frame)
                handleReconnect();
            }

            stompClient.onWebSocketError = (event) => {
                console.error('WebSocket error:', event)
                handleReconnect();
            }

            stompClient.onWebSocketClose = () => {
                console.log('WebSocket connection closed');
                handleReconnect();
            }

            setWs(stompClient)
        } catch (error) {
            console.error('Error initializing WebSocket:', error);
            handleReconnect();
        }
    }

    const handleReconnect = () => {
        if (reconnectAttempts.current < maxReconnectAttempts) {
            reconnectAttempts.current++
            const delay = Math.min(1000 * (2 ** reconnectAttempts.current), 30000)
            console.log(`Attempting to reconnect in ${delay / 1000} seconds...`)
            setTimeout(() => connectWebSocket(), delay)
        } else {
            console.error('Maximum reconnection attempts reached')
        }
    }

    const handleSendMessage = () => {
        if (newMessage.trim() && ws && ws.connected) {
            const message: Message = {
                id: Date.now().toString(),
                senderId: currentUserId,
                receiverId: receiverId,
                content: newMessage,
                timestamp: new Date().toISOString(),
                senderName: "Bạn",
                senderAvatar: undefined
            }

            console.log("Sending message:", message)
            try {
                setIsLoading(true)
                // Gửi tin nhắn qua WebSocket
                ws.publish({
                    destination: '/app/chat.send',
                    body: JSON.stringify(message)
                })

                // Thêm tin nhắn vào danh sách ngay lập tức cho người gửi
                setMessages(prev => {
                    const newMessages = [...prev, message]
                    return newMessages.sort((a, b) =>
                        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                    )
                })

                // Xóa nội dung tin nhắn
                setNewMessage("")
                setIsLoading(false)
            } catch (error) {
                console.error('Error sending message:', error)
                setIsLoading(false)
                // Nếu gặp lỗi kết nối, thử kết nối lại
                connectWebSocket()
            }
        } else if (!ws || !ws.connected) {
            console.error('WebSocket not connected, attempting to reconnect')
            connectWebSocket()
            setTimeout(() => {
                // Thông báo cho người dùng
                alert("Đang kết nối lại, vui lòng thử lại sau vài giây")
            }, 100)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    // const handleUserClick = (user: ChatUser) => {
    //     setSelectedUser(user)
    //     lastMessageSenderRef.current = user.id
    //     lastUpdateTimeRef.current = new Date() // Reset thời gian cập nhật khi chuyển user
    //     // Đóng kết nối WebSocket cũ
    //     if (ws && ws.connected) {
    //         ws.disconnect()
    //     }
    //     // Kết nối WebSocket mới với người dùng được chọn
    //     const socket = new SockJS('http://localhost:8080/ws')
    //     const stompClient = Stomp.over(() => socket)

    //     stompClient.connect({}, () => {
    //         console.log("Connected to WebSocket")
    //         // Subscribe vào channel riêng cho user
    //         stompClient.subscribe(`/user/${currentUserId}/queue/messages`, (message) => {
    //             try {
    //                 const data = JSON.parse(message.body)
    //                 setMessages(prev => {
    //                     if (prev.some(m => m.id === data.id)) {
    //                         return prev
    //                     }
    //                     return [data, ...prev]
    //                 })
    //             } catch (error) {
    //                 console.error('Error parsing message:', error)
    //             }
    //         })

    //         // Load tin nhắn ban đầu
    //         fetch(`http://localhost:8080/api/chat/messages/${currentUserId}/${user.id}?limit=20`)
    //             .then(res => {
    //                 if (!res.ok) {
    //                     throw new Error('Network response was not ok')
    //                 }
    //                 return res.json()
    //             })
    //             .then(data => {
    //                 const sortedMessages = data.sort((a: Message, b: Message) =>
    //                     new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    //                 )
    //                 setMessages(sortedMessages)
    //                 lastUpdateTimeRef.current = new Date() // Cập nhật thời gian sau khi load tin nhắn ban đầu
    //             })
    //             .catch(error => {
    //                 console.error('Error fetching messages:', error)
    //             })
    //     })

    //     setWs(stompClient)
    // }

    // Thêm useEffect để scroll xuống cuối khi có tin nhắn mới
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages])

    // Thêm hàm load danh sách người dùng đã chat
    const loadChatUsers = () => {
        fetch(`http://localhost:8080/api/chat/users/${currentUserId}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error('Network response was not ok')
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

    if (!isOpen) return null

    // Render vào một portal tách biệt
    const chatContent = (
        <ChatContainer elevation={3}>
            <ChatList>
                <ChatUserList
                    currentUserId={currentUserId}
                    onSelectUser={(userId) => {
                        setSelectedUser(chatUsers.find(user => user.id === userId) || null)
                        lastMessageSenderRef.current = userId
                        lastUpdateTimeRef.current = new Date()
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

                <MessageList>
                    {messages.map((message) => (
                        <ListItem
                            key={message.id}
                            sx={{
                                flexDirection: "column",
                                alignItems: message.senderId === currentUserId ? "flex-end" : "flex-start",
                                padding: "5px 10px",
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                                <Avatar
                                    src={message.senderAvatar}
                                    sx={{
                                        width: 24,
                                        height: 24,
                                        bgcolor: !message.senderAvatar ? "grey.300" : "transparent",
                                    }}
                                >
                                    {!message.senderAvatar && message.senderName.charAt(0)}
                                </Avatar>
                                <Typography variant="caption">{message.senderName}</Typography>
                            </Box>
                            <Paper
                                sx={{
                                    p: 1,
                                    bgcolor: message.senderId === currentUserId ? "primary.main" : "grey.100",
                                    color: message.senderId === currentUserId ? "white" : "text.primary",
                                    maxWidth: "70%",
                                }}
                            >
                                <Typography variant="body2">{message.content}</Typography>
                            </Paper>
                            <Typography variant="caption" sx={{ mt: 0.5 }}>
                                {formatTime(message.timestamp)}
                            </Typography>
                        </ListItem>
                    ))}
                    <div ref={messagesEndRef} />
                </MessageList>

                <Box sx={{ p: 2, borderTop: 1, borderColor: "divider", display: "flex", gap: 1 }}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Nhập tin nhắn..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        multiline
                        maxRows={3}
                        disabled={isLoading}
                    />
                    <IconButton
                        onClick={handleSendMessage}
                        color="primary"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            <Send />
                        )}
                    </IconButton>
                </Box>
            </ChatMain>
        </ChatContainer>
    );

    return ReactDOM.createPortal(chatContent, document.body);
}

export default ChatBox 