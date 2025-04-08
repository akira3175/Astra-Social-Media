import { User } from "./user"

export interface MessagePreview {
    id: number
    text: string
    timestamp: string
    isRead: boolean
    senderId: number
}
  
export interface Message extends MessagePreview {
    attachments?: string[]
}
  
export interface Conversation {
    id: number
    user: User
    lastMessage: MessagePreview
    unreadCount: number
}
  