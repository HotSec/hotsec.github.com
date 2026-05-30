import { apiClient, setTokens, clearTokens, getAccessToken } from './api-client';
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '@/types';

export function getAuthToken() {
  return getAccessToken();
}

export { setTokens as setAuthToken, clearTokens as clearAuthToken };

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>('/api/auth/login', data);
  setTokens(res.accessToken, res.refreshToken);
  return res;
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>('/api/auth/register', data);
  setTokens(res.accessToken, res.refreshToken);
  return res;
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post('/api/auth/logout');
  } finally {
    clearTokens();
  }
}

export async function fetchCurrentUser(): Promise<User> {
  return apiClient.get<User>('/api/auth/me');
}
