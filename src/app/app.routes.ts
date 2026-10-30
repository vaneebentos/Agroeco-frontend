import { Routes } from '@angular/router';
import { SemillaListComponent } from './semilla-list/semilla-list.component';
import { ClienteListComponent } from './cliente-list/cliente-list.component';
import { CotizacionComponent } from './features/cotizacion/cotizacion.component';

export const routes: Routes = [
  { path: '', component: SemillaListComponent },
  { path: 'clientes', component: ClienteListComponent },
  { path: 'cotizacion', component: CotizacionComponent },

];
