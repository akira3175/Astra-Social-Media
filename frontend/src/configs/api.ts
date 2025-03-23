import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse, type AxiosInstance } from "axios";
import { refreshToken, processQueue, failedQueue, handleAuthError } from "../services/authService";
import { tokenService } from "../services/tokenService";

const API_URL = import.meta.env.VITE_API_URL;

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 5000,
});

const apiNoAuth = axios.create({ baseURL: API_URL });


let isRefreshing = false;

// Request Interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenService.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const newAccessToken = await refreshToken();
      processQueue(null, newAccessToken);
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      }
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError as Error, null);
      handleAuthError();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export { api, apiNoAuth };
