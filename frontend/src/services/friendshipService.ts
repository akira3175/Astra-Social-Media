import axios from "axios";
import { getEmailFromToken } from "../utils/jwtUtils";

const API_URL = "http://localhost:8080/api";

class FriendshipService {
  private getAuthHeader() {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("Vui lòng đăng nhập lại");
    }
    return { Authorization: `Bearer ${token}` };
  }

  private getCurrentUserEmail(): string {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("No access token found");
    }

    const email = getEmailFromToken(token);
    if (!email) {
      throw new Error("Could not get email from token");
    }

    return email;
  }

  // Gửi lời mời kết bạn
  async sendFriendRequest(email: string) {
    try {
      const response = await axios.post(
        `${API_URL}/friends/request`,
        {
          receiverEmail: email,
        },
        { headers: this.getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          throw new Error("Bạn đã gửi lời mời kết bạn cho người này rồi");
        }
        if (error.response?.status === 401) {
          localStorage.removeItem("accessToken");
          throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        }
        throw new Error(
          error.response?.data?.message || "Không thể gửi lời mời kết bạn"
        );
      }
      throw new Error("Đã xảy ra lỗi khi gửi lời mời kết bạn");
    }
  }

  // Chấp nhận lời mời kết bạn
  async acceptFriendRequest(friendshipId: number) {
    try {
      const response = await axios.post(
        `${API_URL}/friends/accept/${friendshipId}`,
        null,
        { headers: this.getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          localStorage.removeItem("accessToken");
          throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        }
        throw new Error(
          error.response?.data || "Không thể chấp nhận lời mời kết bạn"
        );
      }
      throw error;
    }
  }

  // Từ chối lời mời kết bạn
  async rejectFriendRequest(friendshipId: number) {
    try {
      const response = await axios.post(
        `${API_URL}/friends/reject/${friendshipId}`,
        null,
        { headers: this.getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          localStorage.removeItem("accessToken");
          throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        }
        throw new Error(
          error.response?.data || "Không thể từ chối lời mời kết bạn"
        );
      }
      throw error;
    }
  }

  // Xóa bạn bè (unfriend)
  async unfriend(friendshipId: number) {
    try {
      const response = await axios.put(
        `${API_URL}/friends/${friendshipId}/active`,
        null,
        {
          headers: this.getAuthHeader(),
          params: { active: false },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          localStorage.removeItem("accessToken");
          throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        }
        throw new Error(error.response?.data || "Không thể xóa bạn bè");
      }
      throw error;
    }
  }

  // Lấy danh sách lời mời kết bạn đang chờ
  async getPendingRequests(userId: number) {
    try {
      const response = await axios.get(`${API_URL}/friends/pending/${userId}`, {
        headers: this.getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          localStorage.removeItem("accessToken");
          throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        }
        throw new Error(
          error.response?.data || "Không thể lấy danh sách lời mời kết bạn"
        );
      }
      throw error;
    }
  }

  // Lấy danh sách bạn bè
  async getFriends(userId: number) {
    try {
      const response = await axios.get(`${API_URL}/friendships/${userId}`, {
        headers: this.getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          localStorage.removeItem("accessToken");
          throw new Error("Vui lòng đăng nhập lại");
        }
        throw new Error(
          error.response?.data?.message || "Lỗi khi lấy danh sách bạn bè"
        );
      }
      throw error;
    }
  }

  // Thêm bạn bè
  async addFriend(userId1: number, userId2: number) {
    try {
      const response = await axios.post(
        `${API_URL}/friendships/${userId1}/${userId2}`,
        {},
        { headers: this.getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          localStorage.removeItem("accessToken");
          throw new Error("Vui lòng đăng nhập lại");
        }
        throw new Error(error.response?.data?.message || "Lỗi khi thêm bạn bè");
      }
      throw error;
    }
  }

  // Xóa bạn bè
  async removeFriend(userId1: number, userId2: number) {
    try {
      await axios.delete(`${API_URL}/friendships/${userId1}/${userId2}`, {
        headers: this.getAuthHeader(),
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          localStorage.removeItem("accessToken");
          throw new Error("Vui lòng đăng nhập lại");
        }
        throw new Error(error.response?.data?.message || "Lỗi khi xóa bạn bè");
      }
      throw error;
    }
  }

  // Kiểm tra xem hai người có phải là bạn bè không
  async areFriends(userId1: number, userId2: number) {
    try {
      const response = await axios.get(
        `${API_URL}/friendships/check/${userId1}/${userId2}`,
        { headers: this.getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          localStorage.removeItem("accessToken");
          throw new Error("Vui lòng đăng nhập lại");
        }
        throw new Error(
          error.response?.data?.message || "Lỗi khi kiểm tra bạn bè"
        );
      }
      throw error;
    }
  }

  // Lấy danh sách người dùng gợi ý kết bạn
  async getSuggestedUsers(userId: number) {
    try {
      const response = await axios.get(
        `${API_URL}/friendships/suggestions/${userId}`,
        {
          headers: this.getAuthHeader(),
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error(
            "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
          );
        }
        throw new Error(
          error.response?.data?.message ||
            "Không thể lấy danh sách gợi ý kết bạn"
        );
      }
      throw new Error("Đã xảy ra lỗi khi lấy danh sách gợi ý kết bạn");
    }
  }

  // Lấy danh sách lời mời kết bạn đã gửi
  async getSentRequests(userId: number) {
    try {
      const response = await axios.get(`${API_URL}/friends/sent/${userId}`, {
        headers: this.getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          localStorage.removeItem("accessToken");
          throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        }
        throw new Error(
          error.response?.data || "Không thể lấy danh sách lời mời đã gửi"
        );
      }
      throw error;
    }
  }
}

export default new FriendshipService();
