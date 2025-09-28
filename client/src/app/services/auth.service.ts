import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:5000/api/auth';

  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error.message || 'Server error';
    }
    console.error('Auth error:', error);
    return throwError(() => new Error(errorMessage));
  }

  register(user: User): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, user)
      .pipe(catchError(this.handleError));
  }

  login(user: User): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, user)
      .pipe(catchError(this.handleError));
  }

  me(): Observable<any> {
    return this.http.get(`${this.baseUrl}/me`)
      .pipe(catchError(this.handleError));
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getCurrentUserId(): string | null {
    return localStorage.getItem('userId');
  }
}
