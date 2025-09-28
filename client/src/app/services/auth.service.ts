import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { User, LoginCredentials, RegisterData, AuthResponse } from '../models/user.model';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient, 
    private router: Router,
    private mockDataService: MockDataService
  ) {
    // Check if user is already logged in
    const token = this.getToken();
    if (token) {
      this.getCurrentUser().subscribe();
    }
  }

  register(userData: RegisterData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData)
      .pipe(
        tap(response => {
          this.setToken(response.token);
          this.currentUserSubject.next(response.user);
        })
      );
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          this.setToken(response.token);
          this.currentUserSubject.next(response.user);
        }),
        catchError(() => {
          // Fallback to mock authentication
          console.log('Backend not available, using mock authentication');
          return this.mockDataService.mockLogin(credentials.email, credentials.password)
            .pipe(
              tap(response => {
                this.setToken(response.token);
                this.currentUserSubject.next(response.user);
              })
            );
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${this.apiUrl}/me`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(response => {
        this.currentUserSubject.next(response.user);
      }),
      catchError(() => {
        // If backend is not available, check for token and mock user
        const token = this.getToken();
        if (token && token.startsWith('mock-jwt-token-')) {
          const userId = token.replace('mock-jwt-token-', '');
          const mockUser: User = {
            id: userId,
            name: userId === '1' ? 'Admin User' : userId === '2' ? 'John Doe' : 'Jane Smith',
            email: userId === '1' ? 'admin@renteasy.com' : userId === '2' ? 'john@example.com' : 'jane@example.com',
            role: userId === '1' ? 'admin' : 'user'
          };
          this.currentUserSubject.next(mockUser);
          return throwError(() => new Error('Using mock data'));
        }
        return throwError(() => new Error('Not authenticated'));
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'admin';
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }
}