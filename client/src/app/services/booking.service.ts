import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking, BookingFilter, BookingResponse, CreateBookingData, BookingStatus } from '../models/booking.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = '/api/bookings';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getBookings(filter?: BookingFilter): Observable<BookingResponse> {
    let params = new HttpParams();
    
    if (filter) {
      Object.keys(filter).forEach(key => {
        const value = (filter as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<BookingResponse>(this.apiUrl, {
      params,
      headers: this.authService.getAuthHeaders()
    });
  }

  getBookingById(id: string): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/${id}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  createBooking(bookingData: CreateBookingData): Observable<{ message: string; booking: Booking }> {
    return this.http.post<{ message: string; booking: Booking }>(this.apiUrl, bookingData, {
      headers: this.authService.getAuthHeaders()
    });
  }

  updateBookingStatus(id: string, status: BookingStatus): Observable<{ message: string; booking: Booking }> {
    return this.http.put<{ message: string; booking: Booking }>(`${this.apiUrl}/${id}/status`, { status }, {
      headers: this.authService.getAuthHeaders()
    });
  }

  cancelBooking(id: string): Observable<{ message: string; booking: Booking }> {
    return this.http.put<{ message: string; booking: Booking }>(`${this.apiUrl}/${id}/cancel`, {}, {
      headers: this.authService.getAuthHeaders()
    });
  }

  addReview(id: string, score: number, review?: string): Observable<{ message: string; booking: Booking }> {
    return this.http.put<{ message: string; booking: Booking }>(`${this.apiUrl}/${id}/review`, { score, review }, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getOwnerBookings(filter?: BookingFilter): Observable<BookingResponse> {
    let params = new HttpParams();
    
    if (filter) {
      Object.keys(filter).forEach(key => {
        const value = (filter as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<BookingResponse>(`${this.apiUrl}/owner/items`, {
      params,
      headers: this.authService.getAuthHeaders()
    });
  }
}