import axios from "axios";
import { api } from "../configs/api";

class FriendshipService {
  // Gửi lời mời kết bạn
  async sendFriendRequest(email: string) {
    try {
      const response = await api.post(
        `/friends/request`,
        {
          receiverEmail: email,
        }
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

  async cancelFriendRequest(email: string) {
    try {
      const response = await api.delete(`/friends/request`, {
        data: {
          receiverEmail: email,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Chấp nhận lời mời kết bạn
  async acceptFriendRequest(friendshipId: number) {
    try {
      const response = await api.post(
        `/friends/accept/${friendshipId}`,
        null,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Từ chối lời mời kết bạn
  async rejectFriendRequest(friendshipId: number) {
    try {
      const response = await api.post(
        `/friends/reject/${friendshipId}`,
        null,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Xóa bạn bè (unfriend)
  async unfriend(friendshipId: number) {
    try {
      const response = await api.put(
        `/friends/${friendshipId}/active`,
        null,
        {
          params: { active: false },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Lấy danh sách lời mời kết bạn đang chờ
  async getPendingRequests(userId: number) {
    try {
      const response = await api.get(`/friends/pending/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Lấy danh sách bạn bè
  async getFriends(userId: number) {
    try {
      const response = await api.get(`/friendships/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Thêm bạn bè
  async addFriend(userId1: number, userId2: number) {
    try {
      const response = await api.post(
        `/friendships/${userId1}/${userId2}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Xóa bạn bè
  async removeFriend(userId1: number, userId2: number) {
    try {
      await api.delete(`/friendships/${userId1}/${userId2}`);
    } catch (error) {
      throw error;
    }
  }

  // Kiểm tra xem hai người có phải là bạn bè không
  async areFriends(userId1: number, userId2: number) {
    try {
      const response = await api.get(
        `/friendships/check/${userId1}/${userId2}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Lấy danh sách người dùng gợi ý kết bạn
  async getSuggestedUsers(userId: number) {
    try {
      const response = await api.get(`/friendships/suggestions/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Lấy danh sách lời mời kết bạn đã gửi
  async getSentRequests(userId: number) {
    try {
      const response = await api.get(`/friends/sent/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new FriendshipService();
