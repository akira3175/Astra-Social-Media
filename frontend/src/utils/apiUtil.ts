export interface ApiTimeoutResult {
    signal: AbortSignal
    clearTimeout: () => void
}
  
const TIMEOUT_MS = 5000
  
export const createApiWithTimeout = (timeoutMs: number = TIMEOUT_MS): ApiTimeoutResult => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  
    return {
      signal: controller.signal,
      clearTimeout: () => clearTimeout(timeoutId),
    }
}