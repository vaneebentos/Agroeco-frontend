import { Routes } from '@angular/router';
import { SeedListComponent } from './seed-list/seed-list.component';
import { ClienteListComponent } from './cliente-list/cliente-list.component';
import { CotizacionListComponent } from './cotizacion-list/cotizacion-list.component';

export const routes: Routes = [
  { path: 'semillas',   component: SeedListComponent },
  { path: 'clientes',   component: ClienteListComponent },
  { path: 'cotizacion', component: CotizacionListComponent },
  { path: '**', redirectTo: '/semillas' },
];