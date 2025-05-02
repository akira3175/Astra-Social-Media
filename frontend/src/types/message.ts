export interface ChatUser {
  id: number
  email: string
  firstName: string
  lastName: string
  name: string
  username: string
  avatar: string
  role: string
  status: string
  registeredDate: string
  lastActive: string
  isOnline: boolean
  [key: string]: any
}

export interface Message {
  id: number
  text: string
  timestamp: string
  senderId: number
  receiverId: number
  isRead: boolean
  fileUrl?: string
  hasAttachment?: boolean
  attachmentType?: 'image' | 'video' | 'document' | 'file'
  fileName?: string
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
  user: {
    id: number
    name: string
    avatar?: string
    isOnline?: boolean
  }
  lastMessage: {
    id: number
    text: string
    timestamp: string
    isRead: boolean
    senderId: number
  }
  unreadCount: number
}
