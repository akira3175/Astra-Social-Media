import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from "@mui/material";

const PostManagement: React.FC = () => {
  // Dữ liệu mẫu
  const posts = [
    { id: 1, title: "Bài viết 1", author: "Nguyen Van A", date: "2025-04-01" },
    { id: 2, title: "Bài viết 2", author: "Tran Thi B", date: "2025-04-02" },
    { id: 3, title: "Bài viết 3", author: "Le Van C", date: "2025-04-03" },
  ];

  const handleDelete = (id: number) => {
    console.log(`Xóa bài đăng với ID: ${id}`);
    // Thêm logic xóa bài đăng ở đây
  };

  const handleEdit = (id: number) => {
    console.log(`Chỉnh sửa bài đăng với ID: ${id}`);
    // Thêm logic chỉnh sửa bài đăng ở đây
  };

  return (
    <div>
      <h2>Quản lý bài đăng</h2>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Tiêu đề</TableCell>
              <TableCell>Tác giả</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell>{post.id}</TableCell>
                <TableCell>{post.title}</TableCell>
                <TableCell>{post.author}</TableCell>
                <TableCell>{post.date}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleEdit(post.id)}
                    style={{ marginRight: "10px" }}
                  >
                    Chỉnh sửa
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleDelete(post.id)}
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

export default PostManagement;