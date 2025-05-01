import React, { useEffect, useState } from 'react'
import { getComments, getPosts, getUsers, Post, User } from '../../services/adminService'
import { ApiResponse } from '../../types/apiResponse';
import { api } from '../../configs/api';

const TestPage = () => {
    const [posts,setPosts] = useState<Post[]>([])
useEffect(() => {
    async function fetchPosts() {
        const getpost =await getComments()
        console.log(getpost);
        
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