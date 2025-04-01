import { api } from '../configs/api';
import { Comment } from '../types/comment';
import { ApiResponse } from '../types/apiResponse';

const CommentService = {
  createComment: async (
    postId: number,
    content: string,
    imageUrls?: string[],
    parentCommentId?: number | null // Add parentCommentId parameter
  ): Promise<Comment> => {
    try {
      const payload: { content: string; imageUrls?: string[]; parentCommentId?: number | null } = {
        content,
      };
      if (imageUrls && imageUrls.length > 0) {
        payload.imageUrls = imageUrls;
      }
      if (parentCommentId !== undefined && parentCommentId !== null) { // Only include if provided
        payload.parentCommentId = parentCommentId;
      }

      const response = await api.post<ApiResponse<Comment>>(
        `/comments/${postId}`,
        payload // Send the updated payload
      );
      // Assuming 201 Created indicates success (Backend returns 201)
      if (response.data.status === 201) {
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || 'Failed to create comment'
        );
      }
    } catch (error) {
      console.error('Error creating comment:', error);
      // Consider how to handle errors more gracefully in the UI
      throw error; // Re-throw the error to be caught by the caller
    }
  },

  getCommentsByPostId: async (postId: number): Promise<Comment[]> => {
    try {
      const response = await api.get<ApiResponse<Comment[]>>(
        `/comments/post/${postId}`
      );
      // Assuming 200 OK indicates success
      if (response.data.status === 200) {
        return response.data.data;
      } else {
        throw new Error(
          response.data.message || 'Failed to fetch comments'
        );
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      // Consider how to handle errors more gracefully in the UI
      throw error; // Re-throw the error to be caught by the caller
    }
  },
};

export default CommentService;
