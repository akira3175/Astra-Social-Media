import axios from "axios";
import type { Post } from "../types/post";
import type { ApiResponse } from "../types/apiResponse";
import { tokenService } from "./tokenService";
import { api } from "../configs/api"

// Cấu hình base URL nếu chưa có trong instance axios
const API_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

interface CreatePostPayload {
  content: string;
  imageUrls: string[];
}

const createPost = async (payload: CreatePostPayload): Promise<Post> => {
  const token = tokenService.getAccessToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await api.post<ApiResponse<Post>>(
      `${API_URL}/posts`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data && response.data.status === 201 && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to create post");
    }
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

const getAllPosts = async (): Promise<Post[]> => {
  const token = tokenService.getAccessToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await api.get<ApiResponse<Post[]>>(
      `${API_URL}/posts`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data && response.data.status === 200 && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to get all posts");
    }
  } catch (error) {
    console.error("Error getting all posts:", error);
    throw error;
  }
};

const getPostById = async (postId: number): Promise<Post> => {
  const token = tokenService.getAccessToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await api.get<ApiResponse<Post>>(
      `${API_URL}/posts/${postId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data && response.data.status === 200 && response.data.data) {
      console.log("Post data:", response.data.data);
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to get post");
    }
  } catch (error) {
    console.error("Error getting post:", error);
    throw error;
  }
};

const likePost = async (postId: number): Promise<Post> => {
  const token = tokenService.getAccessToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await api.post<ApiResponse<Post>>(
      `${API_URL}/likes/post/${postId}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data && response.data.status >= 200 && response.data.status < 300 && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to like post");
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new Error("Unauthorized: please login");
    }
    console.error("Error liking post:", error);
    throw error;
  }
};

const unlikePost = async (postId: number): Promise<Post> => {
  const token = tokenService.getAccessToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await api.delete<ApiResponse<Post>>(
      `${API_URL}/likes/post/${postId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data && response.data.status >= 200 && response.data.status < 300 && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to unlike post");
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new Error("Unauthorized: please login");
    }
    console.error("Error unliking post:", error);
    throw error;
  }
};

const repostPost = async (postId: number, content?: string): Promise<Post> => {
  const token = tokenService.getAccessToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await api.post<ApiResponse<Post>>(
      `${API_URL}/posts/repost/${postId}`,
      {
        content: content || "", 
        imageUrls: []
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data && response.data.status === 201 && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to repost");
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new Error("Unauthorized: please login");
    }
    console.error("Error reposting:", error);
    throw error;
  }
};

const getRepostsByPostId = async (postId: number): Promise<Post[]> => {
  const token = tokenService.getAccessToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await api.get<ApiResponse<Post[]>>(
      `${API_URL}/posts/reposts/${postId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data && response.data.status === 200 && response.data.data) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to get reposts");
    }
  } catch (error) {
    console.error("Error getting reposts:", error);
    throw error;
  }
};

const deletePost = async (postId: number): Promise<void> => {
  const token = tokenService.getAccessToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await api.delete<ApiResponse<void>>(
      `${API_URL}/posts/${postId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!(response.data && response.data.status === 200)) {
      throw new Error(response.data.message || "Failed to delete post");
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new Error("Unauthorized: please login");
    }
    console.error("Error deleting post:", error);
    throw error;
  }
};

export const getPostsByUserEmail = async (email: string): Promise<Post[]> => {
  const token = tokenService.getAccessToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await api.get<ApiResponse<Post[]>>(
      `${API_URL}/posts/user/${email}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data && response.data.status === 200 && response.data.data) {
      return response.data.data; 
    } else {
      throw new Error(response.data.message || "Failed to get user posts");
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new Error("Unauthorized: please login");
    }
    console.error("Error getting user posts:", error);
    throw error;
  }
};
export const PostService = {
  createPost,
  getAllPosts,
  getPostById,
  likePost,
  unlikePost,
  repostPost,
  getRepostsByPostId,
  deletePost,
  getPostsByUserEmail
};
