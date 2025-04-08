import React from "react";

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
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-4">Quản lý bình luận</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 border border-gray-300 text-left">ID</th>
              <th className="px-4 py-2 border border-gray-300 text-left">Nội dung</th>
              <th className="px-4 py-2 border border-gray-300 text-left">Người dùng</th>
              <th className="px-4 py-2 border border-gray-300 text-left">Ngày tạo</th>
              <th className="px-4 py-2 border border-gray-300 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {comments.map((comment) => (
              <tr key={comment.id} className="hover:bg-gray-100">
                <td className="px-4 py-2 border border-gray-300">{comment.id}</td>
                <td className="px-4 py-2 border border-gray-300">{comment.content}</td>
                <td className="px-4 py-2 border border-gray-300">{comment.user}</td>
                <td className="px-4 py-2 border border-gray-300">{comment.date}</td>
                <td className="px-4 py-2 border border-gray-300">
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    onClick={() => handleDelete(comment.id)}
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

export default CommentManagement;