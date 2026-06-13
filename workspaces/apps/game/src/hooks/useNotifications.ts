import { useState, useEffect, useCallback } from 'react';
import { NotificationService, type Notification } from '../services/notification.service';

const POLLING_INTERVAL_MS = 10_000;

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await NotificationService.getUnread();
      setNotifications(data);
    } catch {
      console.error('Failed to fetch notifications');
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLLING_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markRead = async (id: string) => {
    await NotificationService.markRead(id);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  return {
    notifications,
    unreadCount: notifications.length,
    markRead
  };
}
