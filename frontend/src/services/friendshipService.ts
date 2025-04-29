import axios from "axios";
import { api } from "../configs/api";
import { useCurrentUser } from "../contexts/currentUserContext";

class FriendshipService {
  // Gửi lời mời kết bạn
  async sendFriendRequest(email: string) {
    try {
      const response = await api.post(`/friends/request`, {
        receiverEmail: email,
      });
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

  // Hủy lời mời kết bạn
  async cancelFriendRequest(email: string) {
    try {
      const response = await api.delete(`/friends/request`, {
        data: {
          receiverEmail: email,
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Không thể hủy lời mời kết bạn"
        );
      }
      throw new Error("Đã xảy ra lỗi khi hủy lời mời kết bạn");
    }
  }

  // Chấp nhận lời mời kết bạn
  async acceptFriendRequest(friendshipId: number) {
    try {
      const response = await api.post(`/friends/accept/${friendshipId}`, null, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data.status === 200) {
        return response.data.data;
      }

      throw new Error(
        response.data.message || "Không thể chấp nhận lời mời kết bạn"
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error("Không tìm thấy lời mời kết bạn");
        }
        if (error.response?.status === 401) {
          localStorage.removeItem("accessToken");
          throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        }
        if (error.response?.status === 400) {
          throw new Error("Lời mời kết bạn không hợp lệ hoặc đã bị hủy");
        }
        if (error.response?.status === 403) {
          throw new Error("Bạn không có quyền thực hiện thao tác này");
        }
        throw new Error(
          error.response?.data?.message || "Không thể chấp nhận lời mời kết bạn"
        );
      }
      throw new Error("Đã xảy ra lỗi khi chấp nhận lời mời kết bạn");
    }
  }

  // Từ chối lời mời kết bạn
  async rejectFriendRequest(friendshipId: number, currentUserId: number) {
    try {
      // Lấy danh sách lời mời đã gửi
      const sentRequests = await this.getSentRequests(currentUserId);
      const request = sentRequests.find(
        (r: { id: number; receiver: { email: string } }) =>
          r.id === friendshipId
      );

      if (!request) {
        throw new Error("Không tìm thấy lời mời kết bạn");
      }

      const response = await api.delete(`/friends/request`, {
        data: {
          receiverEmail: request.receiver.email,
        },
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error("Không tìm thấy lời mời kết bạn");
        }
        if (error.response?.status === 401) {
          localStorage.removeItem("accessToken");
          throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        }
        if (error.response?.status === 400) {
          throw new Error("Lời mời kết bạn không hợp lệ hoặc đã bị hủy");
        }
        if (error.response?.status === 403) {
          throw new Error("Bạn không có quyền thực hiện thao tác này");
        }
        throw new Error(
          error.response?.data?.message || "Không thể từ chối lời mời kết bạn"
        );
      }
      throw new Error("Đã xảy ra lỗi khi từ chối lời mời kết bạn");
    }
  }

  // Xóa bạn bè (unfriend)
  async unfriend(friendshipId: number) {
    try {
      const response = await api.put(`/friends/${friendshipId}/active`, null, {
        params: { active: false },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Không thể xóa bạn bè"
        );
      }
      throw new Error("Đã xảy ra lỗi khi xóa bạn bè");
    }
  }

  // Lấy danh sách lời mời kết bạn đang chờ
  async getPendingRequests(userId: number) {
    try {
      const response = await api.get(`/friends/pending/${userId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message ||
            "Không thể tải danh sách lời mời đang chờ"
        );
      }
      throw new Error("Đã xảy ra lỗi khi tải danh sách lời mời đang chờ");
    }
  }

  // Lấy danh sách bạn bè
  async getFriends(userId: number) {
    try {
      const response = await api.get(`/friendships/${userId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Không thể tải danh sách bạn bè"
        );
      }
      throw new Error("Đã xảy ra lỗi khi tải danh sách bạn bè");
    }
  }

  // Thêm bạn bè
  async addFriend(userId1: number, userId2: number) {
    try {
      const response = await api.post(`/friendships/${userId1}/${userId2}`);
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
        `/friendships/check/${userId1}/${userId2}`
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
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message ||
            "Không thể tải danh sách gợi ý kết bạn"
        );
      }
      throw new Error("Đã xảy ra lỗi khi tải danh sách gợi ý kết bạn");
    }
  }

  // Lấy danh sách lời mời kết bạn đã gửi
  async getSentRequests(userId: number) {
    try {
      const response = await api.get(`/friends/sent/${userId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message ||
            "Không thể tải danh sách lời mời đã gửi"
        );
      }
      throw new Error("Đã xảy ra lỗi khi tải danh sách lời mời đã gửi");
    }
  }
}

export default new FriendshipService();
