import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ItemService } from '../../services/item.service';
import { Item } from '../../models/item.model';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BookingDialogComponent } from '../../components/booking-dialog/booking-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    NavbarComponent, 
    FooterComponent, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatSelectModule, 
    MatTabsModule, 
    MatGridListModule, 
    MatDialogModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatSnackBarModule,
    BookingDialogComponent
  ],
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.css']
})
export class ItemsComponent implements OnInit {
  dialogRef?: MatDialogRef<BookingDialogComponent>;
  items: Item[] = [];
  filtered: Item[] = [];
  categories: string[] = ['all', 'bike', 'car', 'book', 'room'];
  selectedCategory = 'all';
  loading = true;

  constructor(
    private itemService: ItemService, 
    private router: Router, 
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.itemService.getAllItems().subscribe({
      next: (data) => {
        this.items = data;
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Failed to load items', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  bookItem(itemId: string | undefined) {
    if (!localStorage.getItem('token')) {
      this.snackBar.open('Please login to book items', 'Login', { duration: 3000 })
        .onAction()
        .subscribe(() => this.router.navigate(['/login']));
      return;
    }

    if (!itemId) {
      this.snackBar.open('Invalid item', 'Close', { duration: 3000 });
      return;
    }

    const item = this.items.find(i => i._id === itemId);
    if (!item) {
      this.snackBar.open('Item not found', 'Close', { duration: 3000 });
      return;
    }

    if (!item.available) {
      this.snackBar.open('Item is not available', 'Close', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(BookingDialogComponent, {
      data: { 
        id: item._id,
        name: item.name,
        price: item.pricePerDay,
        category: item.category,
        description: item.description,
        image: item.image || this.getCategoryImage(item.category)
      },
      width: '600px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Booking created successfully!', 'View Bookings', { duration: 5000 })
          .onAction()
          .subscribe(() => this.router.navigate(['/bookings']));
        this.refreshItems();
      }
    });
  }

  refreshItems() {
    this.loading = true;
    this.itemService.getAllItems().subscribe({
      next: (data) => {
        this.items = data;
        this.applyFilter();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  applyFilter() {
    if (this.selectedCategory === 'all') {
      this.filtered = this.items;
    } else {
      this.filtered = this.items.filter(i => i.category === this.selectedCategory);
    }
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      bike: 'pedal_bike',
      car: 'directions_car',
      book: 'menu_book',
      room: 'hotel',
      all: 'category'
    };
    return icons[category] || 'category';
  }

  getCategoryDescription(category: string): string {
    const descriptions: { [key: string]: string } = {
      bike: 'Explore our range of bikes for every terrain and style',
      car: 'Premium cars for your travel needs',
      book: 'Extensive collection of books across genres',
      room: 'Comfortable accommodations for short and long stays'
    };
    return descriptions[category] || '';
  }

  getCategoryImage(category: string): string {
    // You can replace these with actual image URLs
    const images: { [key: string]: string } = {
      bike: 'https://source.unsplash.com/featured/400x300/?bicycle',
      car: 'https://source.unsplash.com/featured/400x300/?car',
      book: 'https://source.unsplash.com/featured/400x300/?book',
      room: 'https://source.unsplash.com/featured/400x300/?room'
    };
    return images[category] || 'https://source.unsplash.com/featured/400x300/?rental';
  }

  showDetails(item: Item) {
    this.dialog.open(BookingDialogComponent, {
      data: { 
        id: item._id,
        name: item.name,
        price: item.pricePerDay,
        category: item.category,
        description: item.description,
        viewOnly: true
      },
      width: '720px'
    });
  }
}
