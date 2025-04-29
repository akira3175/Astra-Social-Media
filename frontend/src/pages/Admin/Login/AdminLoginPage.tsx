import React, { useState } from "react";
import { adminLogin } from "../../../services/adminService";

const AdminLoginPage: React.FC = () => {
  const [email, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState("");

  const handleLogin = () => {
    adminLogin({ email, password });
  };

  return (
    <div className="flex items-center justify-center absolute top-0 w-screen left-0 min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 w-96">
        <h2 className="text-2xl font-bold text-center mb-6">Admin Login</h2>
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Tên đăng nhập
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Mật khẩu
          </label>
          <input
            type="password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
          onClick={handleLogin}
        >
          Đăng nhập
        </button>
      </div>
    </div>
  );
};

export default AdminLoginPage;
