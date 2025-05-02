import React, { useEffect, useState } from 'react';
import { getComments, PostComment, Comment } from '../../services/adminService';
import { getAllUser, searchUsers } from '../../services/authService';
import { api } from '../../configs/api';
import { AxiosResponse } from 'axios';
import { User } from '../../types/user';
import { tokenService } from '../../services/tokenService';
import { getAllPosts } from '../../services/PostService';

interface FlattenedComment extends Comment {
  parentId: number | null; // ID of the parent comment or post
  postId: number; // ID of the post
}

const TestPage = () => {
  const [comments, setComments] = useState<FlattenedComment[]>([]);

  useEffect(() => {
    async function fetchComments() {
      try {
        const response = await getAllPosts();
        console.log(response);
        
        //   const token = tokenService.getAccessToken();
        
        // const response = await api.get<AxiosResponse<User[]>>(
        //   `/users/search?keyword=1`,
        //   {
        //     headers: {
        //       "Content-Type": "application/json",
        //       Authorization: `Bearer ${token}`,
        //     },
        //   }
        // );

        // console.log(response.data.content);
        
       
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    }
    fetchComments();
  }, []);

  return (
    <div>
      {comments.length} comments loaded.
      <ul>
        {comments.map((comment) => (
          <li key={comment.idComment}>
            {comment.content} (Post ID: {comment.postId}, Parent ID: {comment.parentId})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TestPage;