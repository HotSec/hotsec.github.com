import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { login, register, logout, fetchCurrentUser, getAuthToken } from '@/lib/auth';
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '@/types';

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, LoginRequest>({
    mutationFn: login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, RegisterRequest>({
    mutationFn: register,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export function useCurrentUser() {
  const hasToken = !!getAuthToken();

  return useQuery<User>({
    queryKey: ['auth', 'me'],
    queryFn: fetchCurrentUser,
    enabled: hasToken,
    retry: false,
  });
}
