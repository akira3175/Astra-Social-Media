import { User } from "./user"

export interface Message {
  id: number
  text: string
  timestamp: string
  isRead: boolean
  fileUrl?: string
  hasAttachment?: boolean
  attachmentType?: 'image' | 'video' | 'document' | 'file'
  fileName?: string
  sender: User
  receiver: User
  [key: string]: any
}

export interface LastMessage {
  id: number
  text: string
  timestamp: string
  isRead: boolean
  senderId: number
}

export interface Conversation {
  id: number
  user: User
  lastMessage: LastMessage
  unreadCount: number
}
