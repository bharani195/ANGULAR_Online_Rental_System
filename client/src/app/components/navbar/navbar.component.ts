import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, MatToolbarModule, MatButtonModule, MatIconModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  constructor(private router: Router) {}

  isLoggedIn(): boolean {
    return !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
  }

  isAdmin(): boolean {
    // Prefer stored user object (more reliable than decoding token in client)
    const userJson = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!userJson) return false;
    try {
      const user = JSON.parse(userJson);
      return user && (user.role === 'admin' || user.isAdmin === true);
    } catch (e) { return false; }
  }

  logout() {
    // clear both storages to ensure logout regardless of where token was saved
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('userId');
    this.router.navigate(['/login']);
  }

  getUserName(): string | null {
    const userJson = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!userJson) return null;
    try { return JSON.parse(userJson).name || null; } catch { return null; }
  }
}
