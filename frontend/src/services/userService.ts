import axios from "axios";

const API_URL = "http://localhost:8080/api/users";

export const userService = {
  // Lấy danh sách người dùng gợi ý
  getSuggestedUsers: async (currentUserId: number) => {
    const token = localStorage.getItem("accessToken");
    return axios.get(`${API_URL}/suggestions`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { currentUserId },
    });
  },

  // Lấy thông tin người dùng theo ID
  getUserById: async (userId: number) => {
    const token = localStorage.getItem("accessToken");
    return axios.get(`${API_URL}/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
