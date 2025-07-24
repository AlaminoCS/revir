// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { Login } from './ui/pages/login/login';
import { Sales } from './ui/pages/sales/sales';
import { SalesList } from './ui/pages/sales-list/sales-list';
import { Reports } from './ui/pages/reports/reports'; 
import { Suppliers } from './ui/pages/suppliers/suppliers';
import { Products } from './ui/pages/products/products';
import { ClientRegistration } from './ui/pages/client-registration/client-registration';
import { PurchasesComponent } from './ui/pages/purchases/purchases';


export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'sales', component: Sales },
  { path: 'sales-list', component: SalesList },
  { path: 'reports', component: Reports }, 
  { path: 'suppliers', component: Suppliers },
  { path: 'products', component: Products },
  { path: 'client-registration', component: ClientRegistration },
  { path: 'purchases', component: PurchasesComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
