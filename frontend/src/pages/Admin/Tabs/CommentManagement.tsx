import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from "@mui/material";

const CommentManagement: React.FC = () => {
  // Dữ liệu mẫu
  const comments = [
    { id: 1, content: "Bài viết rất hay!", user: "Nguyen Van A", date: "2025-04-01" },
    { id: 2, content: "Tôi không đồng ý với bài viết này.", user: "Tran Thi B", date: "2025-04-02" },
    { id: 3, content: "Cảm ơn bạn đã chia sẻ!", user: "Le Van C", date: "2025-04-03" },
  ];

  const handleDelete = (id: number) => {
    console.log(`Xóa bình luận với ID: ${id}`);
    // Thêm logic xóa bình luận ở đây
  };

  return (
    <div>
      <h2>Quản lý bình luận</h2>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nội dung</TableCell>
              <TableCell>Người dùng</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {comments.map((comment) => (
              <TableRow key={comment.id}>
                <TableCell>{comment.id}</TableCell>
                <TableCell>{comment.content}</TableCell>
                <TableCell>{comment.user}</TableCell>
                <TableCell>{comment.date}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleDelete(comment.id)}
                  >
                    Xóa
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default CommentManagement;