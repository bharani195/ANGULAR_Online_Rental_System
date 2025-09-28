import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Booking } from '../models/booking.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private baseUrl = 'http://localhost:5000/api/bookings';

  constructor(private http: HttpClient) { }

  createBooking(booking: Booking): Observable<Booking> {
    console.log('Creating booking with data:', booking);
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (!token || !userId) {
      console.error('No auth token or userId found');
      return throwError(() => new Error('Authentication required'));
    }

    // Ensure the user ID in the booking matches the authenticated user
    if (booking.user !== userId) {
      console.error('User ID mismatch');
      return throwError(() => new Error('Invalid user ID'));
    }

    const headers = { Authorization: `Bearer ${token}` };
    console.log('Sending booking request with headers:', headers);
    
    return this.http.post<Booking>(`${this.baseUrl}`, booking, { headers })
      .pipe(
        catchError(error => {
          console.error('Booking creation failed:', error);
          return throwError(() => error);
        })
      );
  }

  getUserBookings(userId: string): Observable<Booking[]> {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No auth token found when fetching bookings');
      return throwError(() => new Error('Authentication required'));
    }
    
    const headers = { Authorization: `Bearer ${token}` };
    console.log('Fetching bookings for user:', userId);
    
    return this.http.get<Booking[]>(`${this.baseUrl}/${userId}`, { headers })
      .pipe(
        catchError(error => {
          console.error('Failed to fetch bookings:', error);
          return throwError(() => error);
        })
      );
  }
  
  // Admin: fetch all bookings
  getBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(this.baseUrl);
  }

  // Admin: paginated bookings with filters
  getBookingsPage(page = 1, limit = 20, status?: string, search?: string) {
    const params: any = { page: page.toString(), limit: limit.toString() };
    if (status) params.status = status;
    if (search) params.search = search;
    return this.http.get(`${this.baseUrl}`, { params });
  }
  
  cancelBooking(id: string) {
    return this.http.put(`${this.baseUrl}/${id}/cancel`, {});
  }
  
  confirmBooking(id: string) {
    return this.http.put(`${this.baseUrl}/${id}/confirm`, {});
  }
}
