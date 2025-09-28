
// Prompt: Fetch and display all bookings for the logged-in user
// Use the userId from localStorage and display bookings in the template
// Use BookingService.getUserBookings(userId)
// Show loading state while fetching
// Handle empty bookings with a message
// Display item name, category, start date, end date, and status
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../services/booking.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.css']
})
export class BookingsComponent implements OnInit {
  bookings: any[] = [];
  loading = true;

  constructor(private bookingService: BookingService, private router: Router) {}

  ngOnInit(): void {
    console.log('Initializing bookings component');
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    
    console.log('Current auth state:', { 
      hasUserId: !!userId, 
      hasToken: !!token 
    });

    // If userId is missing, redirect to login with return URL
    if (!userId || !token) {
      console.log('Missing auth credentials, redirecting to login');
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/bookings' }
      });
      return;
    }

    // Fetch bookings for the logged-in user
    console.log('Fetching bookings for user:', userId);
    this.bookingService.getUserBookings(userId).subscribe({
      next: (data: any) => {
        console.log('Received bookings:', data);
        this.bookings = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to fetch bookings:', err);
        if (err.status === 401) {
          console.log('Unauthorized access, clearing session');
          // Clear invalid session data and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          this.router.navigate(['/login'], {
            queryParams: { returnUrl: '/bookings' }
          });
        }
        this.loading = false;
      }
    });
  }

  // Cancel a booking by ID
  cancelBooking(id: string) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    this.bookingService.cancelBooking(id).subscribe(() => {
      // Optionally, refresh bookings or rely on socket updates
      this.bookings = this.bookings.filter(b => b._id !== id);
    });
  }

  // Calculate days left until end date
  daysLeft(endDate: string): number {
    const end = new Date(endDate).getTime();
    const today = Date.now();
    const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }
}
