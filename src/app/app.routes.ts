import { Routes } from '@angular/router';

import { SemillaListComponent } from './semilla-list/semilla-list.component';
import { SemillaFormComponent } from './semilla-form/semilla-form.component';

import { ClienteListComponent } from './features/cliente/components/cliente-list/cliente-list.component';
import { ClienteFormComponent } from './features/cliente/components/cliente-form/cliente-form.component';

import { CotizacionComponent } from './features/cotizacion/cotizacion.component';

export const routes: Routes = [
  // Vista pública de semillas
  { path: '', redirectTo: '/semillas', pathMatch: 'full' },
  { path: 'semillas', component: SemillaListComponent },
  { path: 'semilla/:cultivo', component: SemillaListComponent },

  // Administración de semillas
  { path: 'admin/panel', component: SemillaListComponent },
  { path: 'admin/panel/new', component: SemillaFormComponent },
  { path: 'admin/panel/:id/edit', component: SemillaFormComponent },

  // Módulo de clientes
  { path: 'clientes', component: ClienteListComponent },
  { path: 'clientes/form', component: ClienteFormComponent },

  // Cotización
  { path: 'cotizacion', component: CotizacionComponent },

  { path: '**', redirectTo: '/semillas' },
];