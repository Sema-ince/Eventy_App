import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, ASYNC_STORAGE_KEYS } from '../constants/config';
import type {
  ApiResponse,
  AuthTokens,
  User,
  Event,
  Category,
  Ticket,
  PaginationMeta,
} from '../types';

// ─── Axios Instance ───────────────────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor — attach token ──────────────────────────
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired — clear storage
      await AsyncStorage.multiRemove([
        ASYNC_STORAGE_KEYS.AUTH_TOKEN,
        ASYNC_STORAGE_KEYS.USER_DATA,
      ]);
    }
    return Promise.reject(error);
  }
);

// ─── Helper ──────────────────────────────────────────────────────
const extractError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiResponse | undefined;
    return data?.message || data?.error || error.message || 'An error occurred';
  }
  return 'An unexpected error occurred';
};

// ─── Auth Service ─────────────────────────────────────────────────
export const authService = {
  register: async (name: string, email: string, password: string): Promise<AuthTokens> => {
    try {
      const res = await api.post<ApiResponse<AuthTokens>>('/auth/register', { name, email, password });
      return res.data.data!;
    } catch (e) {
      throw new Error(extractError(e));
    }
  },

  login: async (email: string, password: string): Promise<AuthTokens> => {
    try {
      const res = await api.post<ApiResponse<AuthTokens>>('/auth/login', { email, password });
      return res.data.data!;
    } catch (e) {
      throw new Error(extractError(e));
    }
  },

  getMe: async (): Promise<User> => {
    try {
      const res = await api.get<ApiResponse<User>>('/auth/me');
      return res.data.data!;
    } catch (e) {
      throw new Error(extractError(e));
    }
  },

  updateMe: async (data: {
    name?: string;
    email?: string;
    password?: string;
    bio?: string;
    avatar?: string;
  }): Promise<User> => {
    try {
      const res = await api.put<ApiResponse<User>>('/auth/me', data);
      return res.data.data!;
    } catch (e) {
      throw new Error(extractError(e));
    }
  },
};

// ─── Events Service ───────────────────────────────────────────────
export interface EventsQuery {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
  featured?: boolean;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface EventsResponse {
  events: Event[];
  meta: PaginationMeta;
}

export const eventsService = {
  getEvents: async (query?: EventsQuery): Promise<EventsResponse> => {
    try {
      const params: Record<string, string | number | boolean> = {};
      if (query?.search) params.search = query.search;
      if (query?.category) params.category = query.category;
      if (query?.page) params.page = query.page;
      if (query?.limit) params.limit = query.limit;
      if (query?.sort) params.sort = query.sort;
      if (query?.minPrice !== undefined) params.minPrice = query.minPrice;
      if (query?.maxPrice !== undefined) params.maxPrice = query.maxPrice;
      if (query?.featured) params.featured = 'true';

      const res = await api.get<ApiResponse<Event[]>>('/events', { params });
      return { events: res.data.data!, meta: res.data.meta! };
    } catch (e) {
      throw new Error(extractError(e));
    }
  },

  getFeatured: async (): Promise<Event[]> => {
    try {
      const res = await api.get<ApiResponse<Event[]>>('/events/featured');
      return res.data.data!;
    } catch (e) {
      throw new Error(extractError(e));
    }
  },

  getCategories: async (): Promise<Category[]> => {
    try {
      const res = await api.get<ApiResponse<Category[]>>('/events/categories');
      return res.data.data!;
    } catch (e) {
      throw new Error(extractError(e));
    }
  },

  getById: async (id: string): Promise<Event> => {
    try {
      const res = await api.get<ApiResponse<Event>>(`/events/${id}`);
      return res.data.data!;
    } catch (e) {
      throw new Error(extractError(e));
    }
  },
};

// ─── Favorites Service ────────────────────────────────────────────
export const favoritesService = {
  getFavorites: async (): Promise<Event[]> => {
    try {
      const res = await api.get<ApiResponse<Event[]>>('/favorites');
      return res.data.data!;
    } catch (e) {
      throw new Error(extractError(e));
    }
  },

  addFavorite: async (eventId: string): Promise<void> => {
    try {
      await api.post(`/favorites/${eventId}`);
    } catch (e) {
      throw new Error(extractError(e));
    }
  },

  removeFavorite: async (eventId: string): Promise<void> => {
    try {
      await api.delete(`/favorites/${eventId}`);
    } catch (e) {
      throw new Error(extractError(e));
    }
  },

  checkFavorite: async (eventId: string): Promise<boolean> => {
    try {
      const res = await api.get<ApiResponse<{ isFavorited: boolean }>>(`/favorites/check/${eventId}`);
      return res.data.data!.isFavorited;
    } catch {
      return false;
    }
  },
};

// ─── Tickets Service ──────────────────────────────────────────────
export interface MyTickets {
  all: Ticket[];
  active: Ticket[];
  past: Ticket[];
}

export const ticketsService = {
  getMyTickets: async (): Promise<MyTickets> => {
    try {
      const res = await api.get<ApiResponse<MyTickets>>('/tickets');
      return res.data.data!;
    } catch (e) {
      throw new Error(extractError(e));
    }
  },

  purchaseTicket: async (eventId: string, quantity: number): Promise<Ticket> => {
    try {
      const res = await api.post<ApiResponse<Ticket>>('/tickets/purchase', { eventId, quantity });
      return res.data.data!;
    } catch (e) {
      throw new Error(extractError(e));
    }
  },

  getTicketById: async (id: string): Promise<Ticket> => {
    try {
      const res = await api.get<ApiResponse<Ticket>>(`/tickets/${id}`);
      return res.data.data!;
    } catch (e) {
      throw new Error(extractError(e));
    }
  },
};

export default api;
