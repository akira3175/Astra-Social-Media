import { User } from './user';
import { Image } from './image';
import { Like } from './like';

export interface Comment {
  id: number;
  content: string;
  user: User;
  createdAt: string;
  updatedAt?: string;
  images?: Image[];
  likes?: Like[]; 
  parentId?: number | null; 
  replies?: Comment[]; 
}
