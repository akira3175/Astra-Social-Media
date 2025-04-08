import React from "react";

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
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-4">Quản lý bài đăng</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 border border-gray-300 text-left">ID</th>
              <th className="px-4 py-2 border border-gray-300 text-left">Tiêu đề</th>
              <th className="px-4 py-2 border border-gray-300 text-left">Tác giả</th>
              <th className="px-4 py-2 border border-gray-300 text-left">Ngày tạo</th>
              <th className="px-4 py-2 border border-gray-300 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-100">
                <td className="px-4 py-2 border border-gray-300">{post.id}</td>
                <td className="px-4 py-2 border border-gray-300">{post.title}</td>
                <td className="px-4 py-2 border border-gray-300">{post.author}</td>
                <td className="px-4 py-2 border border-gray-300">{post.date}</td>
                <td className="px-4 py-2 border border-gray-300">
                  
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
                    onClick={() => handleEdit(post.id)}
                  >
                    Chỉnh sửa
                  </button>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    onClick={() => handleDelete(post.id)}
                  >
                    Xóa
                  </button>
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