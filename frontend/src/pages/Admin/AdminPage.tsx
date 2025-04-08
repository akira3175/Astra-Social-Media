import React from "react";
import PostManagement from "./Tabs/PostManagement";
import UserManagement from "./Tabs/UserManagement";
import CommentManagement from "./Tabs/CommentManagement";

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState(0);

  const handleTabChange = (index: number) => {
    setActiveTab(index);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="fixed top-0 left-0 w-64 h-full bg-gray-200 p-5 shadow-md">
        <h2 className="text-center text-xl font-bold mb-4">Admin Dashboard</h2>
        <hr className="mb-4" />
        <ul>
          <li
            className={`cursor-pointer p-3 rounded ${
              activeTab === 0 ? "bg-gray-300" : "hover:bg-gray-100"
            }`}
            onClick={() => handleTabChange(0)}
          >
            Quản lý bài đăng
          </li>
          <li
            className={`cursor-pointer p-3 rounded ${
              activeTab === 1 ? "bg-gray-300" : "hover:bg-gray-100"
            }`}
            onClick={() => handleTabChange(1)}
          >
            Quản lý người dùng
          </li>
          <li
            className={`cursor-pointer p-3 rounded ${
              activeTab === 2 ? "bg-gray-300" : "hover:bg-gray-100"
            }`}
            onClick={() => handleTabChange(2)}
          >
            Quản lý bình luận
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 p-5 overflow-y-auto">
        {activeTab === 0 && <PostManagement />}
        {activeTab === 1 && <UserManagement />}
        {activeTab === 2 && <CommentManagement />}
      </div>
    </div>
  );
};

export default AdminPage;
