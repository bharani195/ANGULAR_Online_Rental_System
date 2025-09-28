import { Item } from './item.model';
import { User } from './user.model';

export type BookingStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface Booking {
  _id: string;
  item: Item;
  renter: User;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
  rating?: {
    score: number;
    review?: string;
    date: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingData {
  item: string;
  startDate: string;
  endDate: string;
  notes?: string;
}

export interface BookingResponse {
  bookings: Booking[];
  totalPages: number;
  currentPage: number;
  total: number;
}

export interface BookingFilter {
  status?: BookingStatus;
  page?: number;
  limit?: number;
}