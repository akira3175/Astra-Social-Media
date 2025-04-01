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
}

export interface Post {
  id: number;
  user: User;
  content: string;
  images?: Image[]; 
  timestamp: string; 
  likesCount: number; 
  commentsCount: number; 
  liked: boolean;
  saved: boolean;
}