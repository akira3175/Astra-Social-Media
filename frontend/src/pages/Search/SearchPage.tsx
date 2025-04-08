import React, { useState } from "react";
import {
  TextField,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  // Dữ liệu mẫu
  const posts = [
    { id: 1, title: "Bài viết 1", author: "Nguyen Van A", date: "2025-04-01" },
    { id: 2, title: "Bài viết 2", author: "Tran Thi B", date: "2025-04-02" },
    { id: 3, title: "Bài viết 3", author: "Le Van C", date: "2025-04-03" },
  ];

  const users = [
    { id: 1, name: "Nguyen Van A", email: "nguyenvana@example.com", joinedDate: "2025-01-01" },
    { id: 2, name: "Tran Thi B", email: "tranthib@example.com", joinedDate: "2025-02-15" },
    { id: 3, name: "Le Van C", email: "levanc@example.com", joinedDate: "2025-03-10" },
  ];

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h2>Trang Tìm Kiếm</h2>
      <TextField
        label="Tìm kiếm"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchTerm}
        onChange={handleSearch}
      />
      <Tabs
        value={activeTab}
        onChange={(event, newValue) => setActiveTab(newValue)}
        centered
      >
        <Tab label="Tìm kiếm bài đăng" />
        <Tab label="Tìm kiếm người dùng" />
      </Tabs>
      <TableContainer component={Paper} style={{ marginTop: "20px" }}>
        <Table>
          <TableHead>
            <TableRow>
              {activeTab === 0 ? (
                <>
                  <TableCell>ID</TableCell>
                  <TableCell>Tiêu đề</TableCell>
                  <TableCell>Tác giả</TableCell>
                  <TableCell>Ngày tạo</TableCell>
                </>
              ) : (
                <>
                  <TableCell>ID</TableCell>
                  <TableCell>Tên người dùng</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Ngày tham gia</TableCell>
                </>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {activeTab === 0
              ? filteredPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>{post.id}</TableCell>
                    <TableCell>{post.title}</TableCell>
                    <TableCell>{post.author}</TableCell>
                    <TableCell>{post.date}</TableCell>
                  </TableRow>
                ))
              : filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.joinedDate}</TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default SearchPage;