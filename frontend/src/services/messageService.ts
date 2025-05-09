import { api } from '../configs/api';
import { Message } from '../types/message';
import { User } from '../types/user';

class MessageService {
    async getMessages(receiverId: number, limit: number = 20): Promise<Message[]> {
        try {
            const response = await api.get(`/chat/messages/${receiverId}`, {
                params: { limit }
            });
            return response.data;
        } catch (error) {
            console.error('Error getting messages:', error);
            throw error;
        }
    }

    async uploadFile(file: File): Promise<string> {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post('/chat/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            return response.data.data.fileUrl;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    }

    async getChatUsers(): Promise<User[]> {
        try {
            const response = await api.get(`/chat/users/`);
            return response.data;
        } catch (error) {
            console.error('Error getting chat users:', error);
            throw error;
        }
    }

    async getUnreadCount(userId: string): Promise<number> {
        try {
            const response = await api.get(`/chat/unread/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error getting unread count:', error);
            throw error;
        }
    }

    async markAsRead(messageId: number): Promise<void> {
        try {
            await api.post(`/chat/read/${messageId}`);
        } catch (error) {
            console.error('Error marking message as read:', error);
            throw error;
        }
    }

    async markAllAsRead(userId: string, senderId: string): Promise<void> {
        try {
            await api.post(`/chat/read-all/${userId}/${senderId}`);
        } catch (error) {
            console.error('Error marking all messages as read:', error);
            throw error;
        }
    }

    async downloadFile(fileUrl: string): Promise<Blob> {
        try {
            const response = await api.get(`/chat/download`, {
                params: { fileUrl },
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error('Error downloading file:', error);
            throw error;
        }
    }
}

export default new MessageService();