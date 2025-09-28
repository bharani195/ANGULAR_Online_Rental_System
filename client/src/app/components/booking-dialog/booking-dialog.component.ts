import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { PaymentService } from '../../services/payment.service';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface DialogData {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  viewOnly?: boolean;
}

interface PaymentPayload {
  method: 'card' | 'upi';
  amount: number;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  upiId?: string;
}

@Component({
  selector: 'app-booking-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './booking-dialog.component.html',
  styleUrls: ['./booking-dialog.component.css']
})
export class BookingDialogComponent implements OnInit {
  form: FormGroup;
  minDate = new Date();
  maxDate = new Date(2026, 11, 31);  // Allow bookings up to end of 2026
  total = 0;

  constructor(
    public dialogRef: MatDialogRef<BookingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private fb: FormBuilder,
    private bookingService: BookingService,
    private payment: PaymentService,
    private auth: AuthService,
    private snack: MatSnackBar
  ) {
    // Set minDate to today with time set to start of day
    this.minDate = new Date();
    this.minDate.setHours(0, 0, 0, 0);
    this.form = this.initForm();
  }

  ngOnInit(): void {
    this.setupPaymentValidation();
    this.updateTotal();

    // Watch for form changes that affect total
    this.form.valueChanges.subscribe(() => {
      this.updateTotal();
    });
  }

  private initForm(): FormGroup {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.fb.group({
      start: [null, [Validators.required, (control) => {
        const date = new Date(control.value);
        return date >= today ? null : { pastDate: true };
      }]],
      end: [null, [Validators.required, (control) => {
        const date = new Date(control.value);
        return date >= today ? null : { pastDate: true };
      }]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      paymentMethod: ['upi', Validators.required],
      cardNumber: [''],
      cardExpiry: [''],
      cardCvv: [''],
      upiId: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/)]]
    });
  }

  private setupPaymentValidation(): void {
    const paymentMethod = this.form.get('paymentMethod');
    if (!paymentMethod) return;

    paymentMethod.valueChanges.subscribe((method: 'card' | 'upi') => {
      const upiId = this.form.get('upiId');
      const cardFields = ['cardNumber', 'cardExpiry', 'cardCvv'];
      
      if (method === 'upi') {
        upiId?.setValidators([Validators.required, Validators.pattern(/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/)]);
        cardFields.forEach(field => this.form.get(field)?.clearValidators());
      } else {
        upiId?.clearValidators();
        cardFields.forEach(field => this.form.get(field)?.setValidators(Validators.required));
      }
      
      [upiId, ...cardFields.map(f => this.form.get(f))].forEach(control => control?.updateValueAndValidity());
    });
  }

  private updateTotal(): void {
    const start = this.form.get('start')?.value;
    const end = this.form.get('end')?.value;
    const quantity = this.form.get('quantity')?.value || 1;

    if (!start || !end || !this.data?.price) {
      this.total = 0;
      return;
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    
    if (startDate > endDate) {
      this.form.get('end')?.setErrors({ 'invalidDate': true });
      this.total = 0;
      return;
    }

    const days = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    this.total = this.data.price * days * quantity;
  }

  submit(): void {
    // Check specific required fields and show appropriate messages
    if (!this.form.get('start')?.value || !this.form.get('end')?.value) {
      this.snack.open('Please select both start and end dates', 'Close', { duration: 3000 });
      return;
    }

    if (!this.form.get('quantity')?.value || this.form.get('quantity')?.value < 1) {
      this.snack.open('Please enter a valid quantity', 'Close', { duration: 3000 });
      return;
    }

    const paymentMethod = this.form.get('paymentMethod')?.value;
    if (paymentMethod === 'upi' && !this.form.get('upiId')?.value) {
      this.snack.open('Please enter a valid UPI ID', 'Close', { duration: 3000 });
      return;
    }

    if (paymentMethod === 'card') {
      if (!this.form.get('cardNumber')?.value) {
        this.snack.open('Please enter card number', 'Close', { duration: 3000 });
        return;
      }
      if (!this.form.get('cardExpiry')?.value) {
        this.snack.open('Please enter card expiry date', 'Close', { duration: 3000 });
        return;
      }
      if (!this.form.get('cardCvv')?.value) {
        this.snack.open('Please enter card CVV', 'Close', { duration: 3000 });
        return;
      }
    }

    if (this.form.invalid) {
      this.snack.open('Please check all fields are filled correctly', 'Close', { duration: 3000 });
      return;
    }

    const userId = this.auth.getCurrentUserId();
    if (!userId) {
      this.snack.open('Please login to continue', 'Close', { duration: 3000 });
      this.dialogRef.close('login');
      return;
    }

    const formValues = this.form.value;
    if (!this.total || this.total <= 0) {
      this.snack.open('Invalid booking duration or amount', 'Close', { duration: 3000 });
      return;
    }

    // Validate dates
    const startDate = new Date(formValues.start);
    const endDate = new Date(formValues.end);
    if (startDate > endDate) {
      this.snack.open('End date must be after start date', 'Close', { duration: 3000 });
      return;
    }

    if (!this.data?.id) {
      this.snack.open('Invalid item selected', 'Close', { duration: 3000 });
      return;
    }
    if (!formValues.start || !formValues.end || !formValues.quantity) {
      this.snack.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return;
    }

    const payload: PaymentPayload = {
      method: formValues.paymentMethod,
      amount: this.total,
      ...(formValues.paymentMethod === 'card' ? {
        cardNumber: formValues.cardNumber,
        cardExpiry: formValues.cardExpiry,
        cardCvv: formValues.cardCvv
      } : {
        upiId: formValues.upiId
      })
    };

    this.payment.processPayment(payload).subscribe({
      next: (paymentRes) => {
        const booking = {
          user: userId,
          item: this.data.id,
          startDate: new Date(formValues.start).toISOString(),
          endDate: new Date(formValues.end).toISOString(),
          quantity: formValues.quantity,
          totalAmount: this.total,
          status: 'confirmed' as const,
          paymentId: paymentRes.transactionId
        };

        console.log('Attempting to create booking:', booking);
        this.bookingService.createBooking(booking).subscribe({
          next: (response) => {
            console.log('Booking created successfully:', response);
            this.snack.open('Booking confirmed successfully! Transaction ID: ' + paymentRes.transactionId, 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error) => {
            console.error('Booking creation failed:', error);
            this.snack.open(error.error?.message || 'Failed to create booking', 'Close', { duration: 5000 });
            // If the error is due to authentication, redirect to login
            if (error.status === 401) {
              this.dialogRef.close('login');
            }
          }
        });
      },
      error: (error) => {
        this.snack.open(error.error?.message || 'Payment failed', 'Close', { duration: 3000 });
      }
    });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}