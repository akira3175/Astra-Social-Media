import React, { useEffect, useState } from 'react'
import { getPosts, getUsers, Post, User } from '../../services/adminService'
import { ApiResponse } from '../../types/apiResponse';
import { api } from '../../configs/api';

const TestPage = () => {
    const [posts,setPosts] = useState<Post[]>([])
useEffect(() => {
    async function fetchPosts() {
        try {
            const response = await api.get<ApiResponse<Post[]>>(`/admin/posts/getAllPost`, {
            });
            console.log(response);
            
            return response.data.data;
          } catch (error) {
            console.error("Error fetching posts:", error);
            throw new Error("Failed to fetch posts");
          }
    }
    fetchPosts();
}, []);
  return (
    <div>
        {posts.length}
    </div>
  )
}

export default TestPage