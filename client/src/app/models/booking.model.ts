export interface Booking {
  id?: string;
  user: string;
  item: string;
  startDate: string;
  endDate: string;
  quantity: number;
  totalAmount: number;
  paymentMethod?: 'card' | 'upi' | 'paypal';
  upiId?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
}
