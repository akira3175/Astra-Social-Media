import React, { useEffect, useState } from 'react';
import { getComments, PostComment, Comment } from '../../services/adminService';

interface FlattenedComment extends Comment {
  parentId: number | null; // ID of the parent comment or post
  postId: number; // ID of the post
}

const TestPage = () => {
  const [comments, setComments] = useState<FlattenedComment[]>([]);

  useEffect(() => {
    async function fetchComments() {
      try {
        const response = await getComments();

       
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