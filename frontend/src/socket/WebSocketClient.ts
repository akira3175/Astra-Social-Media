import { tokenService } from '../services/tokenService';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// Định nghĩa kiểu cho tin nhắn
export interface WebSocketMessage {
  type: string;
  content: string;
  [key: string]: any; // Cho phép thêm các trường tùy chọn khác
}

// Định nghĩa kiểu cho các callback
type OnConnectCallback = () => void;
type OnMessageCallback = (msg: any) => void;
type OnErrorCallback = (err: string) => void;

class WebSocketClient {
  private client: Client | null = null;
  private subscriptions: { [topic: string]: any } = {};
  private dispatch: Function;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  constructor(dispatch: Function) {
    this.dispatch = dispatch;
    void this.dispatch;
  }

  /**
   * Kết nối đến WebSocket server
   */
  connect(
    onConnect: OnConnectCallback,
    onMessage: OnMessageCallback,
    onError: OnErrorCallback
  ): void {
    const token = tokenService.getAccessToken();
    if (!token) {
      onError('Không tìm thấy token xác thực');
      return;
    }

    try {
      // Lấy URL từ biến môi trường
      const baseSocketUrl = import.meta.env.VITE_WEBSOCKET_URL;
      if (!baseSocketUrl) {
        onError('URL WebSocket chưa được cấu hình');
        return;
      }

      // Tạo kết nối SockJS
      const socket = new SockJS(`${baseSocketUrl}?token=${token}`);

      // Xử lý lỗi SockJS
      socket.onerror = () => {
        onError('Lỗi kết nối SockJS');
      };

      // Cấu hình STOMP client
      this.client = new Client({
        webSocketFactory: () => socket,
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,

        // Xử lý khi kết nối thành công
        onConnect: () => {
          this.reconnectAttempts = 0; // Reset số lần thử kết nối lại
          onConnect();

          // Đăng ký kênh chung
          this.subscribe('/topic/public', onMessage);

          // Đăng ký kênh cá nhân (nếu cần)
          const userId = this.getUserIdFromToken(token);
          if (userId) {
            this.subscribe(`/user/${userId}/queue/messages`, onMessage);
            this.subscribe(`/user/queue/notifications`, onMessage);
            this.subscribe(`/user/queue/friend-status`, onMessage);
            this.subscribe(`/user/queue/all-users-status`, onMessage);
          }
        },

        // Xử lý lỗi STOMP
        onStompError: (frame) => {
          console.error('Additional details:', frame.body);
          onError(frame.headers['message'] || 'Lỗi kết nối STOMP');
        },

        // Xử lý khi mất kết nối
        onWebSocketClose: () => {
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            onError('Không thể kết nối lại sau nhiều lần thử');
          }
          this.reconnectAttempts++;
        }
      });

      // Kích hoạt kết nối
      this.client.activate();

    } catch (error) {
      onError('Lỗi khởi tạo kết nối WebSocket');
    }
  }

  /**
   * Đăng ký lắng nghe một kênh nhất định
   */
  subscribe(topic: string, callback: OnMessageCallback): void {
    if (!this.client || !this.client.connected) {
      console.warn('⚠️ Cannot subscribe, client not connected');
      return;
    }

    if (!this.subscriptions[topic]) {
      this.subscriptions[topic] = this.client.subscribe(topic, (message) => {
        try {
          const parsedMessage = JSON.parse(message.body);
          callback(parsedMessage);
        } catch (e) {
          console.warn('⚠️ Failed to parse message:', message.body);
          callback(message.body);
        }
      });
    }
  }

  /**
   * Hủy đăng ký một kênh
   */
  unsubscribe(topic: string): void {
    if (this.subscriptions[topic]) {
      this.subscriptions[topic].unsubscribe();
      delete this.subscriptions[topic];
    }
  }

  /**
   * Gửi tin nhắn đến server
   */
  sendMessage(message: WebSocketMessage, destination: string = '/app/chat'): boolean {
    if (!this.client || !this.client.connected) {
      console.warn('⚠️ Cannot send message, client not connected');
      return false;
    }

    try {
      this.client.publish({
        destination: destination,
        body: JSON.stringify(message),
        headers: { 'content-type': 'application/json' }
      });
      return true;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      return false;
    }
  }

  /**
   * Ngắt kết nối WebSocket
   */
  disconnect(): void {
    // Hủy tất cả các subscription
    Object.keys(this.subscriptions).forEach(topic => {
      this.unsubscribe(topic);
    });

    // Đóng kết nối STOMP
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
  }

  /**
   * Kiểm tra trạng thái kết nối
   */
  isConnected(): boolean {
    return this.client !== null && this.client.connected;
  }

  /**
   * Trích xuất userId từ JWT token (nếu cần)
   */
  private getUserIdFromToken(token: string): string | null {
    try {
      // Giải mã JWT token để lấy userId (code tham khảo)
      // Lưu ý: Đây là cách đơn giản, trong sản phẩm thực tế nên sử dụng thư viện JWT
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.sub || decoded.userId || null;
    } catch {
      return null;
    }
  }
}

export default WebSocketClient;