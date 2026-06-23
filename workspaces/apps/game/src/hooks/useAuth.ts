import { useState, useEffect } from 'react';
import { AuthService } from '../services/auth.service';

const TOKEN_KEY = 'reflexer_token';
const USER_KEY = 'reflexer_user';

export type AuthUser = {
  id: string;
  name: string;
};

// mettre le user dans le storage
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? (JSON.parse(stored) as AuthUser) : null;
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(USER_KEY);
    if (!stored) {
      setCheckingSession(false);
      return;
    }

    AuthService.me()
      .then((freshUser) => {
        localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
        setUser(freshUser);
      })
      .catch(() => {
        logout();
      })
      .finally(() => setCheckingSession(false));
  }, []);

  const login = async (name: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const response = await AuthService.login(name, password);
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      setUser(response.user);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur de connexion';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, password: string, secretAnswer: string) => {
    setError(null);
    setLoading(true);
    try {
      const response = await AuthService.register(name, password, secretAnswer);
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      setUser(response.user);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur d'inscription";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (name: string, secretAnswer: string, newPassword: string) => {
    setError(null);
    setLoading(true);
    try {
      await AuthService.resetPassword(name, secretAnswer, newPassword);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur de réinitialisation';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const isAuthenticated = user !== null;

  return {
    user,
    error,
    loading,
    checkingSession,
    login,
    register,
    resetPassword,
    logout,
    isAuthenticated,
  };
}
