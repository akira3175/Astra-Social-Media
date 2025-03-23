export const tokenService = {
  getAccessToken: (): string | null => localStorage.getItem("accessToken"),
  getRefreshToken: (): string | null => localStorage.getItem("refreshToken"),
  setAccessToken: (token: string): void => localStorage.setItem("accessToken", token),
  setRefreshToken: (token: string): void => localStorage.setItem("refreshToken", token),
  removeAccessToken: (): void => localStorage.removeItem("accessToken"),
  removeRefreshToken: (): void => localStorage.removeItem("refreshToken"),
  clear: (): void => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
  },
}
