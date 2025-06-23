// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { Login } from './ui/pages/login/login';
import { Sales } from './ui/pages/sales/sales';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'sales', component: Sales },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];