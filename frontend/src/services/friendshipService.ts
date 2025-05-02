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
        data: { receiverEmail: email },
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
          error.response?.data?.message ||
            "Không thể lấy danh sách lời mời kết bạn"
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
          error.response?.data?.message ||
            "Không thể lấy danh sách lời mời đã gửi"
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
          error.response?.data?.message ||
            "Không thể lấy danh sách người dùng đã chặn"
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
          error.response?.data?.message ||
            "Không thể lấy danh sách gợi ý kết bạn"
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
          error.response?.data?.message ||
            "Không thể kiểm tra trạng thái kết bạn"
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
      return status.status === "ACCEPTED";
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem("accessToken");
        throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
      }
      return false;
    }
  }

  // Lấy danh sách bạn bè theo email
  async getFriendsByEmail(email: string): Promise<Friendship[]> {
    try {
      // Đầu tiên lấy userId từ email
      const userResponse = await api.get(
        `/users/email/${encodeURIComponent(email)}`
      );
      const userId = userResponse.data.id;
      console.log("User ID from email:", userId); // Debug log

      // Lấy danh sách bạn bè theo userId với status ACCEPTED
      const response = await api.get(
        `/friendships/user/${userId}/friends?status=ACCEPTED`
      );
      console.log("Friends API response:", response.data); // Debug log

      // Lọc và map lại dữ liệu để lấy thông tin người bạn
      const friends = response.data.map((friendship: Friendship) => {
        // Nếu user trong friendship là người đang xem, lấy người còn lại
        if (friendship.user.id === userId) {
          // Lấy ID của người bạn từ friendship
          const friendId = friendship.receiver.id;
          // Gọi API để lấy thông tin người bạn
          return api.get(`/users/${friendId}`).then((friendResponse) => ({
            ...friendship,
            user: friendResponse.data,
          }));
        }
        return Promise.resolve(friendship);
      });

      // Đợi tất cả các promise hoàn thành
      return Promise.all(friends);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          localStorage.removeItem("accessToken");
          throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        }
        if (error.response?.status === 404) {
          throw new Error("Không tìm thấy người dùng");
        }
        throw new Error(
          error.response?.data?.message || "Không thể lấy danh sách bạn bè"
        );
      }
      throw new Error("Đã xảy ra lỗi khi lấy danh sách bạn bè");
    }
  }

  // Lấy danh sách bạn bè theo userId
  async getFriendsByUserId(userId: number): Promise<Friendship[]> {
    try {
      // Thêm tham số status để chỉ lấy bạn bè đã chấp nhận
      const response = await api.get(
        `/friendships/user/${userId}/friends?status=ACCEPTED`
      );
      console.log("Friends API response:", response.data); // Debug log

      // Lọc và map lại dữ liệu để lấy thông tin người bạn
      const friends = response.data.map((friendship: Friendship) => {
        console.log("Processing friendship:", friendship); // Debug log

        // Kiểm tra xem friendship có requester và receiver không
        const friendId =
          friendship.requester?.id === userId
            ? friendship.receiver?.id
            : friendship.requester?.id;

        if (!friendId) {
          console.error(
            "Không tìm thấy ID người bạn trong friendship:",
            friendship
          );
          return Promise.resolve(friendship);
        }

        console.log("Getting friend info for ID:", friendId); // Debug log
        // Gọi API để lấy thông tin người bạn
        return api.get(`/users/${friendId}`).then((friendResponse) => {
          console.log("Friend info response:", friendResponse.data); // Debug log
          return {
            ...friendship,
            user: friendResponse.data,
          };
        });
      });

      // Đợi tất cả các promise hoàn thành
      return Promise.all(friends);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          localStorage.removeItem("accessToken");
          throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        }
        if (error.response?.status === 404) {
          throw new Error("Không tìm thấy người dùng");
        }
        throw new Error(
          error.response?.data?.message || "Không thể lấy danh sách bạn bè"
        );
      }
      throw new Error("Đã xảy ra lỗi khi lấy danh sách bạn bè");
    }
  }
}

export default new FriendshipService();
