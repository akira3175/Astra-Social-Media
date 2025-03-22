import axios from "axios";
import { User } from "../types/user"

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Thêm interceptor để tự động gán accessToken vào request
api.interceptors.request.use(
  (config) => {
    const token = tokenService.getAccessToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Biến kiểm soát refresh token
let isRefreshing = false;
let failedQueue: any[] = [];

// Xử lý hàng đợi khi refresh token xong
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// Hàm refresh token
export const refreshToken = async () => {
  const refreshToken = tokenService.getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token available");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout 5s

  try {
    const response = await api.post(
      `users/refresh/`,
      { refresh: refreshToken },
      { signal: controller.signal } // Truyền signal vào request
    );

    clearTimeout(timeoutId); // Xóa timeout nếu request thành công

    if (response.status !== 200) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    const { access } = response.data;
    tokenService.setAccessToken(access);
    tokenService.setAuthToken(access);
    return access;
  } catch (error) {
    if (axios.isAxiosError(error) && error.message === "canceled") {
      throw new Error("Network timeout");
    }
    handleAuthError();
    throw error;
  }
};

// Interceptor xử lý lỗi 401 và tự động refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const newAccessToken = await refreshToken();
      processQueue(null, newAccessToken);
      originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      if (
        refreshError instanceof Error &&
        refreshError.message.includes("Refresh token has expired")
      ) {
        handleAuthError();
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// Hàm xử lý lỗi xác thực
export const handleAuthError = () => {
  tokenService.removeAccessToken();
  tokenService.removeRefreshToken();
  tokenService.setAuthToken("");

  alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
  window.location.href = "/login"; // Chuyển hướng về trang đăng nhập
};

export const tokenService = {
    getAccessToken: () => localStorage.getItem("accessToken"),
    getRefreshToken: () => localStorage.getItem("refreshToken"),
    setAccessToken: (token: string) => localStorage.setItem("accessToken", token),
    setRefreshToken: (token: string) => localStorage.setItem("refreshToken", token),
    removeAccessToken: () => localStorage.removeItem("accessToken"),
    removeRefreshToken: () => localStorage.removeItem("refreshToken"),
    setAuthToken: (token: string) => {
      if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      else delete axios.defaults.headers.common["Authorization"]
    },
};

export const login = async (email: string, password: string) => {
    try {
      const response = await api.post(`/users/login`, { email, password })
      const { accessToken, refreshToken } = response.data
  
      console.log(response.data)
      // Save tokens to localStorage
      tokenService.setAccessToken(accessToken)
      tokenService.setRefreshToken(refreshToken)
  
      // Update Authorization header
      tokenService.setAuthToken(accessToken)
      return { accessToken, refreshToken }
    } catch (error) {
      throw new Error("Invalid username or password")
    }
}

export const isAuthenticated = () => tokenService.getAccessToken() !== null;

export const getCurrentUser = async (): Promise<User> => {
  try {
    const token = tokenService.getAccessToken()
    if (!token) throw new Error("No access token available")

    tokenService.setAuthToken(token)
    const response = await api.get(`/users/info`)
    return response.data
  } catch (error: unknown) {
    throw new Error("An unknown error occurred")
  }
}