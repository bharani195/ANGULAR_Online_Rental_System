import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../pages/home/home.component';
import { LoginComponent } from '../pages/login/login.component';
import { RegisterComponent } from '../pages/register/register.component';
import { ItemsComponent } from '../pages/items/items.component';
import { BookingComponent } from '../pages/booking/booking.component';
import { BookingsComponent } from '../pages/bookings/bookings.component';
import { AdminBookingsComponent } from '../pages/admin-bookings/admin-bookings.component';
import { AdminGuard } from '../guards/admin.guard';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'items', component: ItemsComponent },
  { path: 'booking', component: BookingComponent },
  { path: 'bookings', component: BookingsComponent },
  { path: 'admin/bookings', component: AdminBookingsComponent, canActivate: [AdminGuard] },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
