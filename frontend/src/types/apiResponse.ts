// Định nghĩa cấu trúc chung cho các response từ API backend
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  timestamp: number;
}
