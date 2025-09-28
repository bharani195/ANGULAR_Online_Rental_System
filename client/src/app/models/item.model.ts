export interface Item {
  _id?: string;  // MongoDB ID
  id?: string;   // For backwards compatibility
  name: string;
  category: 'bike' | 'car' | 'book' | 'room';
  description?: string;
  pricePerDay: number;
  available?: boolean;
  image?: string;
  imageUrl?: string;
}
