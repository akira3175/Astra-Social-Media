import { create } from 'zustand';
import { PostService } from '../services/PostService';
import CommentService from '../services/CommentService';
import type { Post } from '../types/post';
import type { Comment } from '../types/comment';

import type { CommentListResponse } from '../types/commentListResponse';

interface PostState {
  posts: Post[];
  isLoading: boolean;
  error: Error | null;
  commentDataByPostId: { [postId: number]: CommentListResponse | undefined };
  isLoadingComments: { [postId: number]: boolean };
  fetchPosts: () => Promise<void>;
  addPost: (content: string, imageUrls?: string[]) => Promise<void>;
  likePost: (postId: number) => Promise<void>;
  unlikePost: (postId: number) => Promise<void>;
  savePost: (postId: number) => Promise<void>;
  setLoading: (loading: boolean) => void;
  fetchComments: (postId: number) => Promise<void>;
  addComment: (postId: number, content: string, imageUrls?: string[], parentCommentId?: number | null) => Promise<void>;
  updatePost: (postId: number) => Promise<void>;

  repostsById: Record<number, Post[]>;
  isReposting: boolean;
  repostError: string | null;
  fetchPostsByUserEmail: (email: string) => Promise<void>;
  repostPost: (postId: number, content?: string) => Promise<void>;
  getRepostsByPostId: (postId: number) => Promise<void>;

  isDeletingPost: { [key: number]: boolean };
  deletePost: (postId: number) => Promise<void>;

  userPosts: Post[];
  isLoadingUserPosts: boolean;
  userPostsError: string | null;

  likeComment: (postId: number, commentId: number) => Promise<void>;
  unlikeComment: (postId: number, commentId: number) => Promise<void>;
}

const addReplyToCommentTree = (comments: Comment[], newReply: Comment, parentId: number): Comment[] => {
    return comments.map(comment => {
      if (comment.id === parentId) {
        return { ...comment, replies: [...(comment.replies || []), newReply] };
      }
      if (comment.replies && comment.replies.length > 0) {
        return { ...comment, replies: addReplyToCommentTree(comment.replies, newReply, parentId) };
      }
      return comment;
    });
  };

