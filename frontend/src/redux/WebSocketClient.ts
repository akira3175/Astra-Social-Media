import { tokenService } from '../services/tokenService';
import { Client, Frame } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// Định nghĩa kiểu cho message
interface WebSocketMessage {
  type: string;
  content: string;
}

class WebSocketClient {
  client: Client | null = null;
  dispatch: Function;

  constructor(dispatch: Function) {
    this.dispatch = dispatch;
  }

  // Kết nối đến WebSocket
  connect(onConnect: () => void, onMessage: (msg: string) => void, onError: (err: string) => void) {
    const token = tokenService.getAccessToken();
    if (!token) {
      console.error('❌ No token found');
      return;
    }

    // Tạo kết nối với WebSocket qua SockJS
    const socket = new SockJS(`http://localhost:8080/ws?token=${token}`);
    this.client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => console.log(str),
      reconnectDelay: 5000, // Thử lại kết nối sau 5 giây nếu bị mất kết nối
      onConnect: (frame: Frame) => {
        console.log('✅ Connected to WebSocket!');
        onConnect();  // Khi kết nối thành công, gọi onConnect
        // Đăng ký lắng nghe tin nhắn từ server
        this.client?.subscribe('/topic/public', (message) => {
          onMessage(message.body);  // Gửi tin nhắn về cho onMessage
        });
      },
      onStompError: (frame) => {
        console.error('❌ Broker reported error: ', frame.headers['message']);
        console.error('❌ Additional details: ', frame.body);
        onError(frame.body);  // Gửi lỗi cho callback onError
      },
    });

    // Kích hoạt kết nối STOMP
    this.client.activate();
  }

  // Phương thức gửi tin nhắn WebSocket
  sendMessage(message: WebSocketMessage) {
    if (this.client && this.client.connected) {
      const stompClient = this.client;
      stompClient.publish({ 
        destination: '/app/chat', // Điểm đến tin nhắn
        body: JSON.stringify(message), // Nội dung tin nhắn
      }); 
    }
  }

  // Phương thức ngắt kết nối
  disconnect() {
    if (this.client) {
      this.client.deactivate();  // Đóng kết nối STOMP
      console.log('❌ Disconnected from WebSocket');
    }
  }
}

export default WebSocketClient;
