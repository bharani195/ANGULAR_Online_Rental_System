import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

interface PaymentPayload {
  method: 'card' | 'upi';
  amount: number;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  upiId?: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  constructor() {}

  private validateCardPayment(payload: PaymentPayload): boolean {
    if (!payload.cardNumber || !payload.cardExpiry || !payload.cardCvv) {
      console.log('Missing card details');
      return false;
    }
    
    // Remove spaces from card number
    const cardNum = payload.cardNumber.replace(/\s/g, '');
    
    // Basic validations
    if (!/^\d{16}$/.test(cardNum)) {
      console.log('Invalid card number format');
      return false;
    }
    
    if (!/^\d{3,4}$/.test(payload.cardCvv)) {
      console.log('Invalid CVV format');
      return false;
    }
    
    if (!/^\d{2}\/\d{2}$/.test(payload.cardExpiry)) {
      console.log('Invalid expiry date format');
      return false;
    }

    // For demo purposes, accept all valid format cards
    return true;
  }

  private validateUpiPayment(payload: PaymentPayload): boolean {
    if (!payload.upiId) {
      return false;
    }
    // Basic UPI ID validation (username@bank)
    return /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(payload.upiId);
  }

  processPayment(payload: PaymentPayload): Observable<{ success: boolean; transactionId: string }> {
    // Simulate network delay
    return new Observable(subscriber => {
      setTimeout(() => {
        try {
          if (payload.amount <= 0) {
            throw new Error('Invalid amount');
          }

          let isValid = false;
          if (payload.method === 'card') {
            isValid = this.validateCardPayment(payload);
          } else if (payload.method === 'upi') {
            isValid = this.validateUpiPayment(payload);
          }

          if (!isValid) {
            throw new Error(`Invalid ${payload.method} payment details`);
          }

          subscriber.next({
            success: true,
            transactionId: `txn_${payload.method}_${Date.now()}`
          });
          subscriber.complete();
        } catch (error) {
          subscriber.error(error);
        }
      }, 1000); // 1 second delay
    });
  }
}
