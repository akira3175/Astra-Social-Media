import axios from "axios";

const API_URL = "http://localhost:8080/api/friends";

export const friendshipService = {
  // Gửi yêu cầu kết bạn
  sendFriendRequest: async (userId1: number, userId2: number) => {
    const token = localStorage.getItem("accessToken");
    console.log("Sending friend request with token:", token);
    console.log("Request params:", { userId1, userId2 });

    return axios.post(`${API_URL}/request`, null, {
      params: { userId1, userId2 },
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Chấp nhận yêu cầu kết bạn
  acceptFriendRequest: async (friendshipId: number) => {
    const token = localStorage.getItem("accessToken");
    return axios.post(`${API_URL}/accept/${friendshipId}`, null, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Từ chối yêu cầu kết bạn
  rejectFriendRequest: async (friendshipId: number) => {
    const token = localStorage.getItem("accessToken");
    return axios.post(`${API_URL}/reject/${friendshipId}`, null, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Lấy danh sách yêu cầu kết bạn đang chờ
  getPendingFriendRequests: async (userId: number) => {
    const token = localStorage.getItem("accessToken");
    return axios.get(`${API_URL}/pending/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Lấy danh sách bạn bè
  getFriends: async (userId: number) => {
    const token = localStorage.getItem("accessToken");
    return axios.get(`${API_URL}/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