export const usePostStore = create<PostState>((set, get) => ({
  posts: [],
  isLoading: false,
  error: null,
  commentDataByPostId: {},
  isLoadingComments: {},
  repostsById: {},
  isReposting: false,
  repostError: null,
  isDeletingPost: {},
  userPosts: [],
  isLoadingUserPosts: false,
  userPostsError: null,

  fetchPosts: async () => {
    set({ isLoading: true, error: null });
    try {
      const fetchedPosts = await PostService.getAllPosts();
      
      // Fetch chi tiết của từng post và comments của chúng
      await Promise.all(fetchedPosts.map(async (post) => {
        try {
          // Fetch chi tiết post để lấy thông tin liked, likesCount mới nhất
          const detailedPost = await PostService.getPostById(post.id);
          
          // Fetch comments của post
          const commentData = await CommentService.getCommentsByPostId(post.id);
          
          // Cập nhật store với thông tin mới
          set(state => ({
            posts: state.posts.map(p => p.id === post.id ? detailedPost : p),
            commentDataByPostId: {
              ...state.commentDataByPostId,
              [post.id]: commentData
            }
          }));
        } catch (error) {
          console.error(`Error fetching details for post ${post.id}:`, error);
        }
      }));

      // Set initial posts array
      set({ 
        posts: fetchedPosts,
        isLoading: false 
      });
    } catch (error: any) {
      console.error("Error fetching posts:", error);
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
      console.error("Error adding post:", error);
      set({ isLoading: false, error: error });
    }
  },

  likePost: async (postId: number) => {
    try {
      await PostService.likePost(postId);
      // Fetch lại post để lấy trạng thái mới nhất
      const updatedPost = await PostService.getPostById(postId);
      // console.log('After like - Updated post:', updatedPost);
      
      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === postId 
            ? { 
                ...post, 
                liked: updatedPost.liked, 
                likesCount: updatedPost.likesCount 
              } 
            : post
        ),
      }));
    } catch (error) {
      console.error("Error liking post:", error);
    }
  },

  unlikePost: async (postId: number) => {
    try {
      await PostService.unlikePost(postId);
      // Fetch lại post để lấy trạng thái mới nhất
      const updatedPost = await PostService.getPostById(postId);
      // console.log('After unlike - Updated post:', updatedPost);
      
      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === postId 
            ? { 
                ...post, 
                liked: updatedPost.liked, 
                likesCount: updatedPost.likesCount 
              } 
            : post
        ),
      }));
    } catch (error) {
      console.error("Error unliking post:", error);
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

  fetchComments: async (postId: number) => {
    if (get().isLoadingComments[postId]) return;

    set((state) => ({
      isLoadingComments: { ...state.isLoadingComments, [postId]: true },
    }));
    try {
      const commentDataResult: CommentListResponse = await CommentService.getCommentsByPostId(postId);

      set((state) => ({
        commentDataByPostId: { ...state.commentDataByPostId, [postId]: commentDataResult },
        isLoadingComments: { ...state.isLoadingComments, [postId]: false },
      }));
    } catch (error: any) {
      console.error(`Error fetching comments for post ${postId}:`, error);
      set((state) => ({
        isLoadingComments: { ...state.isLoadingComments, [postId]: false },
      }));
    }
  },

  addComment: async (postId: number, content: string, imageUrls?: string[], parentCommentId?: number | null) => {
    try {
      const newComment = await CommentService.createComment(postId, content, imageUrls, parentCommentId);

      set((state) => {
        const currentPostCommentData = state.commentDataByPostId[postId];
        const currentComments = currentPostCommentData?.comments || [];
        const currentTotalCount = currentPostCommentData?.totalCount ?? 0;

        let updatedComments: Comment[];
        let newTotalCount = currentTotalCount + 1;

        if (!parentCommentId) {
          updatedComments = [...currentComments, newComment];
        } else {
          updatedComments = addReplyToCommentTree(currentComments, newComment, parentCommentId);
        }

        const newPostCommentData: CommentListResponse = {
             comments: updatedComments,
             totalCount: newTotalCount,
        };

        return {
          commentDataByPostId: {
            ...state.commentDataByPostId,
            [postId]: newPostCommentData, // Assign the correctly typed object
          },
        };
      });

    } catch (error: any) {
      console.error(`Error adding comment to post ${postId}:`, error);
    }
  },

  updatePost: async (postId: number) => {
    try {
      const updatedPost = await PostService.getPostById(postId);
      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === postId ? updatedPost : post
        ),
      }));
    } catch (error) {
      console.error("Error updating post:", error);
    }
  },

  repostPost: async (postId: number, content?: string) => {
    set({ isReposting: true, repostError: null })
    try {
      const repostedPost = await PostService.repostPost(postId, content)
      
      // Cập nhật posts array
      set(state => ({
        posts: [repostedPost, ...state.posts],
      }))

      // Cập nhật reposts cho post gốc
      set(state => ({
        repostsById: {
          ...state.repostsById,
          [postId]: [...(state.repostsById[postId] || []), repostedPost]
        }
      }))

    } catch (error) {
      set({ 
        repostError: error instanceof Error ? error.message : 'Failed to repost'
      })
    } finally {
      set({ isReposting: false })
    }
  },

  getRepostsByPostId: async (postId: number) => {
    try {
      const reposts = await PostService.getRepostsByPostId(postId);
      set(state => ({
        repostsById: {
          ...state.repostsById,
          [postId]: reposts
        }
      }));
    } catch (error) {
      console.error('Error fetching reposts:', error);
    }
  },

  deletePost: async (postId: number) => {
    try {
      set(state => ({
        isDeletingPost: { ...state.isDeletingPost, [postId]: true }
      }));

      await PostService.deletePost(postId);

      set(state => ({
        posts: state.posts.filter(post => post.id !== postId),
        userPosts: state.userPosts.filter(post => post.id !== postId),
        isDeletingPost: { ...state.isDeletingPost, [postId]: false }
      }));
    } catch (error) {
      set(state => ({
        isDeletingPost: { ...state.isDeletingPost, [postId]: false }
      }));
      throw error;
    }
  },

  fetchPostsByUserEmail: async (email: string) => {
    set({ isLoadingUserPosts: true, userPostsError: null });
    try {
      const posts = await PostService.getPostsByUserEmail(email);
      set({ 
        userPosts: posts || [],
        isLoadingUserPosts: false 
      });
    } catch (error) {
      console.error('Error fetching user posts:', error);
      set({ 
        userPosts: [],
        isLoadingUserPosts: false,
        userPostsError: 'Failed to load user posts'
      });
    }
  },

  likeComment: async (postId: number, commentId: number) => {
    try {
      const updatedComment = await CommentService.likeComment(commentId);
      set((state) => ({
        commentDataByPostId: {
          ...state.commentDataByPostId,
          [postId]: {
            ...state.commentDataByPostId[postId]!,
            comments: updateCommentInTree(
              state.commentDataByPostId[postId]!.comments,
              updatedComment
            )
          }
        }
      }));
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  },

  unlikeComment: async (postId: number, commentId: number) => {
    try {
      const updatedComment = await CommentService.unlikeComment(commentId);
      set((state) => ({
        commentDataByPostId: {
          ...state.commentDataByPostId,
          [postId]: {
            ...state.commentDataByPostId[postId]!,
            comments: updateCommentInTree(
              state.commentDataByPostId[postId]!.comments,
              updatedComment
            )
          }
        }
      }));
    } catch (error) {
      console.error('Error unliking comment:', error);
    }
  }
}));

// Helper function to update a comment in the nested tree structure
const updateCommentInTree = (comments: Comment[], updatedComment: Comment): Comment[] => {
  return comments.map(comment => {
    if (comment.id === updatedComment.id) {
      return updatedComment;
    }
    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: updateCommentInTree(comment.replies, updatedComment)
      };
    }
    return {
      ...comment,
      replies: [] 
    };
  });
};