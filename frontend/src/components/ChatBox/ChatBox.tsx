import React, { useEffect, useRef, useState } from "react"
import {
    Box,
    Paper,
    Typography,
    TextField,
    IconButton,
    List,
    ListItem,
    Avatar,
} from "@mui/material"
import { Send, Close } from "@mui/icons-material"
import { styled } from "@mui/material/styles"

interface Message {
    id: string
    senderId: string
    content: string
    timestamp: string
    senderAvatar?: string
    senderName: string
}

interface ChatBoxProps {
    isOpen: boolean
    onClose: () => void
    receiverId: string
    currentUserId: string
}

const ChatContainer = styled(Paper)(({ theme }) => ({
    position: "fixed",
    bottom: 20,
    right: 20,
    width: 320,
    height: 400,
    display: "flex",
    flexDirection: "column",
    zIndex: 9999,
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.15)",
    borderRadius: "8px",
    overflow: "hidden"
}))

const MessageList = styled(List)({
    flex: 1,
    overflow: "auto",
    padding: "10px",
    display: "flex",
    flexDirection: "column-reverse", // Để tin nhắn mới nhất hiển thị ở dưới
})

const ChatBox: React.FC<ChatBoxProps> = ({ isOpen, onClose, receiverId, currentUserId }) => {
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [ws, setWs] = useState<WebSocket | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (isOpen) {
            // Kết nối WebSocket khi component mount
            const websocket = new WebSocket(`ws://localhost:8080/chat/${currentUserId}/${receiverId}`)

            websocket.onopen = () => {
                console.log("Connected to WebSocket")
                // Load 20 tin nhắn gần nhất
                fetch(`/api/messages/${currentUserId}/${receiverId}?limit=20`)
                    .then(res => res.json())
                    .then(data => setMessages(data))
            }

            websocket.onmessage = (event) => {
                const message = JSON.parse(event.data)
                setMessages(prev => [message, ...prev])
            }

            websocket.onclose = () => {
                console.log("Disconnected from WebSocket")
            }

            setWs(websocket)

            return () => {
                websocket.close()
            }
        }
    }, [isOpen, currentUserId, receiverId])

    const handleSendMessage = () => {
        if (newMessage.trim() && ws) {
            const message = {
                senderId: currentUserId,
                receiverId: receiverId,
                content: newMessage,
                timestamp: new Date().toISOString(),
            }

            ws.send(JSON.stringify(message))
            setNewMessage("")
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    if (!isOpen) return null

    return (
        <ChatContainer elevation={3}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h6">Chat</Typography>
                <IconButton onClick={onClose} size="small">
                    <Close />
                </IconButton>
            </Box>

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
                            <Avatar src={message.senderAvatar} sx={{ width: 24, height: 24 }} />
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
                            {new Date(message.timestamp).toLocaleTimeString()}
                        </Typography>
                    </ListItem>
                ))}
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
                />
                <IconButton onClick={handleSendMessage} color="primary">
                    <Send />
                </IconButton>
            </Box>
        </ChatContainer>
    )
}

export default ChatBox 