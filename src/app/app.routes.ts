import { Routes } from '@angular/router';
import { SemillaListComponent } from './semilla-list/semilla-list.component';
import { CotizacionComponent } from './features/cotizacion/cotizacion.component';
import { ClienteFormComponent } from './features/cliente/components/cliente-form/cliente-form.component';
import { ClienteListComponent } from './features/cliente/components/cliente-list/cliente-list.component';

export const routes: Routes = [
  { path: '', redirectTo: '/semillas', pathMatch: 'full' },
  { path: 'semillas', component: SemillaListComponent },
  { path: 'cotizacion', component: CotizacionComponent },
  { path: 'clientes/form', component: ClienteFormComponent },
  { path: 'clientes', component: ClienteListComponent },
  { path: '**', redirectTo: '/semillas' },
];