import api from './axios';

export interface UserDto {
  id: string;
  name: string;
  email: string;
  phone: string;
  displayName: string;
  reputationScore: number;
  visaStatus?: string;
  createdAt: string;
}

export interface UserStatsDto {
  booksListed: number;
  booksSwapped: number;
  booksLent: number;
  booksDonated: number;
  returnsOnTime: number;
  defaults: number;
  badgesEarned: number;
  reputationScore: number;
}

export interface UpdateUserDto {
  displayName?: string;
  phone?: string;
  visaStatus?: string;
}

export const getProfile = (id: string) =>
  api.get<UserDto>(`/users/${id}`);

export const updateProfile = (id: string, data: UpdateUserDto) =>
  api.patch(`/users/${id}`, data);

export const getStats = (id: string) =>
  api.get<UserStatsDto>(`/users/${id}/stats`);

export const getBadges = (id: string) =>
  api.get(`/users/${id}/badges`);

export const getListings = (id: string) =>
  api.get(`/users/${id}/listings`);

export const getExchanges = (id: string) =>
  api.get(`/users/${id}/exchanges`);

export const archiveAccount = (id: string) =>
  api.patch(`/users/${id}/archive`, {});

export const deleteAccount = (id: string) =>
  api.delete(`/users/${id}`);
