import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faLockOpen } from "@fortawesome/free-solid-svg-icons";
import {
  banUser,
  getUsers,
  unbanUser,
  User,
} from "../../../services/adminService";

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersData = await getUsers();
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLockUser = async (id: number) => {
    await banUser(id);
  };

  const handleUnlockUser = async (id: number) => {
    await unbanUser(id);
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
            {isLoading && (
              <tr>
                <td colSpan={4} className="text-center py-4">
                  Đang tải dữ liệu...
                </td>
              </tr>
            )}
            {!isLoading && users.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-4">
                  Không có người dùng nào
                </td>
              </tr>
            )}
            {!isLoading &&
              users.length > 0 &&
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-100">
                  <td className="px-4 py-2 border border-gray-300">
                    {user.name}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    {user.email}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    {user.dateJoined}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    <div className="flex gap-4 items-center justify-center">
                      <FontAwesomeIcon
                        icon={faLockOpen}
                        className="cursor-pointer hover:text-blue-500 duration-300"
                        onClick={async () => {
                          await handleUnlockUser(user.id);
                        }}
                      />
                      <FontAwesomeIcon
                        className="cursor-pointer hover:text-red-500 duration-300"
                        onClick={async () => {
                          await handleLockUser(user.id);
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
