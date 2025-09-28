import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BookingService } from '../../services/booking.service';
import { Booking } from '../../models/booking.model';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ItemService } from '../../services/item.service';
import { PaymentService } from '../../services/payment.service';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NavbarComponent,
    FooterComponent,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterModule
  ],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})
export class BookingComponent implements OnInit {
  itemId: string = '';
  itemName: string = '';
  quantity: number = 1;
  message: string = '';
  itemPrice = 0;
  form: any;
  minDate = new Date(); // Today's date
  minEndDate = new Date(); // Will be updated based on start date
  totalDays = 0;
  imageUrl: string = '';
  itemAvailable: boolean = true;
  maxQuantity: number = 5; // Maximum available quantity

  constructor(private route: ActivatedRoute, private bookingService: BookingService, private router: Router, private itemService: ItemService, private paymentService: PaymentService, private fb: FormBuilder, private snack: MatSnackBar, private dialog: MatDialog) {
    this.form = this.fb.group({
      start: [null, Validators.required],
      end: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      paymentMethod: ['card', Validators.required],
      cardNumber: [''],
      upiId: ['', [Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+$')]]
    });

    // Add conditional validation for UPI ID
    this.form.get('paymentMethod')?.valueChanges.subscribe(method => {
      const upiIdControl = this.form.get('upiId');
      if (method === 'upi') {
        upiIdControl?.setValidators([Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+$')]);
      } else {
        upiIdControl?.clearValidators();
      }
      upiIdControl?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    // Set minimum end date to tomorrow by default
    this.minEndDate = new Date();
    this.minEndDate.setDate(this.minEndDate.getDate() + 1);

    this.route.queryParams.subscribe(params => {
      this.itemId = params['itemId'] || '';
      if (this.itemId) {
        this.itemService.getItemById(this.itemId).subscribe({
          next: item => {
            this.itemName = item.name;
            this.itemPrice = item.pricePerDay;
            this.imageUrl = item.imageUrl || '/assets/images/default-item.jpg';
          },
          error: () => {
            this.itemName = 'Selected Item';
          }
        });
      }
    });

    // Subscribe to date changes to update total days
    this.form.get('start').valueChanges.subscribe(() => this.updateTotalDays());
    this.form.get('end').valueChanges.subscribe(() => this.updateTotalDays());
    this.form.get('quantity').valueChanges.subscribe(() => this.updateTotalDays());
  }

  confirmBooking() {
    if (this.form.invalid) {
      this.snack.open('Please fill all required fields', 'Close', { duration: 2000 });
      return;
    }

    // Get authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      this.snack.open('Please login to continue', 'Login', { duration: 3000 });
      this.router.navigate(['/login']);
      return;
    }

    const start = this.form.value.start as Date | null;
    const end = this.form.value.end as Date | null;
    if (!start || !end) {
      this.snack.open('Please select start and end dates', 'Close', { duration: 2000 });
      return;
    }

    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const qty = this.form.value.quantity || 1;
    const total = this.itemPrice * days * qty;

    // Check if user is logged in
    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.snack.open('Please login to make a booking', 'Login', { duration: 3000 });
      this.router.navigate(['/login']);
      return;
    }

    // Process payment
    const paymentPayload = {
      method: this.form.value.paymentMethod,
      amount: total,
      itemId: this.itemId
    };

    if (this.form.value.paymentMethod === 'upi' && !this.form.value.upiId) {
      this.snack.open('Please enter UPI ID', 'Close', { duration: 2000 });
      return;
    }

    this.paymentService.processPayment(paymentPayload).subscribe({
      next: (payRes) => {
        const booking: Booking = {
          user: localStorage.getItem('userId') || '',
          item: this.itemId,
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          quantity: this.form.value.quantity || 1,
          totalAmount: total,
          status: 'confirmed'
        };
        this.bookingService.createBooking(booking).subscribe({
          next: () => {
            this.snack.open('Booking confirmed! Transaction: ' + payRes.transactionId, 'Close', { duration: 3000 });
            this.form.reset({ quantity: 1, paymentMethod: 'card' });
            this.router.navigate(['/items']);
          },
          error: (error) => {
            console.error('Booking error:', error);
            this.snack.open(error.error?.message || 'Failed to create booking', 'Close', { duration: 3000 });
          }
        });
      },
      error: (error) => {
        console.error('Payment error:', error);
        this.snack.open(error.error?.message || 'Payment failed', 'Close', { duration: 3000 });
      }
    });
  }

  // Optional helper to cancel and go back
  cancel() {
    this.router.navigate(['/items']);
  }

  updateEndDateMin(event: any) {
    const startDate = event.value as Date;
    if (startDate) {
      this.minEndDate = new Date(startDate);
      this.minEndDate.setDate(startDate.getDate() + 1);
      
      // If end date is before new minimum, update it
      const currentEnd = this.form.get('end').value;
      if (currentEnd && currentEnd < this.minEndDate) {
        this.form.patchValue({ end: this.minEndDate });
      }
    }
    this.updateTotalDays();
  }

  updateTotalDays() {
    const start = this.form.get('start').value as Date;
    const end = this.form.get('end').value as Date;
    if (start && end) {
      this.totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    } else {
      this.totalDays = 0;
    }
  }

  calculateTotal(): number {
    const quantity = this.form.get('quantity').value || 1;
    return this.totalDays * this.itemPrice * quantity;
  }

  incrementQuantity(): void {
    const currentValue = this.form.get('quantity').value || 1;
    if (currentValue < this.maxQuantity) {
      this.form.patchValue({ quantity: currentValue + 1 });
      this.updateTotalDays();
    }
  }

  decrementQuantity(): void {
    const currentValue = this.form.get('quantity').value || 1;
    if (currentValue > 1) {
      this.form.patchValue({ quantity: currentValue - 1 });
      this.updateTotalDays();
    }
  }

  onDateRangeChange(event: any): void {
    if (event.value) {
      const start = event.value.start;
      const end = event.value.end;
      if (start && end) {
        this.updateTotalDays();
      }
    }
  }
}
