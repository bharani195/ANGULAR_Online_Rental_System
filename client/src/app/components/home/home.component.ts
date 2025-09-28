import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ItemService } from '../../services/item.service';
import { Item, ItemCategory } from '../../models/item.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  featuredItems: Item[] = [];
  categories: { name: string; displayName: string; icon: string }[] = [
    { name: 'bike', displayName: 'Bikes', icon: '🚲' },
    { name: 'car', displayName: 'Cars', icon: '🚗' },
    { name: 'book', displayName: 'Books', icon: '📚' },
    { name: 'room', displayName: 'Rooms', icon: '🏠' }
  ];

  constructor(private itemService: ItemService) {}

  ngOnInit() {
    this.loadFeaturedItems();
  }

  loadFeaturedItems() {
    this.itemService.getItems({ limit: 8, sortBy: 'rating.average', sortOrder: 'desc' })
      .subscribe({
        next: (response) => {
          this.featuredItems = response.items;
        },
        error: (error) => {
          console.error('Error loading featured items:', error);
        }
      });
  }

  onCategoryClick(category: string) {
    // Navigate to items with category filter
  }
}