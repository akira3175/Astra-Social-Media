import axios from "axios";
import { api } from "../configs/api";
import { Friendship } from "../types/friendship";
import { User } from "../types/user";

interface FriendshipStatus {
  status: string;
  friendshipId: number | null;
}

class FriendshipService {
  // Gửi lời mời kết bạn
  async sendFriendRequest(email: string): Promise<Friendship> {
    try {
      const response = await api.post(`/friendships/request`, {
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

  // Hủy lời mời kết bạn đã gửi
  async cancelFriendRequest(email: string): Promise<void> {
    try {
      await api.delete(`/friendships/request`, {
        data: { receiverEmail: email }
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          localStorage.removeItem("accessToken");
          throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        }
        throw new Error(
          error.response?.data?.message || "Không thể hủy lời mời kết bạn"
        );
      }
      throw new Error("Đã xảy ra lỗi khi hủy lời mời kết bạn");
    }
  }

  // Chấp nhận lời mời kết bạn
  async acceptFriendRequest(friendshipId: number): Promise<Friendship> {
    try {
      const response = await api.post(`/friendships/accept/${friendshipId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          localStorage.removeItem("accessToken");
          throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        }
        throw new Error(
          error.response?.data?.message || "Không thể chấp nhận lời mời kết bạn"
        );
      }
      throw new Error("Đã xảy ra lỗi khi chấp nhận lời mời kết bạn");
    }
  }

  // Từ chối lời mời kết bạn
  async rejectFriendRequest(friendshipId: number): Promise<Friendship> {
    try {
      const response = await api.post(`/friendships/reject/${friendshipId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          localStorage.removeItem("accessToken");
          throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        }
        throw new Error(
          error.response?.data?.message || "Không thể từ chối lời mời kết bạn"
        );
      }
      throw new Error("Đã xảy ra lỗi khi từ chối lời mời kết bạn");
    }
  }

  // Chặn người dùng
  async blockUser(userId: number): Promise<Friendship> {
    try {
      const response = await api.post(`/friendships/block/${userId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          localStorage.removeItem("accessToken");
          throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        }
        throw new Error(
          error.response?.data?.message || "Không thể chặn người dùng"
        );
      }
      throw new Error("Đã xảy ra lỗi khi chặn người dùng");
    }
  }

  // Bỏ chặn người dùng
  async unblockUser(userId: number): Promise<void> {
    try {
      await api.post(`/friendships/unblock/${userId}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          localStorage.removeItem("accessToken");
          throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        }
        throw new Error(
          error.response?.data?.message || "Không thể bỏ chặn người dùng"
        );
      }
      throw new Error("Đã xảy ra lỗi khi bỏ chặn người dùng");
    }
  }

  // Lấy danh sách lời mời kết bạn đã nhận
  async getPendingFriendRequests(): Promise<Friendship[]> {
    try {
      const response = await api.get(`/friendships/pending`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          localStorage.removeItem("accessToken");
          throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        }
        throw new Error(
          error.response?.data?.message || "Không thể lấy danh sách lời mời kết bạn"
        );
      }
      throw new Error("Đã xảy ra lỗi khi lấy danh sách lời mời kết bạn");
    }
  }

  // Lấy danh sách lời mời kết bạn đã gửi
  async getSentFriendRequests(): Promise<Friendship[]> {
    try {
      const response = await api.get(`/friendships/sent`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          localStorage.removeItem("accessToken");
          throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        }
        throw new Error(
          error.response?.data?.message || "Không thể lấy danh sách lời mời đã gửi"
        );
      }
      throw new Error("Đã xảy ra lỗi khi lấy danh sách lời mời đã gửi");
    }
  }

  // Lấy danh sách bạn bè
  async getFriends(): Promise<Friendship[]> {
    try {
      const response = await api.get(`/friendships/friends`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          localStorage.removeItem("accessToken");
          throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        }
        throw new Error(
          error.response?.data?.message || "Không thể lấy danh sách bạn bè"
        );
      }
      throw new Error("Đã xảy ra lỗi khi lấy danh sách bạn bè");
    }
  }

  // Lấy danh sách người dùng đã chặn
  async getBlockedUsers(): Promise<Friendship[]> {
    try {
      const response = await api.get(`/friendships/blocked`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          localStorage.removeItem("accessToken");
          throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        }
        throw new Error(
          error.response?.data?.message || "Không thể lấy danh sách người dùng đã chặn"
        );
      }
      throw new Error("Đã xảy ra lỗi khi lấy danh sách người dùng đã chặn");
    }
  }

  // Lấy danh sách gợi ý kết bạn
  async getFriendSuggestions(): Promise<User[]> {
    try {
      const response = await api.get(`/friendships/suggestions`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          localStorage.removeItem("accessToken");
          throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        }
        throw new Error(
          error.response?.data?.message || "Không thể lấy danh sách gợi ý kết bạn"
        );
      }
      throw new Error("Đã xảy ra lỗi khi lấy danh sách gợi ý kết bạn");
    }
  }

  // Kiểm tra trạng thái kết bạn với một người dùng khác
  async getFriendshipStatus(userId: number): Promise<FriendshipStatus> {
    try {
      const response = await api.get(`/friendships/status/${userId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          localStorage.removeItem("accessToken");
          throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        }
        throw new Error(
          error.response?.data?.message || "Không thể kiểm tra trạng thái kết bạn"
        );
      }
      throw new Error("Đã xảy ra lỗi khi kiểm tra trạng thái kết bạn");
    }
  }

  // Hủy kết bạn
  async removeFriend(friendshipId: number): Promise<void> {
    try {
      await api.delete(`/friendships/${friendshipId}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          localStorage.removeItem("accessToken");
          throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        }
        throw new Error(
          error.response?.data?.message || "Không thể hủy kết bạn"
        );
      }
      throw new Error("Đã xảy ra lỗi khi hủy kết bạn");
    }
  }

  // Kiểm tra xem có phải bạn bè hay không
  async areFriends(otherUserId: number): Promise<boolean> {
    try {
      const status = await this.getFriendshipStatus(otherUserId);
      return status.status === 'ACCEPTED';
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem("accessToken");
        throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
      }
      return false;
    }
  }
}

export default new FriendshipService();