// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { Login } from './ui/pages/login/login';
import { Sales } from './ui/pages/sales/sales';
import { PurchaseSuccess } from './ui/pages/purchase-success/purchase-success';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'sales', component: Sales },
  { path: 'purchase-success', component: PurchaseSuccess },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];