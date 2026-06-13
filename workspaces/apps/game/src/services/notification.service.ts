import { api } from './api';

export type Notification = {
  _id: string;
  fromName: string;
  winner: string;
  read: boolean;
  createdAt: string;
};

export const NotificationService = {
  sendTestNotification: (opponentId: string) =>
    api.post('/users/notifications/test', { opponentId }),
  
  getUnread: () => api.get<Notification[]>('/users/notifications'),

  markRead: (id: string) => api.patch<Notification>(`/users/notifications/${id}/read`, {})
};
