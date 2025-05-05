import { User } from "./user";
import { Image } from "./image";

export interface PostItem {
  id: number;
  user: User;
  content: string;
  images?: Image[]; 
  timestamp: string; 
  likesCount: number; 
  commentsCount: number; 
  liked: boolean;
  saved: boolean;
  originalPost: Post | null;
  originalPostId: number | null;
  isDeleted?: boolean;
}

export interface Post {
  id: number;
  content: string;
  images: { 
    id: number;
    url: string;
  }[];
  createdAt: string;
  updatedAt: string | null;
  user: User;
  likesCount: number;
  liked: boolean;
  commentsCount: number;
  saved?: boolean;
  originalPost?: Post;
  deleted?: boolean;
}