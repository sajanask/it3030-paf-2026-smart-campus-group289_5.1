import { useEffect, useState } from 'react'
import {
  getNotifications,
  markNotificationAsRead,
} from '../services/notificationService'

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const unreadCount = notifications.filter((item) => !item.read).length

  async function refreshNotifications() {
    if (!userId) {
      setNotifications([])
      setError('')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const data = await getNotifications(userId)
      setNotifications(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Unable to load notifications')
    } finally {
      setIsLoading(false)
    }
  }

  async function markAsRead(notificationId) {
    await markNotificationAsRead(notificationId)
    await refreshNotifications()
  }

  useEffect(() => {
    refreshNotifications()
  }, [userId])

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refreshNotifications,
    markAsRead,
  }
}
