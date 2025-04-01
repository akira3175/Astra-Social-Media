import axios from "axios";
import type { Post } from "../types/post";
import type { ApiResponse } from "../types/apiResponse";
import { tokenService } from "./tokenService";

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
    const response = await axios.post<ApiResponse<Post>>(
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
    const response = await axios.get<ApiResponse<Post[]>>(
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

const likePost = async (postId: number): Promise<Post> => {
  const token = tokenService.getAccessToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await axios.post<ApiResponse<Post>>(
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
    const response = await axios.delete<ApiResponse<Post>>(
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

export const PostService = {
  createPost,
  getAllPosts,
  likePost,
  unlikePost,
};
