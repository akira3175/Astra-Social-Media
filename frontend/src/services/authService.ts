import axios, { type AxiosResponse } from "axios";
import type { User } from "../types/user";
import { tokenService } from "./tokenService";
import { api, apiNoAuth } from "../configs/api";
import { createApiWithTimeout } from "../utils/apiUtil";
import type { RegisterData, TokenPair, RefreshResponse } from "../types/user";

// Constants
const ENDPOINTS = {
  LOGIN: "/users/login",
  REFRESH: "/users/refresh",
  USER_INFO: "/users/info",
  USER_INFO_BY_EMAIL: "/users/",
  UPDATE_USER_INFO: "/users/update",
  SEARCH: "/users/search",
  REGISTER: "/users/register",
  CHECK_EMAIL_EXISTS: "/users/check-email",
  CHANGE_PASSWORD: "/users/change-password",
  REQUEST_OTP: "/otp/register",
  SEND_FORGOT_PASSWORD_EMAIL: "/password/forgot",
  VERIFY_RESET_TOKEN: "/password/verify",
  RESET_PASSWORD: "/password/reset",
};

export const searchUsers = async ({
  key,
  isStaff,
  isActive,
  page,
  size,
}: {
  key: string;
  isStaff?: boolean;
  isActive?: boolean;
  page?: number;
  size?: number;
}): Promise<User[]> => {
  const token = tokenService.getAccessToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await api.get<AxiosResponse<User[]>>(
      `${ENDPOINTS.SEARCH}?keyword=${key}${size ?? `&size=${size}`}${
        page ?? `&page=${page}`
      }${isActive ?? `&isActive=${isActive}`}${
        isStaff ?? `&isStaff=${isStaff}`
      }`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data && response.data.status === 200 && response.data.data) {
      return response.data.data as User[];
    } else {
      throw new Error("Failed to get post");
    }
  } catch (error) {
    console.error("Error getting post:", error);
    throw error;
  }
};

export const getAllUser =async ():Promise<User[]> =>{

  try {
   const response = await api.get<AxiosResponse<User[]>>("/users/all")
   return response.data as unknown as User []
  } catch (error) {
    console.error(error)
    throw new Error("Failed to get User");
  }

}

// Authentication Functions
export const setAuthHeader = (token: string | null): void => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

export const refreshToken = async (): Promise<string> => {
  const refreshToken = tokenService.getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const { signal, clearTimeout: clearTimeoutFn } = createApiWithTimeout();

  try {
    const response: AxiosResponse<RefreshResponse> = await apiNoAuth.post(
      ENDPOINTS.REFRESH,
      { refreshToken },
      { signal, withCredentials: true, headers: { Authorization: undefined } }
    );

    clearTimeoutFn();

    if (response.status !== 200) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    const { accessToken } = response.data;
    tokenService.setAccessToken(accessToken);
    setAuthHeader(accessToken);
    return accessToken;
  } catch (error) {
    if (axios.isAxiosError(error) && error.message === "canceled") {
      throw new Error("Network timeout during token refresh");
    }
    throw error;
  }
};

// Authentication API
export const login = async (
  email: string,
  password: string
): Promise<TokenPair> => {
  try {
    const response: AxiosResponse<TokenPair> = await api.post(ENDPOINTS.LOGIN, {
      email,
      password,
    });
    const { accessToken, refreshToken } = response.data;

    tokenService.setAccessToken(accessToken);
    tokenService.setRefreshToken(refreshToken);
    setAuthHeader(accessToken);

    return { accessToken, refreshToken };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.message || "Invalid username or password";
      throw new Error(errorMessage);
    }
    throw new Error("Login failed. Please try again.");
  }
};

export const logout = (redirectPath = "/login"): void => {
  tokenService.clear();
  setAuthHeader(null);
  window.location.href = redirectPath;
};

export const register = async (
  registerData: RegisterData
): Promise<TokenPair> => {
  try {
    const response: AxiosResponse<TokenPair> = await api.post(
      ENDPOINTS.REGISTER,
      registerData
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.message || "Registration failed";
      throw new Error(errorMessage);
    }
    throw new Error("Registration failed. Please try again.");
  }
};

