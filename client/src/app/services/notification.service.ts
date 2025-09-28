import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private snack: MatSnackBar) {}

  success(message: string) {
    this.snack.open(message, 'Close', { duration: 4000, panelClass: ['snack-success'] });
  }

  info(message: string) {
    this.snack.open(message, 'Close', { duration: 3000, panelClass: ['snack-info'] });
  }

  error(message: string) {
    this.snack.open(message, 'Close', { duration: 4000, panelClass: ['snack-error'] });
  }
}
