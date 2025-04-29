import { api } from "../configs/api"
import type { User } from "../types/user"
import type { Post } from "../types/post"
import type { Comment } from "../types/comment"
import type { AdminStats, Report } from "../types/management"

// API calls
export const getAdminStats = async (): Promise<AdminStats> => {
  try {
    const response = await api.get(`/admin/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw error;
  }
};

export const getPosts = async (): Promise<Post[]> => {
  try {
    const response = await api.get(`/admin/posts/getAllPost`);
    return response.data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

export const getLockedPosts = async (): Promise<Post[]> => {
  try {
    const response = await api.get(`/admin/posts/locked`);
    return response.data;
  } catch (error) {
    console.error('Error fetching locked posts:', error);
    throw error;
  }
};

export const lockPost = async (postId: number): Promise<void> => {
  try {
    await api.put(`/admin/posts/${postId}/lock`);
  } catch (error) {
    console.error('Error locking post:', error);
    throw error;
  }
};

export const unlockPost = async (postId: number): Promise<void> => {
  try {
    await api.put(`/admin/posts/${postId}/unlock`);
  } catch (error) {
    console.error('Error unlocking post:', error);
    throw error;
  }
};

export const getComments = async (): Promise<Comment[]> => {
  try {
    const response = await api.get(`/admin/comments/getAllComment`);
    return response.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

export const getLockedComments = async (): Promise<Comment[]> => {
  try {
    const response = await api.get(`/admin/comments/locked`);
    return response.data;
  } catch (error) {
    console.error('Error fetching locked comments:', error);
    throw error;
  }
};

export const lockComment = async (commentId: number): Promise<void> => {
  try {
    await api.put(`/admin/comments/${commentId}/lock`);
  } catch (error) {
    console.error('Error locking comment:', error);
    throw error;
  }
};

export const unlockComment = async (commentId: number): Promise<void> => {
  try {
    await api.put(`/admin/comments/${commentId}/unlock`);
  } catch (error) {
    console.error('Error unlocking comment:', error);
    throw error;
  }
};

export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await api.get(`/admin/users/AllUser`);
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const getBannedUsers = async (): Promise<User[]> => {
  try {
    const response = await api.get(`/admin/users/banned`);
    return response.data;
  } catch (error) {
    console.error('Error fetching banned users:', error);
    throw error;
  }
};

export const banUser = async (userId: number): Promise<void> => {
  try {
    await api.put(`/admin/users/${userId}/ban`);
  } catch (error) {
    console.error('Error banning user:', error);
    throw error;
  }
};

export const unbanUser = async (userId: number): Promise<void> => {
  try {
    await api.put(`/admin/users/${userId}/unban`);
  } catch (error) {
    console.error('Error unbanning user:', error);
    throw error;
  }
};

export const getReports = async (): Promise<Report[]> => {
  try {
    const response = await api.get(`/admin/reports`);
    return response.data;
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
};

export const resolveReport = async (reportId: number): Promise<void> => {
  try {
    await api.put(`/admin/reports/${reportId}/resolve`);
  } catch (error) {
    console.error('Error resolving report:', error);
    throw error;
  }
}; 