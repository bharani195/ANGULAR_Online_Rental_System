import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  errorMsg = '';
  successMsg = '';

  constructor(private authService: AuthService, private router: Router) {}

  register() {
    if (!this.name || !this.email || !this.password) {
      this.errorMsg = 'Please fill in all fields';
      return;
    }

    if (this.password.length < 6) {
      this.errorMsg = 'Password must be at least 6 characters long';
      return;
    }

    this.errorMsg = '';
    this.successMsg = '';

    this.authService.register({ name: this.name, email: this.email, password: this.password })
      .subscribe({
        next: (response) => {
          console.log('Registration response:', response);
          this.successMsg = 'Registration successful. Redirecting to login...';
          setTimeout(() => this.router.navigate(['/login']), 2000);
        },
        error: (error) => {
          console.error('Registration error:', error);
          this.errorMsg = error.message || 'Registration failed. Please try again.';
        }
      });
  }
}
