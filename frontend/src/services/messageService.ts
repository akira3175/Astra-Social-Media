import axios from 'axios';
import { api } from '../configs/api';
import { ChatUser, Message } from '../types/message';

class MessageService {
    async getMessages(conversationId: number): Promise<Message[]> {
        const response = await api.get(`/messages/${conversationId}`);
        return response.data;
    }

    async sendMessage(conversationId: number, message: Message): Promise<Message> {
        const response = await api.post(`/messages/${conversationId}`, message);
        return response.data;
    }

    async getChatUsers(): Promise<ChatUser[]> {
        const response = await api.get('/chat/users');
        return response.data;
    }
}

export default new MessageService();