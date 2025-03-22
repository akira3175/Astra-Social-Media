import { User } from "./user"

export interface PostItem {
  id: number
  user: User
  content: string
  image?: string
  timestamp: string
  likes: number
  comments: number
  liked: boolean
  saved: boolean
}

export interface Post {
    id: number
    user: User
    content: string
    image?: string
    timestamp: string
    likes: number
    comments: number
    liked: boolean
    saved: boolean
}
