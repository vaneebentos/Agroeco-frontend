import { Routes } from '@angular/router';
import { SeedListComponent } from './seed-list/seed-list.component';
import { ClienteListComponent } from './cliente-list/cliente-list.component';
import { CotizacionComponent } from './features/cotizacion/cotizacion.component';

export const routes: Routes = [
  { path: 'semillas',   component: SeedListComponent },
  { path: 'clientes',   component: ClienteListComponent },
  { path: 'cotizacion', component: CotizacionComponent },
  { path: '**', redirectTo: '/semillas' },
];