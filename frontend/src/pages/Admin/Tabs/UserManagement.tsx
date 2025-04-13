import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faLockOpen,

} from "@fortawesome/free-solid-svg-icons";

const UserManagement: React.FC = () => {
  // Dữ liệu mẫu
  const users = [
    {
      id: 1,
      name: "Nguyen Van A",
      email: "nguyenvana@example.com",
      joinedDate: "2025-01-01",
    },
    {
      id: 2,
      name: "Tran Thi B",
      email: "tranthib@example.com",
      joinedDate: "2025-02-15",
    },
    {
      id: 3,
      name: "Le Van C",
      email: "levanc@example.com",
      joinedDate: "2025-03-10",
    },
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
              <th className="px-4 py-2 border border-gray-300 text-left">
                Tên người dùng
              </th>
              <th className="px-4 py-2 border border-gray-300 text-left">
                Email
              </th>
              <th className="px-4 py-2 border border-gray-300 text-left">
                Ngày tham gia
              </th>
              <th className="px-4 py-2 border border-gray-300 text-left">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-100">
                <td className="px-4 py-2 border border-gray-300">
                  {user.name}
                </td>
                <td className="px-4 py-2 border border-gray-300">
                  {user.email}
                </td>
                <td className="px-4 py-2 border border-gray-300">
                  {user.joinedDate}
                </td>
                <td className="px-4 py-2 border border-gray-300">
                  <div className="flex gap-4 items-center justify-center">
                    <FontAwesomeIcon
                      icon={faLockOpen}
                      className="cursor-pointer hover:text-blue-500 duration-300"
                      onClick={() => {
                        handleEdit(user.id);
                      }}
                    />
                    <FontAwesomeIcon
                      className="cursor-pointer hover:text-red-500 duration-300"
                      onClick={() => {
                        handleDelete(user.id);
                      }}
                      icon={faLock}
                    />
                  </div>
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
