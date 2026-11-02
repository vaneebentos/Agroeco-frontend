import { Routes } from '@angular/router';
import { SemillaListComponent } from './semilla-list/semilla-list.component';
import { SemillaFormComponent } from './semilla-form/semilla-form.component';
import { ClienteListComponent } from './cliente-list/cliente-list.component';
import { CotizacionComponent } from './features/cotizacion/cotizacion.component';

export const routes: Routes = [
  // Vista pública del cliente (solo catálogo y cotización, sin CRUD)
  { path: '',                     component: SemillaListComponent },
  { path: 'semilla/:cultivo',     component: SemillaListComponent },

  // Todo el CRUD de Semillas en admin/panel (Crear, Editar y Eliminar)
  { path: 'admin/panel',          component: SemillaListComponent },
  { path: 'admin/panel/new',      component: SemillaFormComponent },
  { path: 'admin/panel/:id/edit', component: SemillaFormComponent },

  // Módulos de Clientes y Cotización
  { path: 'clientes',             component: ClienteListComponent },
  { path: 'cotizacion',           component: CotizacionComponent },
  { path: '**', redirectTo: '' },
];
