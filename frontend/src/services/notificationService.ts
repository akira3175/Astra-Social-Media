import { api } from "../configs/api"
import type { Notification } from "../contexts/NotificationContext"

interface NotificationResponse {
  content: Notification[]
  pageable: {
    pageNumber: number
    pageSize: number
  }
  totalElements: number
  totalPages: number
  last: boolean
  first: boolean
  empty: boolean
}

export const getNotifications = async (page = 0, size = 10): Promise<NotificationResponse> => {
  try {
    const response = await api.get(`/notifications?page=${page}&size=${size}`)
    return response.data
  } catch (error) {
    console.error("Error fetching notifications:", error)
    throw error
  }
}

export const markNotificationAsRead = async (notificationId: number): Promise<void> => {
  try {
    await api.put(`/notifications/${notificationId}/read`)
  } catch (error) {
    console.error("Error marking notification as read:", error)
    throw error
  }
}

export const markAllNotificationsAsRead = async (): Promise<void> => {
  try {
    await api.put("/notifications/read-all")
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    throw error
  }
}

export const deleteNotification = async (notificationId: number): Promise<void> => {
  try {
    await api.delete(`/notifications/${notificationId}`)
  } catch (error) {
    console.error("Error deleting notification:", error)
    throw error
  }
}
