import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { Client } from "@stomp/stompjs"
import SockJS from "sockjs-client"
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "../services/notificationService"
import { tokenService } from "../services/tokenService"
import { useCurrentUser } from "../contexts/currentUserContext"

export interface Notification {
  id: number
  senderId: number
  senderName: string
  senderAvatarUrl: string
  type: "LIKE" | "COMMENT" | "FRIEND_REQUEST" | "FRIEND_ACCEPT" | string
  postId?: number
  message: string
  isRead: boolean
  createdAt: string | null
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => Promise<void>
  markAsRead: (id: number) => Promise<void>
  markAllAsRead: () => Promise<void>
  refreshNotifications: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

interface NotificationProviderProps {
  children: ReactNode
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { currentUser } = useCurrentUser();
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [_stompClient, setStompClient] = useState<Client | null>(null)

  // Group notifications by postId
  const groupNotificationsByPostId = (notifs: Notification[]): Notification[] => {
    const groupedMap = new Map<number, Notification[]>()
  
    // Lọc các thông báo LIKE trùng người và post
    const uniqueMap = new Map<string, Notification>()
    notifs.forEach((notif) => {
      if (notif.postId && notif.type === "LIKE") {
        const key = `${notif.postId}-${notif.senderId}-${notif.type}`
        const existing = uniqueMap.get(key)
        if (!existing || new Date(notif.createdAt!).getTime() > new Date(existing.createdAt!).getTime()) {
          uniqueMap.set(key, notif)
        }
      } else {
        const key = `${notif.id}`
        uniqueMap.set(key, notif)
      }
    })
  
    const deduplicated = Array.from(uniqueMap.values())
  
    // Tiếp tục nhóm như cũ sau khi đã lọc
    deduplicated.forEach((notif) => {
      if (notif.postId) {
        const key = notif.postId
        if (!groupedMap.has(key)) {
          groupedMap.set(key, [])
        }
        groupedMap.get(key)!.push(notif)
      }
    })
  
    const result: Notification[] = []
  
    groupedMap.forEach((group, _postId) => {
      if (group.length > 1) {
        group.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
  
        const likesCount = group.filter((n) => n.type === "LIKE").length
        const commentsCount = group.filter((n) => n.type === "COMMENT").length
  
        const senderNames = [...new Set(group.map((n) => n.senderName))].slice(0, 2)
        let message = ""

        const otherCount = group.length - senderNames.length;
        const otherText = otherCount > 0 ? ` và ${otherCount} người khác` : "";

        if (likesCount > 0 && commentsCount > 0) {
          message = `${senderNames.join(", ")}${otherText} đã thích và bình luận về bài viết của bạn`;
        } else if (likesCount > 0) {
          message = `${senderNames.join(", ")}${otherText} đã thích bài viết của bạn`;
        } else if (commentsCount > 0) {
          message = `${senderNames.join(", ")}${otherText} đã bình luận về bài viết của bạn`;
        }
  
        result.push({
          ...group[0],
          message,
          isRead: group.every((n) => n.isRead),
        })
      } else {
        result.push(group[0])
      }
    })
  
    deduplicated
      .filter((notif) => !notif.postId)
      .forEach((notif) => result.push(notif))
  
    return result.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
  }  

  // Initialize WebSocket connection
  useEffect(() => {
    if (!currentUser) return;
    const token = tokenService.getAccessToken();
    if (!token) return;
    
    const baseSocketUrl = import.meta.env.VITE_WEBSOCKET_URL;
    const socket = new SockJS(`${baseSocketUrl}?token=${token}`);
    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        console.log(str)
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    })

    client.onConnect = () => {
      console.log("Connected to WebSocket")

      // Subscribe to notifications
      client.subscribe("/user/queue/notifications", (message) => {
        try {
          const newNotification = JSON.parse(message.body) as Notification
          console.log("New notification received:", newNotification)

          setNotifications((prevNotifications) => {
            const updatedNotifications = [newNotification, ...prevNotifications]
            return groupNotificationsByPostId(updatedNotifications)
          })

          if (!newNotification.isRead) {
            setUnreadCount((prevCount) => prevCount + 1)
          }
        } catch (error) {
          console.error("Error processing notification:", error)
        }
      })
    }

    client.onStompError = (frame) => {
      console.error("STOMP error:", frame.headers, frame.body)
      setError("Failed to connect to notification service")
    }

    client.activate()
    setStompClient(client)

    return () => {
      if (client.active) {
        client.deactivate()
      }
    }
  }, [currentUser, tokenService.getAccessToken()])

  // Load initial notifications
  useEffect(() => {
    fetchNotifications()
  }, [tokenService.getAccessToken()])

  // Count unread notifications
  useEffect(() => {
    const count = notifications.filter((notification) => !notification.isRead).length
    setUnreadCount(count)
  }, [notifications, tokenService.getAccessToken()])

  const fetchNotifications = async (pageNum = 0) => {
    try {
      setLoading(true)
      setError(null)

      const response = await getNotifications(pageNum, 10)

      const newNotifications = response.content
      const totalPages = response.totalPages

      setNotifications((prevNotifications) => {
        const combinedNotifications = pageNum === 0 ? newNotifications : [...prevNotifications, ...newNotifications]
        return groupNotificationsByPostId(combinedNotifications)
      })

      setHasMore(pageNum < totalPages - 1)
      setPage(pageNum)
    } catch (err) {
      console.error("Failed to fetch notifications:", err)
      setError("Failed to load notifications")
    } finally {
      setLoading(false)
    }
  }

  const loadMore = async () => {
    if (!loading && hasMore) {
      await fetchNotifications(page + 1)
    }
  }

  const markAsRead = async (id: number) => {
    try {
      await markNotificationAsRead(id)

      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === id ? { ...notification, isRead: true } : notification,
        ),
      )
    } catch (err) {
      console.error("Failed to mark notification as read:", err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead()

      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({ ...notification, isRead: true })),
      )

      setUnreadCount(0)
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err)
    }
  }

  const refreshNotifications = async () => {
    await fetchNotifications(0)
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        hasMore,
        loadMore,
        markAsRead,
        markAllAsRead,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
