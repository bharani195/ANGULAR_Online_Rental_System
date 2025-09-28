import { Component, OnInit, OnDestroy } from '@angular/core';
import { BookingService } from '../../services/booking.service';
import { SocketService } from '../../services/socket.service';
import { Subscription, Subject, debounceTime } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ConfettiService } from '../../services/confetti.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatCardModule],
  templateUrl: './admin-bookings.component.html',
  styleUrls: ['./admin-bookings.component.css']
})
export class AdminBookingsComponent implements OnInit, OnDestroy {
  bookings: any[] = [];
  filteredBookings: any[] = [];
  loading = true;
  activeFilter: 'All' | 'Pending' | 'Confirmed' | 'Cancelled' = 'All';
  searchTerm: string = '';
  // pagination
  page = 1;
  limit = 10;
  total = 0;

  private subs: Subscription[] = [];
  private search$ = new Subject<string>();

  // expose a computed totalPages for template use (avoids referencing global Math in template)
  get totalPages(): number {
    const t = Number(this.total) || 0;
    const l = Number(this.limit) || 1;
    return Math.max(1, Math.ceil(t / l));
  }

  constructor(
    private bookingService: BookingService,
    private socketService: SocketService,
    private toastr: ToastrService,
    private confetti: ConfettiService
  ) {}

  ngOnInit(): void {
    this.loadBookings();

    // debounce search
    this.subs.push(
      this.search$.pipe(debounceTime(400)).subscribe(q => {
        this.page = 1; // reset to first page on search
        this.loadBookings();
      })
    );

    this.subs.push(this.socketService.on<any>('bookingCreated').subscribe(b => {
      this.bookings = [b, ...this.bookings];
      this.applyFilter(this.activeFilter);
      this.toastr.info(`New booking for ${b.item?.name || 'an item'}`, '✨ Booking Received');
    }));

    this.subs.push(this.socketService.on<any>('bookingUpdated').subscribe(b => {
      this.bookings = this.bookings.map(x => x._id === b._id ? b : x);
      this.applyFilter(this.activeFilter);
      this.toastr.success(`Booking updated: ${b.status}`, '🔄 Status Change');
    }));
  }

  loadBookings() {
    this.loading = true;
    const statusParam = this.activeFilter === 'All' ? undefined : this.activeFilter.toLowerCase();
    this.bookingService.getBookingsPage(this.page, this.limit, statusParam, this.searchTerm).subscribe({
      next: (res: any) => {
        // expected { data, total, page, limit }
        this.bookings = res.data || res;
        this.total = res.total || (Array.isArray(res) ? res.length : 0);
        this.filteredBookings = this.bookings;
        this.loading = false;
      },
      error: (err) => { console.error(err); this.loading = false; }
    });
  }

  applyFilter(status: string) {
    this.activeFilter = status as unknown as 'All' | 'Pending' | 'Confirmed' | 'Cancelled';
    this.page = 1;
    this.loadBookings();
  }

  confirmBooking(id: string) {
    this.bookingService.confirmBooking(id).subscribe(() => {
      this.toastr.success('Booking approved successfully! ✅');
      this.confetti.fire();
    }, err => { this.toastr.error('Failed to confirm booking'); });
  }

  cancelBooking(id: string) {
    if (!confirm('Are you sure you want to deny/cancel this booking?')) return;
    this.bookingService.cancelBooking(id).subscribe(() => {
      this.toastr.warning('Booking denied ❌');
    }, err => { this.toastr.error('Failed to cancel booking'); });
  }

  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }

  onSearchChange(value: string) {
    this.searchTerm = value;
    this.search$.next(value);
  }

  applyFilters() {
    // With server-side paging, we already have filteredBookings set from server response.
    // Keep this method for backward compatibility but keep it simple.
    this.filteredBookings = this.bookings;
  }

  goToPrevious() {
    if (this.page > 1) {
      this.page--;
      this.loadBookings();
    }
  }

  goToNext() {
    const maxPage = Math.ceil(this.total / this.limit) || 1;
    if (this.page < maxPage) {
      this.page++;
      this.loadBookings();
    }
  }
}
