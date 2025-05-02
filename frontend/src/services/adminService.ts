import { api } from "../configs/api";
import { setAuthHeader } from "./authService";
import { tokenService } from "./tokenService";

// API Response type
interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  timestamp: number;
}

// User interface matching backend User entity
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  background: string | null;
  bio: string | null;
  isStaff: boolean;
  isSuperUser: boolean;
  isActive: boolean;
  dateJoined: string;
  lastLogin: string | null;
  mutualFriends: number | null;
  name: string; // Computed field from firstName + lastName
}

// Post interface matching backend Post entity
export interface Post {
  id: number;
  content: string;
  images: Array<{ id: number; url: string }>;
  user: User;
  createdAt: string;
  updatedAt: string | null;
  originalPost?: Post;
  comments: Comment[];
  likes: Like[];
  isDeleted: boolean;
  deletedAt: string | null;
  likedByCurrentUser: boolean;
  likeCount: number;
  totalCommentCount: number;
}

export interface PostComment {
  idPost: number;
  userPost: UserComment;
  comments: Comment[];
}

export interface UserComment {
  id: number;
  name: string;
  avatar: string | null;
  email: string;
}

// Comment interface matching backend Comment entity
export interface Comment {
  idComment: number;
  content: string;
  userComment: UserComment;
  replies: Comment[];
  createdAt: number;
  updatedAt: number | null;
}

export interface FlattenedComment extends Comment {
  parentId: number | null; // ID of the parent comment or post
  postId: number; // ID of the post
}

// Like interface
export interface Like {
  id: number;
  user: User;
  post?: Post;
  comment?: Comment;
  createdAt: string;
}

// CommentListResponse interface
export interface CommentListResponse {
  comments: Comment[];
  totalCount: number;
}

// Admin stats interface
export interface AdminStats {
  totalPosts: number;
  lockedPosts: number;
  totalComments: number;
  totalUsers: number;
  bannedUsers: number;
}

// Auth response interface
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

// Pagination interface
interface PaginationParams {
  page?: number;
  size?: number;
}

// Date range interface
interface DateRangeParams {
  start: string; // Format: dd-MM-yyyy
  end: string; // Format: dd-MM-yyyy
}

