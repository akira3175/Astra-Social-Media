import { useDispatch } from "react-redux";
import { useEffect } from "react";
import WebSocketClient from "../socket/WebSocketClient";
import { setConnectionStatus, setMessages, setError } from "../socket/webSocketSlice";

// Định nghĩa kiểu cho message
interface WebSocketMessage {
  type: string;
  content: string;
}

const useWebSocket = () => {
  const dispatch = useDispatch();
  const wsClient = new WebSocketClient(dispatch);

  useEffect(() => {
    // Mở kết nối khi component mount
    wsClient.connect(
      () => {
        dispatch(setConnectionStatus(true)); // Cập nhật trạng thái kết nối
      },
      (msg) => {
        dispatch(setMessages(msg)); // Cập nhật tin nhắn mới vào store
      },
      (err) => {
        dispatch(setError(err)); // Cập nhật lỗi vào store
      }
    );

    return () => {
      // Đảm bảo đóng kết nối khi component unmount
      wsClient.disconnect();
      dispatch(setConnectionStatus(false)); // Cập nhật trạng thái ngắt kết nối
    };
  }, [dispatch, wsClient]);

  return {
    sendMessage: (message: WebSocketMessage) => wsClient.sendMessage(message), // Định nghĩa kiểu cho message
  };
};

export default useWebSocket;
