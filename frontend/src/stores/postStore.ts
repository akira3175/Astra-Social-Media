import { create } from 'zustand';
import { PostService } from '../services/PostService';
import CommentService from '../services/CommentService'; // Import CommentService
import type { Post } from '../types/post';
import type { Comment } from '../types/comment'; // Import Comment type

interface PostState {
  posts: Post[];
  isLoading: boolean;
  error: Error | null;
  commentsByPostId: { [postId: number]: Comment[] }; // Add comments state
  isLoadingComments: { [postId: number]: boolean }; // Add comment loading state
  fetchPosts: () => Promise<void>;
  addPost: (content: string, imageUrls?: string[]) => Promise<void>;
  likePost: (postId: number, userId: number) => Promise<void>;
  savePost: (postId: number) => Promise<void>;
  setLoading: (loading: boolean) => void;
  fetchComments: (postId: number) => Promise<void>;
  addComment: (postId: number, content: string, imageUrls?: string[], parentCommentId?: number | null) => Promise<void>; // Update addComment signature
}

export const usePostStore = create<PostState>((set, get) => ({
  posts: [],
  isLoading: false,
  error: null,
  commentsByPostId: {}, // Initialize comments state
  isLoadingComments: {}, // Initialize comment loading state

  fetchPosts: async () => {
    set({ isLoading: true, error: null });
    try {
      const fetchedPosts = await PostService.getAllPosts();
      set({ posts: fetchedPosts, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false, error: error });
    }
  },

  addPost: async (content: string, imageUrls?: string[]) => {
    set({ isLoading: true, error: null });
    try {
      const newPost = await PostService.createPost({ content, imageUrls: imageUrls || [] });
      set((state) => ({
        posts: [newPost, ...state.posts],
        isLoading: false,
      }));
    } catch (error: any) {
      set({ isLoading: false, error: error });
    }
  },

  likePost: async (postId: number, userId: number) => {
    const state = get();
    const postToUpdate = state.posts.find(p => p.id === postId);

    if (!postToUpdate) {
      console.error("Post not found in store");
      return;
    }

    try {
      let updatedPost: Post;
      if (postToUpdate.liked) {
        updatedPost = await PostService.unlikePost(postId, userId);
      } else {
        updatedPost = await PostService.likePost(postId);
      }

      set((currentState) => ({
        posts: currentState.posts.map((post) =>
          post.id === postId ? updatedPost : post
        ),
      }));
    } catch (error: any) {
      console.error("Error liking/unliking post:", error);
    }
  },

  savePost: async (postId: number) => {
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId ? { ...post, saved: !post.saved } : post
      ),
    }));
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  // --- Comment Actions ---
  fetchComments: async (postId: number) => {
    set((state) => ({
      isLoadingComments: { ...state.isLoadingComments, [postId]: true },
    }));
    try {
      const comments = await CommentService.getCommentsByPostId(postId);
      set((state) => ({
        commentsByPostId: { ...state.commentsByPostId, [postId]: comments },
        isLoadingComments: { ...state.isLoadingComments, [postId]: false },
      }));
    } catch (error: any) {
      console.error(`Error fetching comments for post ${postId}:`, error);
      set((state) => ({
        isLoadingComments: { ...state.isLoadingComments, [postId]: false },
        // Optionally set an error state for comments
      }));
    }
  },

  addComment: async (postId: number, content: string, imageUrls?: string[], parentCommentId?: number | null) => { // Update addComment implementation
    try {
      // Pass parentCommentId to the service
      await CommentService.createComment(postId, content, imageUrls, parentCommentId);

      // Refetch top-level comments for the post after adding any comment (top-level or reply)
      // This keeps the main comment list consistent. Displaying replies will be handled separately.
      await get().fetchComments(postId);
    } catch (error: any) {
      console.error(`Error adding comment to post ${postId}:`, error);
      // Optionally set an error state for adding comments
    }
  },
}));
