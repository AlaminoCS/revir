// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { Login } from './ui/pages/login/login';
import { Sales } from './ui/pages/sales/sales';
import { SalesList } from './ui/pages/sales-list/sales-list';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'sales', component: Sales },
  { path: 'sales-list', component: SalesList },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];