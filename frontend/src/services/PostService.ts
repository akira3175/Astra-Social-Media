import axios, { AxiosResponse } from "axios";
import type { Post } from "../types/post";
import type { ApiResponse } from "../types/apiResponse";
import { tokenService } from "./tokenService";
import { api } from "../configs/api"

interface CreatePostPayload {
  content: string;
  imageUrls: string[];
}

// interface UpdatePostRequest {
//   content: string;
// }

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  last: boolean;
}

export interface PostPageParams {
  page: number;
  size: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export const searchPost = async ({keyword,page,size}:{size?:number,keyword:string,page?:string}):Promise<Post[]> =>{
  const token = tokenService.getAccessToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await api.get<ApiResponse<Post[]>>(
      `/posts/search?keyword=${keyword}${size??`&size=${size}`}${page??`&page=${page}`}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data && response.data.status === 200 && response.data.data) {
      return response.data.data as Post[];
    } else {
      throw new Error(response.data.message || "Failed to get post");
    }
  } catch (error) {
    console.error("Error getting post:", error);
    throw error;
  }
}

const createPost = async (payload: CreatePostPayload): Promise<Post> => {
  const token = tokenService.getAccessToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await api.post<ApiResponse<Post>>(
      `/posts`,
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
      `/posts`,
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
      `/posts/${postId}`,
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
      `/likes/post/${postId}`,
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
      `/likes/post/${postId}`,
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
      `/posts/repost/${postId}`,
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
      `/posts/reposts/${postId}`,
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
      `/posts/${postId}`,
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
      `/posts/user/${email}`,
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

const updatePost = async (id: number, content: string): Promise<Post> => {
  const token = tokenService.getAccessToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await api.put<ApiResponse<Post>>(
      `/posts/${id}`,
      { content },
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
      throw new Error(response.data.message || "Failed to update post");
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error("Unauthorized: please login");
      }
      throw new Error(error.response?.data?.message || "Failed to update post");
    }
    throw error;
  }
};

const getPosts = async (params: PostPageParams): Promise<PageResponse<Post>> => {
  const token = tokenService.getAccessToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const queryParams = new URLSearchParams({
    page: params.page.toString(),
    size: params.size.toString(),
    ...(params.sortBy && { sortBy: params.sortBy }),
    ...(params.sortDirection && { sortDirection: params.sortDirection })
  });

  try {
    const response = await api.get<ApiResponse<PageResponse<Post>>>(
      `/posts?${queryParams}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data?.status === 200 && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data?.message || "Failed to fetch posts");
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
};

export const PostService = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  likePost,
  unlikePost,
  repostPost,
  getRepostsByPostId,
  deletePost,
  getPostsByUserEmail,
  getPosts
};
