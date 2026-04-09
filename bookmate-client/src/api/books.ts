import api from './axios';

export interface BookDto {
  id: string;
  title: string;
  author: string;
  isbn: string;
  genre: string;
  publishedYear: number;
  coverImage?: string;
}

export interface CreateBookDto {
  title: string;
  author: string;
  isbn: string;
  genre: string;
  publishedYear: number;
  coverImage?: string;
}

export const getBooks = () =>
  api.get<BookDto[]>('/books');

export const getBook = (id: string) =>
  api.get<BookDto>(`/books/${id}`);

export const createBook = (data: CreateBookDto) =>
  api.post<BookDto>('/books', data);

export const searchBooks = (query: string) =>
  api.get<BookDto[]>('/books', { params: { search: query } });
