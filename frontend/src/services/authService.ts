import axios, { type AxiosResponse } from "axios"
import type { User } from "../types/user"
import { tokenService } from "./tokenService"
import { api, apiNoAuth } from "../configs/api"
import { createApiWithTimeout } from "../utils/apiUtil"
import type { RegisterData } from "../types/user"

// Types
interface TokenPair {
  accessToken: string 
  refreshToken: string
}

interface QueueItem {
  resolve: (value: string | PromiseLike<string>) => void
  reject: (reason?: any) => void
}

interface RefreshResponse {
  accessToken: string 
}

// Constants
const ENDPOINTS = {
  LOGIN: "/users/login",
  REFRESH: "/users/refresh",
  USER_INFO: "/users/info",
  USER_INFO_BY_EMAIL: "/users/",
  UPDATE_USER_INFO: "/users/update",
  REGISTER: "/users/register",
  CHECK_EMAIL_EXISTS: "/users/check-email",
  CHANGE_PASSWORD: "/users/change-password"
}

// Authentication Functions
export const setAuthHeader = (token: string | null): void => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common["Authorization"]
  }
}

export const handleAuthError = (customHandler?: () => void): void => {
  tokenService.clear()
  setAuthHeader(null)

  if (typeof customHandler === "function") {
    customHandler()
  } else {
    // Default behavior - redirect to login
    window.location.href = "/login"
  }
}

// Refresh token management
export let failedQueue: QueueItem[] = []

export const processQueue = (error: Error | null, token: string | null = null): void => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(token as string)
  })
  failedQueue = []
}

export const refreshToken = async (): Promise<string> => {
  const refreshToken = tokenService.getRefreshToken()
  if (!refreshToken) {
    throw new Error("No refresh token available")
  }

  const { signal, clearTimeout: clearTimeoutFn } = createApiWithTimeout()

  try {
    const response: AxiosResponse<RefreshResponse> = await apiNoAuth.post(
      ENDPOINTS.REFRESH,
      { refreshToken }, 
      { signal,
        withCredentials: true,
        headers: { Authorization: undefined },
       },
    )

    clearTimeoutFn()

    if (response.status !== 200) {
      throw new Error(`Server responded with status ${response.status}`)
    }

    const { accessToken } = response.data 
    tokenService.setAccessToken(accessToken)
    setAuthHeader(accessToken)
    return accessToken
  } catch (error) {
    if (axios.isAxiosError(error) && error.message === "canceled") {
      throw new Error("Network timeout during token refresh")
    }
    throw error
  }
}

// Authentication API
export const login = async (email: string, password: string): Promise<TokenPair> => {
  try {
    const response: AxiosResponse<TokenPair> = await api.post(ENDPOINTS.LOGIN, { email, password })
    const { accessToken, refreshToken } = response.data

    tokenService.setAccessToken(accessToken)
    tokenService.setRefreshToken(refreshToken)
    setAuthHeader(accessToken)

    return { accessToken, refreshToken }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || "Invalid username or password"
      throw new Error(errorMessage)
    }
    throw new Error("Login failed. Please try again.")
  }
}

export const logout = (redirectPath = "/login"): void => {
  tokenService.clear()
  setAuthHeader(null)
  window.location.href = redirectPath
}

export const register = async (registerData: RegisterData): Promise<TokenPair> => {
  try {
    const response: AxiosResponse<TokenPair> = await api.post(ENDPOINTS.REGISTER, registerData)

    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || "Registration failed"
      throw new Error(errorMessage)
    }
    throw new Error("Registration failed. Please try again.")
  }
}

export const isAuthenticated = (): boolean => !!tokenService.getAccessToken()

export const getCurrentUser = async (): Promise<User> => {
  try {
    const token = tokenService.getAccessToken()
    if (!token) throw new Error("Not authenticated")

    const response: AxiosResponse<User> = await api.get(ENDPOINTS.USER_INFO)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("API error:", error.response?.data || error.message)
      throw new Error(`API error: ${error.response?.status} - ${error.response?.statusText}`)
    } else {
      console.error("Unexpected error:", error)
      throw error 
    }
  } 
}

export const getUserByEmail = async (email: string): Promise<User> => {
  try {
    const response: AxiosResponse<User> = await apiNoAuth.get(ENDPOINTS.USER_INFO_BY_EMAIL + email)
    return response.data
  } catch (error) {
    throw new Error("An unknown error occurred")
  }
}

export const updateUserName = async (firstName: string, lastName: string): Promise<User> => {
  try {
    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);

    const response: AxiosResponse<User> = await api.patch(ENDPOINTS.UPDATE_USER_INFO, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw new Error("Error updating user name");
  }
};

export const updateUserBio = async (bio: string): Promise<User> => {
  try {
    const formData = new FormData();
    formData.append("bio", bio);

    const response: AxiosResponse<User> = await api.patch(ENDPOINTS.UPDATE_USER_INFO, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data
  } catch (error) {
    throw new Error("Error updating user bio")
  }
}

export const updateUserAvatar = async (avatarFile: File): Promise<User> => {
  try {
    const formData = new FormData();
    formData.append("avatar", avatarFile);

    const response: AxiosResponse<User> = await api.patch(ENDPOINTS.UPDATE_USER_INFO, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw new Error("Error updating avatar");
  }
};

export const updateUserBackground = async (backgroundFile: File): Promise<User> => {
  try {
    const formData = new FormData();
    formData.append("background", backgroundFile);

    const response: AxiosResponse<User> = await api.patch(ENDPOINTS.UPDATE_USER_INFO, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw new Error("Error updating background");
  }
};

export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const response: AxiosResponse<{ exists: boolean }> = await apiNoAuth.get(
      ENDPOINTS.CHECK_EMAIL_EXISTS,
      { params: { email } }
    )
    return response.data.exists
  } catch (error) {
    throw new Error("Error checking email exists")
  }
}

export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  try {
    await api.patch(ENDPOINTS.CHANGE_PASSWORD, { oldPassword: currentPassword, newPassword }, {
      headers: { Authorization: `Bearer ${tokenService.getAccessToken()}` }
    })
  } catch (error) {
    throw new Error("Sai mật khẩu, vui lòng thử lại!")
  }
}
