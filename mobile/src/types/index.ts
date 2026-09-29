// ─── Evently Mobile — Shared TypeScript Types ────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
  _count?: {
    tickets: number;
    favorites: number;
  };
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  _count?: {
    events: number;
  };
}

export interface Event {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  image?: string; // Şartname aliası
  date: string;
  endDate?: string;
  start_time?: string; // Şartname aliası
  end_time?: string; // Şartname aliası
  location: string;
  address: string;
  latitude?: number;
  longitude?: number;
  price: number;
  currency: string;
  totalSeats: number;
  capacity?: number; // Şartname aliası
  soldSeats: number;
  isFeatured: boolean;
  isActive: boolean;
  organizerName: string;
  organizer?: string; // Şartname aliası
  organizerAvatar?: string;
  tags: string; // JSON string
  categoryId: string;
  category_id?: string; // Şartname aliası
  category: Category;
  isFavorited?: boolean;
  _count?: {
    tickets: number;
    favorites: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  ticket_number?: string; // Şartname aliası
  qrCode: string;
  qr_code?: string; // Şartname aliası
  status: 'ACTIVE' | 'USED' | 'CANCELLED' | 'EXPIRED';
  status_tr?: string; // Şartname karşılığı (aktif / kullanıldı / iptal)
  quantity: number;
  totalPrice: number;
  price?: number; // Şartname aliası
  purchasedAt: string;
  purchase_date?: string; // Şartname aliası
  userId: string;
  user_id?: string; // Şartname aliası
  eventId: string;
  event_id?: string; // Şartname aliası
  event: Event;
  user?: Pick<User, 'id' | 'name' | 'email'>;
}

export interface AuthTokens {
  user: User;
  token: string;
}

// ─── API Response Types ───────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ─── Navigation Types ─────────────────────────────────────────────
export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Search: { screen?: string; params?: { initialQuery?: string } } | { initialQuery?: string } | undefined;
  Favorites: undefined;
  Tickets: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  EventList?: { category?: string; title?: string; sort?: string };
  EventDetail: { eventId: string };
  OrderConfirmation: { event: Event; quantity: number };
  TicketDetail: { ticketId: string };
  Chatbot: undefined;
};

export type SearchStackParamList = {
  SearchScreen?: { initialQuery?: string };
  EventDetail: { eventId: string };
  OrderConfirmation: { event: Event; quantity: number };
  TicketDetail: { ticketId: string };
};

export type FavoritesStackParamList = {
  FavoritesScreen: undefined;
  EventDetail: { eventId: string };
  OrderConfirmation: { event: Event; quantity: number };
  TicketDetail: { ticketId: string };
};

export type TicketsStackParamList = {
  TicketsScreen: undefined;
  TicketDetail: { ticketId: string };
};

export type ProfileStackParamList = {
  ProfileScreen: undefined;
  EditProfile: undefined;
};
