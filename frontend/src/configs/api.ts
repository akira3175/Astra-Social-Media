import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { refreshToken, setAuthHeader } from "../services/authService";
import { tokenService } from "../services/tokenService";

const API_URL = import.meta.env.VITE_API_URL;

interface QueueItem {
  resolve: (value: string | PromiseLike<string>) => void;
  reject: (reason?: any) => void;
}

// Queue to hold failed requests while the token is being refreshed
export let failedQueue: QueueItem[] = [];

// Function to process the failed requests once the token is refreshed
export const processQueue = (error: Error | null, token: string | null = null): void => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token as string);
  });
  failedQueue = [];
};

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 5000,
});

const apiNoAuth = axios.create({ baseURL: API_URL });

let isRefreshing = false;

// Request Interceptor: Attach token to every request
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

// Response Interceptor: Handle token expiration and refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response, // If the response is successful, return it
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If the error status is not 401 or we have already retried this request, reject the request
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If token is being refreshed, queue the request and wait
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

    // Mark the request as having been retried
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const newAccessToken = await refreshToken();
      processQueue(null, newAccessToken);  // Pass the new token to the queue
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

// Handle authentication errors and log out the user
export const handleAuthError = (customHandler?: () => void): void => {
  tokenService.clear();
  setAuthHeader(null);

  if (typeof customHandler === "function") {
    customHandler();
  } else {
    // Redirect to login page by default
    window.location.href = "/login";
  }
};

export { api, apiNoAuth };
