import { api } from "../configs/api";

class UserService {
    async searchUsers(keyword: string, isStaff: boolean, isActive: boolean, page: number, size: number) {
        try {
            const response = await api.get(`/users/search?keyword=${keyword}&isStaff=${isStaff}&isActive=${isActive}&page=${page}&size=${size}`);
            return response.data.content;
        } catch (error) {
            console.error("Error searching users:", error);
            throw error;
        }
    }
}

export default new UserService();