export const isAuthenticated = (): boolean => !!tokenService.getAccessToken();

export const getCurrentUser = async (): Promise<User> => {
  try {
    const token = tokenService.getAccessToken();
    if (!token) throw new Error("Not authenticated");

    const response: AxiosResponse<User> = await api.get(ENDPOINTS.USER_INFO);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("API error:", error.response?.data || error.message);
      throw new Error(
        `API error: ${error.response?.status} - ${error.response?.statusText}`
      );
    } else {
      console.error("Unexpected error:", error);
      throw error;
    }
  }
};

export const getUserByEmail = async (email: string): Promise<User> => {
  try {
    const response: AxiosResponse<User> = await apiNoAuth.get(
      ENDPOINTS.USER_INFO_BY_EMAIL + email
    );
    return response.data;
  } catch {
    throw new Error("An unknown error occurred");
  }
};

export const updateUserName = async (
  firstName: string,
  lastName: string
): Promise<User> => {
  try {
    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);

    const response: AxiosResponse<User> = await api.patch(
      ENDPOINTS.UPDATE_USER_INFO,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  } catch {
    throw new Error("Error updating user name");
  }
};

export const updateUserBio = async (bio: string): Promise<User> => {
  try {
    const formData = new FormData();
    formData.append("bio", bio);

    const response: AxiosResponse<User> = await api.patch(
      ENDPOINTS.UPDATE_USER_INFO,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  } catch {
    throw new Error("Error updating user bio");
  }
};

export const updateUserAvatar = async (avatarFile: File): Promise<User> => {
  try {
    const formData = new FormData();
    formData.append("avatar", avatarFile);

    const response: AxiosResponse<User> = await api.patch(
      ENDPOINTS.UPDATE_USER_INFO,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  } catch {
    throw new Error("Error updating avatar");
  }
};

export const updateUserBackground = async (
  backgroundFile: File
): Promise<User> => {
  try {
    const formData = new FormData();
    formData.append("background", backgroundFile);

    const response: AxiosResponse<User> = await api.patch(
      ENDPOINTS.UPDATE_USER_INFO,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  } catch {
    throw new Error("Error updating background");
  }
};

export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const response: AxiosResponse<{ exists: boolean }> = await apiNoAuth.get(
      ENDPOINTS.CHECK_EMAIL_EXISTS,
      { params: { email } }
    );
    return response.data.exists;
  } catch {
    throw new Error("Error checking email exists");
  }
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  try {
    await api.patch(
      ENDPOINTS.CHANGE_PASSWORD,
      { oldPassword: currentPassword, newPassword },
      {
        headers: { Authorization: `Bearer ${tokenService.getAccessToken()}` },
      }
    );
  } catch {
    throw new Error("Sai mật khẩu, vui lòng thử lại!");
  }
};

export const requestOtp = async (email: string): Promise<string> => {
  try {
    const response: AxiosResponse<string> = await api.post(
      ENDPOINTS.REQUEST_OTP,
      null,
      {
        params: { email },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.message || "Failed to send OTP";
      throw new Error(errorMessage);
    }
    throw new Error("Failed to send OTP. Please try again.");
  }
};

export const sendForgotPasswordEmail = async (
  email: string
): Promise<string> => {
  try {
    const response: AxiosResponse<string> = await api.post(
      ENDPOINTS.SEND_FORGOT_PASSWORD_EMAIL,
      { email }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.message || "Failed to send forgot password email";
      throw new Error(errorMessage);
    }
    throw new Error("Failed to send forgot password email. Please try again.");
  }
};

export const verifyResetToken = async (token: string): Promise<void> => {
  try {
    const response: AxiosResponse<void> = await api.get(
      ENDPOINTS.VERIFY_RESET_TOKEN,
      { params: { token } }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.message || "Failed to verify reset token";
      throw new Error(errorMessage);
    }
    throw new Error("Failed to verify reset token. Please try again.");
  }
};

export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<void> => {
  try {
    await api.post(ENDPOINTS.RESET_PASSWORD, { token, newPassword });
  } catch {
    throw new Error("Failed to reset password. Please try again.");
  }
};
