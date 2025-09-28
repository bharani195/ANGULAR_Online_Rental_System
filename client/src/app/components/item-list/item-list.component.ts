import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ItemService } from '../../services/item.service';
import { Item, ItemCategory, ItemFilter } from '../../models/item.model';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './item-list.component.html',
  styleUrl: './item-list.component.css'
})
export class ItemListComponent implements OnInit {
  items: Item[] = [];
  loading = false;
  error = '';
  
  // Filter options
  filter: ItemFilter = {
    page: 1,
    limit: 12,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  };
  
  categories: { value: ItemCategory | '', label: string }[] = [
    { value: '', label: 'All Categories' },
    { value: 'bike', label: 'Bikes' },
    { value: 'car', label: 'Cars' },
    { value: 'book', label: 'Books' },
    { value: 'room', label: 'Rooms' }
  ];
  
  sortOptions = [
    { value: 'createdAt', label: 'Newest First' },
    { value: 'pricePerDay', label: 'Price: Low to High' },
    { value: 'rating.average', label: 'Highest Rated' },
    { value: 'title', label: 'Name A-Z' }
  ];

  // Pagination
  totalPages = 0;
  currentPage = 1;

  constructor(private itemService: ItemService) {}

  ngOnInit() {
    this.loadItems();
  }

  loadItems() {
    this.loading = true;
    this.error = '';
    
    this.itemService.getItems(this.filter).subscribe({
      next: (response) => {
        this.items = response.items;
        this.totalPages = response.totalPages;
        this.currentPage = response.currentPage;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load items. Please try again.';
        this.loading = false;
        console.error('Error loading items:', error);
      }
    });
  }

  onFilterChange() {
    this.filter.page = 1;
    this.loadItems();
  }

  onSortChange() {
    this.filter.page = 1;
    this.loadItems();
  }

  onPageChange(page: number) {
    this.filter.page = page;
    this.loadItems();
  }

  onSearch() {
    this.filter.page = 1;
    this.loadItems();
  }

  clearFilters() {
    this.filter = {
      page: 1,
      limit: 12,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    this.loadItems();
  }

  getStarRating(rating: number): string[] {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('★');
    }
    
    if (hasHalfStar) {
      stars.push('☆');
    }
    
    while (stars.length < 5) {
      stars.push('☆');
    }
    
    return stars;
  }

  getPagesArray(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }
}