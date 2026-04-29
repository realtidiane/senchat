import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/auth.store';
import { disconnectSocket } from '../lib/socket';
import type { AuthResponse } from '@senchat/shared';

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await api.post<AuthResponse>('/auth/login', data);
      return res.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
    },
  });
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: async (data: {
      email: string;
      password: string;
      displayName: string;
    }) => {
      const res = await api.post<AuthResponse>('/auth/register', data);
      return res.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
    },
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSuccess: () => {
      disconnectSocket();
      clearAuth();
    },
  });
}

export function useRefreshAuth() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: async () => {
      const res = await api.post<AuthResponse>('/auth/refresh');
      return res.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
    },
  });
}
