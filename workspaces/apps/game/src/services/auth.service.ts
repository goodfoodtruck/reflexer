import { api } from './api';

export type AuthResponse = {
  token: string;
  user: {
    id: string;
    name: string;
  };
};

export type AuthUser = {
  id: string;
  name: string;
};

export const AuthService = {
  register: (name: string, password: string, secretAnswer: string) =>
    api.post<AuthResponse>('/auth/register', { name, password, secretAnswer }),

  login: (name: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { name, password }),

  resetPassword: (name: string, secretAnswer: string, newPassword: string) =>
    api.post<{ message: string }>('/auth/reset-password', { name, secretAnswer, newPassword }),

  me: () => api.get<AuthUser>('/auth/me'),
};
