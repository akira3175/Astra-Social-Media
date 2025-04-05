import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from "@mui/material";

const UserManagement: React.FC = () => {
  // Dữ liệu mẫu
  const users = [
    { id: 1, name: "Nguyen Van A", email: "nguyenvana@example.com", joinedDate: "2025-01-01" },
    { id: 2, name: "Tran Thi B", email: "tranthib@example.com", joinedDate: "2025-02-15" },
    { id: 3, name: "Le Van C", email: "levanc@example.com", joinedDate: "2025-03-10" },
  ];

  const handleDelete = (id: number) => {
    console.log(`Xóa người dùng với ID: ${id}`);
    // Thêm logic xóa người dùng ở đây
  };

  const handleEdit = (id: number) => {
    console.log(`Chỉnh sửa người dùng với ID: ${id}`);
    // Thêm logic chỉnh sửa người dùng ở đây
  };

  return (
    <div>
      <h2>Quản lý người dùng</h2>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Tên người dùng</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Ngày tham gia</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.joinedDate}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleEdit(user.id)}
                    style={{ marginRight: "10px" }}
                  >
                    Chỉnh sửa
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleDelete(user.id)}
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

export default UserManagement;