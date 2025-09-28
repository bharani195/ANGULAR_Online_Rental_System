export type ItemCategory = 'bike' | 'car' | 'book' | 'room';

export interface Item {
  _id: string;
  title: string;
  description: string;
  category: ItemCategory;
  pricePerDay: number;
  location: string;
  images: string[];
  features: string[];
  availability: boolean;
  owner: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  specifications: {
    // For vehicles
    make?: string;
    model?: string;
    year?: number;
    color?: string;
    fuelType?: string;
    transmission?: string;
    
    // For books
    author?: string;
    isbn?: string;
    publisher?: string;
    publicationYear?: number;
    
    // For rooms
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
    furnishing?: string;
    amenities?: string[];
  };
  rating: {
    average: number;
    count: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ItemFilter {
  category?: ItemCategory;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ItemResponse {
  items: Item[];
  totalPages: number;
  currentPage: number;
  total: number;
}

export interface CreateItemData {
  title: string;
  description: string;
  category: ItemCategory;
  pricePerDay: number;
  location: string;
  images?: string[];
  features?: string[];
  specifications?: any;
}