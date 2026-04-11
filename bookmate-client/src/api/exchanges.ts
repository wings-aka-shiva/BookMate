import api from './axios';

export type ExchangeDto = {
  id: string;
  listingId: string;
  bookTitle: string;
  requesterId: string;
  requesterName: string;
  ownerId: string;
  ownerName: string;
  type: string;
  status: string;
  pickupLocation: string | null;
  dueDate: string | null;
  extensionRequested: boolean;
  extendedDueDate: string | null;
  rejectionReason: string | null;
  createdAt: string;
  completedAt: string | null;
};

export const requestExchange = (listingId: string, type: string) =>
  api.post<ExchangeDto>('/exchanges', { listingId, type });

export const getExchange = (id: string) =>
  api.get<ExchangeDto>(`/exchanges/${id}`);

export const getUserExchanges = (userId: string) =>
  api.get<ExchangeDto[]>(`/users/${userId}/exchanges`);

export const acceptExchange = (id: string) =>
  api.patch<ExchangeDto>(`/exchanges/${id}/accept`);

export const rejectExchange = (id: string, rejectionReason?: string) =>
  api.patch<ExchangeDto>(`/exchanges/${id}/reject`, { rejectionReason });

export const setPickup = (id: string, pickupLocation: string) =>
  api.patch<ExchangeDto>(`/exchanges/${id}/pickup`, { pickupLocation });

export const completeExchange = (id: string) =>
  api.patch<ExchangeDto>(`/exchanges/${id}/complete`);

export const returnExchange = (id: string) =>
  api.patch<ExchangeDto>(`/exchanges/${id}/return`);
