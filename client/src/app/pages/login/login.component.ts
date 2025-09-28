import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatCheckboxModule, MatProgressSpinnerModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  errorMsg = '';
  loading = false;
  hidePassword = true;
  remember = false;

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.errorMsg = '';
    this.loading = true;
    this.authService.login({ email: this.email, password: this.password } as any)
      .subscribe({
        next: (res: any) => {
          // Server returns { token, user }
          const token = res.token;
          const user = res.user;

          const storage = this.remember ? localStorage : sessionStorage;
          storage.setItem('token', token);
          // store a minimal serialized user object for UI
          storage.setItem('user', JSON.stringify({ id: user._id || user.id, name: user.name, role: user.role }));

          // always keep userId as MongoDB _id for bookings
          storage.setItem('userId', user._id || user.id);

          this.loading = false;
          this.router.navigate(['/items']);
        },
        error: (err) => {
          this.loading = false;
          this.errorMsg = err?.error?.message || 'Login failed';
        }
      });
  }
}
