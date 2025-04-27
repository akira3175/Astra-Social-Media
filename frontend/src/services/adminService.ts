import { api } from "../configs/api"

// Định nghĩa các interface
export interface Post {
  id: number;
  title: string;
  author: string;
  createdAt: string;

  date: string;
  likesCount: number;
  status: 'active' | 'locked';
}

export interface Comment {
  id: number;
  content: string;
  post: string;
  author: string;
  date: string;
  status: 'active' | 'locked';
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  background:string;
  bio:string;
  name:string;
  lastName: string;
  avatar: string;
  isStaff: boolean;
  isSuperUser: boolean;
  isActive: boolean;
  dateJoined: string;
  lastLogin: string;
}

export interface Report {
  id: number;
  type: 'Bài đăng' | 'Comment' | 'User';
  content: string;
  reporter: string;
  date: string;
  status: 'pending' | 'resolved';
}

export interface AdminStats {
  totalPosts: number;
  lockedPosts: number;
  totalComments: number;
  lockedComments: number;
  totalUsers: number;
  bannedUsers: number;
}

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