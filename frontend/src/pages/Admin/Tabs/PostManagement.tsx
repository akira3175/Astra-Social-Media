import { faLockOpen, faLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { getPosts, Post } from "../../../services/adminService";

const PostManagement: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const postsData = await getPosts();
        setPosts(postsData);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = (id: number) => {
    console.log(`Xóa bài đăng với ID: ${id}`);
    // Thêm logic xóa bài đăng ở đây
  };

  const handleEdit = (id: number) => {
    console.log(`Chỉnh sửa bài đăng với ID: ${id}`);
    // Thêm logic chỉnh sửa bài đăng ở đây
  };

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-4">Quản lý bài đăng</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 border border-gray-300 text-left">
                Tiêu đề
              </th>
              <th className="px-4 py-2 border border-gray-300 text-left">
                Tác giả
              </th>
              <th className="px-4 py-2 border border-gray-300 text-left">
                Ngày tạo
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
            {!isLoading && posts.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-4">
                  Không có người dùng nào
                </td>
              </tr>
            )}
            {!isLoading && posts.length > 0 &&
              posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-100">
                  <td className="px-4 py-2 border border-gray-300">
                    {post.title}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    {post.author}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    {post.date}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    <div className="flex gap-4 items-center justify-center">
                      <FontAwesomeIcon
                        icon={faLockOpen}
                        className="cursor-pointer hover:text-blue-500 duration-300"
                        onClick={() => {
                          handleEdit(post.id);
                        }}
                      />
                      <FontAwesomeIcon
                        className="cursor-pointer hover:text-red-500 duration-300"
                        onClick={() => {
                          handleDelete(post.id);
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

export default PostManagement;
