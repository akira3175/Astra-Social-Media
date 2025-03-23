import axios, { type AxiosResponse } from "axios"
import type { User } from "../types/user"
import { tokenService } from "./tokenService"
import { api, apiNoAuth } from "../configs/api"
import { createApiWithTimeout } from "../utils/apiUtil"

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

  console.log(refreshToken)

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
    console.log("Token refreshed successfully:", accessToken.substring(0, 10) + "...")
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

export const isAuthenticated = (): boolean => !!tokenService.getAccessToken()

export const getCurrentUser = async (): Promise<User> => {
  try {
    const token = tokenService.getAccessToken()
    if (!token) throw new Error("Not authenticated")

    setAuthHeader(token)
    const response: AxiosResponse<User> = await api.get(ENDPOINTS.USER_INFO)
    return response.data
  } catch (error) {
    throw new Error("An unknown error occurred")
  }
}


