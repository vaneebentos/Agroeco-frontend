import { Routes } from '@angular/router';

import { SeedListComponent } from './seed-list/seed-list.component';
import { SeedFormComponent } from './seed-form/seed-form.component';

import { CustomerListComponent } from './features/customer/components/customer-list/customer-list.component';
import { CustomerFormComponent } from './features/customer/components/customer-form/customer-form.component';

import { QuoteComponent } from './features/quote/quote.component';

export const routes: Routes = [
  // Public seed view
  { path: '', redirectTo: '/semillas', pathMatch: 'full' },
  { path: 'semillas', component: SeedListComponent },
  { path: 'semilla/:cultivo', component: SeedListComponent },

  // Seed administration
  { path: 'admin/panel', component: SeedListComponent },
  { path: 'admin/panel/catalogo', component: SeedListComponent },
  { path: 'admin/panel/new', component: SeedFormComponent },
  { path: 'admin/panel/:id/edit', component: SeedFormComponent },

  // Customers module
  { path: 'admin/panel/clientes', component: CustomerListComponent },
  { path: 'admin/panel/clientes/form', component: CustomerFormComponent },

  // Quote
  { path: 'cotizacion', component: QuoteComponent },

  { path: '**', redirectTo: '/semillas' },
];