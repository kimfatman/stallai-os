/**
 * 认证服务
 * Authentication Service
 */

import apiClient from './api';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    phone: string;
    avatar?: string;
  };
}

interface ProfileResponse {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  level: string;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  days: number;
}

/**
 * 发送验证码
 */
export async function sendVerifyCode(phone: string): Promise<void> {
  await apiClient.post('/auth/send-code', { phone });
}

/**
 * 登录
 */
export async function login(phone: string, code: string): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/auth/login', { phone, code });
  return response.data;
}

/**
 * 登出
 */
export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

/**
 * 获取用户资料
 */
export async function getProfile(): Promise<ProfileResponse> {
  const response = await apiClient.get<ProfileResponse>('/users/profile');
  return response.data;
}

/**
 * 更新用户资料
 */
export async function updateProfile(data: Partial<ProfileResponse>): Promise<ProfileResponse> {
  const response = await apiClient.patch<ProfileResponse>('/users/profile', data);
  return response.data;
}