// API calls
export const getAdminStats = async (): Promise<AdminStats> => {
  try {
    const response = await api.get<ApiResponse<AdminStats>>(`/admin/stats`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    throw new Error("Failed to fetch admin statistics");
  }
};

export const getAdminStatsAt = async (
  params: DateRangeParams
): Promise<AdminStats> => {
  try {
    const response = await api.get<ApiResponse<AdminStats>>(`/admin/statsAt`, {
      params: {
        start: params.start,
        end: params.end,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching admin stats at date range:", error);
    throw new Error(
      "Failed to fetch admin statistics for the specified date range"
    );
  }
};

export const getUsers = async (
  pagination?: PaginationParams
): Promise<User[]> => {
  try {
    const response = await api.get<ApiResponse<User[]>>(
      `/admin/users/getAllUser`,
      {
        params: pagination,
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
};

export const getUsersAt = async (
  params: DateRangeParams & PaginationParams
): Promise<User[]> => {
  try {
    const response = await api.get<ApiResponse<User[]>>(
      `/admin/users/getAllUserAt`,
      {
        params: {
          start: params.start,
          end: params.end,
          page: params.page,
          size: params.size,
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching users at date range:", error);
    throw new Error("Failed to fetch users for the specified date range");
  }
};

export const getUsersLoginToday = async (
  pagination?: PaginationParams
): Promise<User[]> => {
  try {
    const response = await api.get<ApiResponse<User[]>>(
      `/admin/users/getUserLoginToday`,
      {
        params: pagination,
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching users logged in today:", error);
    throw new Error("Failed to fetch users who logged in today");
  }
};

export const banUser = async (userId: number): Promise<void> => {
  try {
    await api.post<ApiResponse<void>>(`/admin/users/${userId}/ban`);
  } catch (error) {
    console.error("Error banning user:", error);
    throw new Error("Failed to ban user");
  }
};

export const unbanUser = async (userId: number): Promise<void> => {
  try {
    await api.post<ApiResponse<void>>(`/admin/users/${userId}/unban`);
  } catch (error) {
    console.error("Error unbanning user:", error);
    throw new Error("Failed to unban user");
  }
};

export const getPosts = async (
  pagination?: PaginationParams
): Promise<Post[]> => {
  try {
    const response = await api.get<ApiResponse<Post[]>>(
      `/admin/posts/getAllPost`,
      {
        params: pagination,
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw new Error("Failed to fetch posts");
  }
};

export const getPostsAt = async (
  params: DateRangeParams & PaginationParams
): Promise<Post[]> => {
  try {
    const response = await api.get<ApiResponse<Post[]>>(
      `/admin/posts/getAllPostAt`,
      {
        params: {
          start: params.start,
          end: params.end,
          page: params.page,
          size: params.size,
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching posts at date range:", error);
    throw new Error("Failed to fetch posts for the specified date range");
  }
};

export const lockPost = async (postId: number): Promise<void> => {
  try {
    await api.post<ApiResponse<void>>(`/admin/posts/${postId}/lock`);
  } catch (error) {
    console.error("Error locking post:", error);
    throw new Error("Failed to lock post");
  }
};

export const getComments = async (
  pagination?: PaginationParams
): Promise<FlattenedComment[]> => {
  try {
    const response = await api.get<ApiResponse<PostComment[]>>(
      `/admin/comments/getAllComment`,
      {
        params: pagination,
      }
    );

    const data:PostComment[] = response.data.data

  // Recursive function to flatten comments and replies
        const flattenComments = (
          comments: Comment[],
          postId: number,
          parentId: number | null = null
        ): FlattenedComment[] => {
          return comments.flatMap((comment) => [
            {
              ...comment,
              parentId,
              postId,
            },
            ...flattenComments(comment.replies, postId, comment.idComment),
          ]);
        };

        // Flatten all comments from all posts
        const flattenedComments = data.flatMap((postComment) =>
          flattenComments(postComment.comments, postComment.idPost)
        );



    return flattenedComments;
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw new Error("Failed to fetch comments");
  }
};

export const getCommentsByPost = async (
  postId: number
): Promise<CommentListResponse> => {
  try {
    const response = await api.get<ApiResponse<CommentListResponse>>(
      `/admin/comments/getCommentsByPost/${postId}`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching comments by post:", error);
    throw new Error("Failed to fetch comments for post");
  }
};

export const getAllUserLoginToday = async (
  pagination?: PaginationParams
): Promise<User[]> => {
  try {
    const response = await api.get<ApiResponse<User[]>>(
      `/admin/users/getUserLoginToday`,
      {
        params: pagination,
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw new Error("Failed to fetch user");
  }
};

export const getCommentsAt = async (
  params: DateRangeParams & PaginationParams
): Promise<Comment[]> => {
  try {
    const response = await api.get<ApiResponse<Comment[]>>(
      `/admin/comments/getAllCommentAt`,
      {
        params: {
          start: params.start,
          end: params.end,
          page: params.page,
          size: params.size,
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching comments at date range:", error);
    throw new Error("Failed to fetch comments for the specified date range");
  }
};

export const deleteComment = async (commentId: number): Promise<void> => {
  try {
    await api.post<ApiResponse<void>>(`/admin/comments/${commentId}/delete`);
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw new Error("Failed to delete comment");
  }
};

export const adminLogin = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  try {
    const response = await api.post<ApiResponse<AuthResponse>>(`/admin/login`, {
      email,
      password,
    });

    const { accessToken, refreshToken } = response.data.data;

    tokenService.setAccessToken(accessToken);
    tokenService.setRefreshToken(refreshToken);
    localStorage.setItem("adminToken", accessToken);
    setAuthHeader(accessToken);

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error logging in as admin:", error);
    throw new Error("Failed to login as admin");
  }
};

export const refreshAdminToken = async (
  refreshToken: string
): Promise<{ accessToken: string }> => {
  try {
    const response = await api.post<ApiResponse<{ accessToken: string }>>(
      `/admin/login/refresh`,
      {
        refreshToken,
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error refreshing admin token:", error);
    throw new Error("Failed to refresh admin token");
  }
};
