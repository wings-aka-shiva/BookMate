import api from './axios'

export interface RegisterData {
  name: string
  email: string
  phone: string
  displayName: string
  password: string
}

export interface LoginData {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  displayName: string
  userId: string
}

export const register = (data: RegisterData) =>
  api.post<AuthResponse>('/auth/register', data)

export const login = (data: LoginData) =>
  api.post<AuthResponse>('/auth/login', data)

export const logout = () =>
  api.post('/auth/logout')