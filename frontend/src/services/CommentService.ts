import { api } from '../configs/api';
import { Comment } from '../types/comment';
import { ApiResponse } from '../types/apiResponse';

// First, define an interface for the response data structure
interface CommentResponse {
  comments: Comment[];
  totalCount: number;
}

const CommentService = {
  createComment: async (
    postId: number,
    content: string,
    imageUrls?: string[],
    parentCommentId?: number | null 
  ): Promise<Comment> => {
    try {
      const payload: { content: string; imageUrls?: string[]; parentCommentId?: number | null } = {
        content,
      };
      if (imageUrls && imageUrls.length > 0) {
        payload.imageUrls = imageUrls;
      }
      if (parentCommentId !== undefined && parentCommentId !== null) { 
        payload.parentCommentId = parentCommentId;
      }

      const response = await api.post<ApiResponse<Comment>>(
        `/comments/${postId}`,
        payload 
      );
      if (response.data.status === 201) {
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || 'Failed to create comment'
        );
      }
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  },

  getCommentsByPostId: async (postId: number): Promise<CommentResponse> => {
    try {
      const response = await api.get<ApiResponse<CommentResponse>>(
        `/comments/post/${postId}`
      );
      if (response.data.status === 200) {
        return response.data.data; // Return the entire CommentResponse object
      } else {
        throw new Error(
          response.data.message || 'Failed to fetch comments'
        );
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },

  likeComment: async (commentId: number): Promise<Comment> => {
    try {
      const response = await api.post<ApiResponse<Comment>>(`/likes/comment/${commentId}`);
      if (response.data.status === 201) {
        console.log('Comment liked successfully:', response.data.data);
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to like comment');
    } catch (error) {
      console.error('Error liking comment:', error);
      throw error;
    }
  },

  unlikeComment: async (commentId: number): Promise<Comment> => {
    try {
      const response = await api.delete<ApiResponse<Comment>>(`/likes/comment/${commentId}`);
      if (response.data.status === 200) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to unlike comment');
    } catch (error) {
      console.error('Error unliking comment:', error);
      throw error;
    }
  },

  updateComment: async (commentId: number, content: string): Promise<Comment> => {
    try {
      const response = await api.put<ApiResponse<Comment>>(
        `/comments/${commentId}`,
        { content }
      );
      
      if (response.data.status === 200) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to update comment');
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  },

  deleteComment: async (commentId: number): Promise<void> => {
    try {
      const response = await api.delete<ApiResponse<void>>(`/comments/${commentId}`);
      
      if (response.data.status !== 200) {
        throw new Error(response.data.message || 'Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }
};

export default CommentService;
