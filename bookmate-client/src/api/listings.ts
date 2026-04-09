import api from './axios';

export type ListingDto = {
  id: string;
  userId: string;
  userDisplayName: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  coverImage: string;
  condition: string;
  exchangeType: string;
  status: string;
  listedAt: string;
  expiresAt: string;
};

export const getAllListings = () =>
  api.get<ListingDto[]>('/listings');

export const searchListings = (query: string) =>
  api.get<ListingDto[]>('/listings', { params: { search: query } });

export const getListingById = (id: string) =>
  api.get<ListingDto>(`/listings/${id}`);

export const createListing = (data: { bookId: string; condition: string; exchangeType: string }) =>
  api.post<ListingDto>('/listings', data);

export const updateListingStatus = (id: string, status: string) =>
  api.patch<ListingDto>(`/listings/${id}/status`, { status });

export const deleteListing = (id: string) =>
  api.delete(`/listings/${id}`);
