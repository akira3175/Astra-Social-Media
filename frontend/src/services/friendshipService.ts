import { api } from "../configs/api";
import { tokenService } from "./tokenService";
import { refreshToken } from "./authService";
import axios from "axios";

const API_URL = "/friends";

export const friendshipService = {
  // Gửi yêu cầu kết bạn
  sendFriendRequest: async (userId1: number, userId2: number) => {
    const token = tokenService.getAccessToken();
    if (!token) {
      throw new Error("Không tìm thấy token xác thực");
    }

    console.log("Sending friend request with token:", token);
    console.log("Request params:", { userId1, userId2 });

    try {
      const response = await api.post(`${API_URL}/request`, null, {
        params: { userId1, userId2 },
      });
      return response;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        // Nếu token hết hạn (401), thử refresh token
        if (error.response?.status === 401) {
          try {
            console.log("Token expired, trying to refresh...");
            const newToken = await refreshToken();
            console.log("Got new token:", newToken);

            // Thử lại request với token mới
            const response = await api.post(`${API_URL}/request`, null, {
              params: { userId1, userId2 },
            });
            return response;
          } catch (refreshError: unknown) {
            console.error("Failed to refresh token:", refreshError);
            throw new Error(
              "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại"
            );
          }
        }

        if (error.response?.status === 403) {
          throw new Error("Bạn không có quyền thực hiện hành động này");
        }

        throw new Error(
          error.response?.data?.message ||
            "Có lỗi xảy ra khi gửi yêu cầu kết bạn"
        );
      }
      throw error;
    }
  },

  // Lấy danh sách lời mời kết bạn đã nhận
  getFriendRequests: async () => {
    try {
      const currentUser = JSON.parse(
        localStorage.getItem("currentUser") || "{}"
      );
      if (!currentUser.id) {
        throw new Error("Không tìm thấy thông tin người dùng");
      }
      const response = await api.get(`${API_URL}/requests/${currentUser.id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching friend requests:", error);
      throw new Error("Không thể lấy danh sách lời mời kết bạn");
    }
  },

  // Chấp nhận lời mời kết bạn
  acceptFriendRequest: async (friendshipId: number) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Không tìm thấy token xác thực");
      }

      console.log(
        "Calling accept friend request API with friendshipId:",
        friendshipId
      );
      console.log("Using token:", token);

      const response = await api.post(
        `${API_URL}/accept/${friendshipId}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Accept friend request response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error accepting friend request:", error);
      throw new Error("Không thể chấp nhận lời mời kết bạn");
    }
  },

  // Từ chối lời mời kết bạn
  rejectFriendRequest: async (friendshipId: number) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Không tìm thấy token xác thực");
      }

      console.log(
        "Calling reject friend request API with friendshipId:",
        friendshipId
      );
      console.log("Using token:", token);

      const response = await api.post(
        `${API_URL}/reject/${friendshipId}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Reject friend request response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      throw new Error("Không thể từ chối lời mời kết bạn");
    }
  },

  // Lấy danh sách bạn bè
  getFriends: async () => {
    try {
      const response = await api.get(`${API_URL}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching friends:", error);
      throw new Error("Không thể lấy danh sách bạn bè");
    }
  },

  // Lấy danh sách gợi ý kết bạn
  getFriendSuggestions: async () => {
    try {
      const response = await api.get(`${API_URL}/suggestions`);
      return response.data;
    } catch (error) {
      console.error("Error fetching friend suggestions:", error);
      throw new Error("Không thể lấy danh sách gợi ý kết bạn");
    }
  },
};
