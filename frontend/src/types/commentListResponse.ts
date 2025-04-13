import { Comment } from './comment';
export interface CommentListResponse {
    comments: Comment[];
    totalCount: number;
  }