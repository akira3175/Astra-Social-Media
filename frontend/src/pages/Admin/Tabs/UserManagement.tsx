import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

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
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-4">Quản lý người dùng</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 border border-gray-300 text-left">ID</th>
              <th className="px-4 py-2 border border-gray-300 text-left">Tên người dùng</th>
              <th className="px-4 py-2 border border-gray-300 text-left">Email</th>
              <th className="px-4 py-2 border border-gray-300 text-left">Ngày tham gia</th>
              <th className="px-4 py-2 border border-gray-300 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-100">
                <td className="px-4 py-2 border border-gray-300">{user.id}</td>
                <td className="px-4 py-2 border border-gray-300">{user.name}</td>
                <td className="px-4 py-2 border border-gray-300">{user.email}</td>
                <td className="px-4 py-2 border border-gray-300">{user.joinedDate}</td>
                <td className="px-4 py-2 border border-gray-300">
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
                    onClick={() => handleEdit(user.id)}
                  >
                  <FontAwesomeIcon icon={faTrash} />
                  </button>
                  <FontAwesomeIcon icon="fa-solid fa-trash" />
                  {/* <button
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    onClick={() => handleDelete(user.id)}
                  >
                    Xóa
                  </button> */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;