import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Item, ItemResponse } from '../models/item.model';
import { User, AuthResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  private mockItems: Item[] = [
    {
      _id: '1',
      title: 'Mountain Bike - Trek X1',
      description: 'High-quality mountain bike perfect for trails and city riding. Features 21-speed gear system and front suspension.',
      category: 'bike',
      pricePerDay: 25,
      location: 'San Francisco, CA',
      images: ['/assets/bike1.jpg'],
      features: ['21-speed gear system', 'Front suspension', 'Disc brakes', 'LED lights'],
      availability: true,
      owner: {
        _id: '2',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567891'
      },
      specifications: {
        make: 'Trek',
        model: 'X1',
        year: 2023,
        color: 'Blue'
      },
      rating: {
        average: 4.5,
        count: 12
      },
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    },
    {
      _id: '2',
      title: 'Honda Civic 2023',
      description: 'Reliable and fuel-efficient sedan perfect for city driving and longer trips. Clean interior and well-maintained.',
      category: 'car',
      pricePerDay: 45,
      location: 'Los Angeles, CA',
      images: ['/assets/car1.jpg'],
      features: ['Air conditioning', 'Bluetooth', 'Backup camera', 'Fuel efficient'],
      availability: true,
      owner: {
        _id: '2',
        name: 'John Doe',
        email: 'john@example.com'
      },
      specifications: {
        make: 'Honda',
        model: 'Civic',
        year: 2023,
        color: 'Silver',
        fuelType: 'Gasoline',
        transmission: 'Automatic'
      },
      rating: {
        average: 4.7,
        count: 15
      },
      createdAt: '2024-01-14T09:00:00Z',
      updatedAt: '2024-01-14T09:00:00Z'
    },
    {
      _id: '3',
      title: 'Tesla Model 3',
      description: 'Electric luxury sedan with autopilot features. Perfect for eco-friendly transportation with premium comfort.',
      category: 'car',
      pricePerDay: 85,
      location: 'San Francisco, CA',
      images: ['/assets/car2.jpg'],
      features: ['Electric', 'Autopilot', 'Premium interior', 'Supercharger access'],
      availability: true,
      owner: {
        _id: '3',
        name: 'Jane Smith',
        email: 'jane@example.com'
      },
      specifications: {
        make: 'Tesla',
        model: 'Model 3',
        year: 2023,
        color: 'White',
        fuelType: 'Electric',
        transmission: 'Automatic'
      },
      rating: {
        average: 4.9,
        count: 23
      },
      createdAt: '2024-01-13T14:30:00Z',
      updatedAt: '2024-01-13T14:30:00Z'
    },
    {
      _id: '4',
      title: 'JavaScript: The Good Parts',
      description: 'Essential guide to JavaScript programming. Perfect for developers looking to master JavaScript.',
      category: 'book',
      pricePerDay: 5,
      location: 'Los Angeles, CA',
      images: ['/assets/book2.jpg'],
      features: ['Technical book', 'Programming guide', 'Good condition', 'Highlighted sections'],
      availability: true,
      owner: {
        _id: '3',
        name: 'Jane Smith',
        email: 'jane@example.com'
      },
      specifications: {
        author: 'Douglas Crockford',
        isbn: '978-0-596-51774-8',
        publisher: 'O\'Reilly Media',
        publicationYear: 2008
      },
      rating: {
        average: 4.4,
        count: 11
      },
      createdAt: '2024-01-12T16:00:00Z',
      updatedAt: '2024-01-12T16:00:00Z'
    },
    {
      _id: '5',
      title: 'Cozy Downtown Studio',
      description: 'Modern studio apartment in the heart of downtown. Perfect for short stays with all amenities included.',
      category: 'room',
      pricePerDay: 120,
      location: 'San Francisco, CA',
      images: ['/assets/room1.jpg'],
      features: ['WiFi', 'Kitchen', 'Air conditioning', 'Near public transport'],
      availability: true,
      owner: {
        _id: '2',
        name: 'John Doe',
        email: 'john@example.com'
      },
      specifications: {
        bedrooms: 1,
        bathrooms: 1,
        area: 500,
        furnishing: 'Fully furnished',
        amenities: ['WiFi', 'Kitchen', 'AC', 'TV', 'Washing machine']
      },
      rating: {
        average: 4.3,
        count: 19
      },
      createdAt: '2024-01-11T12:00:00Z',
      updatedAt: '2024-01-11T12:00:00Z'
    },
    {
      _id: '6',
      title: 'City Bike - Comfort Cruiser',
      description: 'Comfortable city bike ideal for casual rides and commuting. Features upright seating position.',
      category: 'bike',
      pricePerDay: 15,
      location: 'San Francisco, CA',
      images: ['/assets/bike2.jpg'],
      features: ['Comfort seat', 'Upright position', 'Basket included', 'Bell'],
      availability: true,
      owner: {
        _id: '3',
        name: 'Jane Smith',
        email: 'jane@example.com'
      },
      specifications: {
        make: 'Schwinn',
        model: 'Cruiser',
        year: 2022,
        color: 'Red'
      },
      rating: {
        average: 4.2,
        count: 8
      },
      createdAt: '2024-01-10T11:00:00Z',
      updatedAt: '2024-01-10T11:00:00Z'
    }
  ];

  private mockUsers: User[] = [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@renteasy.com',
      role: 'admin'
    },
    {
      id: '2',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user'
    },
    {
      id: '3',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'user'
    }
  ];

  getMockItems(filter?: any): Observable<ItemResponse> {
    let filteredItems = [...this.mockItems];
    
    // Apply category filter
    if (filter?.category) {
      filteredItems = filteredItems.filter(item => item.category === filter.category);
    }
    
    // Apply search filter
    if (filter?.search) {
      const searchTerm = filter.search.toLowerCase();
      filteredItems = filteredItems.filter(item => 
        item.title.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        item.location.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply price filters
    if (filter?.minPrice) {
      filteredItems = filteredItems.filter(item => item.pricePerDay >= filter.minPrice);
    }
    
    if (filter?.maxPrice) {
      filteredItems = filteredItems.filter(item => item.pricePerDay <= filter.maxPrice);
    }
    
    // Apply sorting
    if (filter?.sortBy) {
      filteredItems.sort((a, b) => {
        let aValue = this.getNestedValue(a, filter.sortBy);
        let bValue = this.getNestedValue(b, filter.sortBy);
        
        if (filter.sortOrder === 'desc') {
          return bValue > aValue ? 1 : -1;
        } else {
          return aValue > bValue ? 1 : -1;
        }
      });
    }
    
    // Pagination
    const page = filter?.page || 1;
    const limit = filter?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = filteredItems.slice(startIndex, endIndex);
    
    const response: ItemResponse = {
      items: paginatedItems,
      totalPages: Math.ceil(filteredItems.length / limit),
      currentPage: page,
      total: filteredItems.length
    };
    
    return of(response).pipe(delay(500)); // Simulate network delay
  }

  getMockItem(id: string): Observable<Item | null> {
    const item = this.mockItems.find(item => item._id === id);
    return of(item || null).pipe(delay(300));
  }

  mockLogin(email: string, password: string): Observable<AuthResponse> {
    // Simple mock authentication
    if (password === 'password123') {
      const user = this.mockUsers.find(u => u.email === email);
      if (user) {
        const response: AuthResponse = {
          message: 'Login successful',
          token: 'mock-jwt-token-' + user.id,
          user: user
        };
        return of(response).pipe(delay(1000));
      }
    }
    
    throw new Error('Invalid credentials');
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}