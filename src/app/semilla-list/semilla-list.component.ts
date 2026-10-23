import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { finalize, timeout } from 'rxjs';

import { Semilla } from '../shared/semilla';
import { SemillaService } from '../shared/semilla.service';
import { CotizacionService } from '../core/services/cotizacion.service';

export interface FichaSemillaExtendida extends Semilla {
  empresaElaboradora: string;
  origenLicencia: string;
  cultivoNombre: string;
  tecnologiaBadge: string;
  cruzamientoFicha: string;
  madurezFicha: string;
  diasFloracionFicha: string;
  alturaPlantaFicha: string;
  colorGranoFicha: string;
  rendimientoFicha: string;
  sanidad: { nombre: string; puntos: number }[];
  zonasFicha: string[];
}

@Component({
  selector: 'app-semilla-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './semilla-list.component.html',
  styleUrl: './semilla-list.component.css'
})
export class SemillaListComponent implements OnInit {
  readonly dataSource = signal<FichaSemillaExtendida[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly cultivoFiltro = signal<string>('TODOS');

  readonly categoriasLehmann = [
    { codigo: 'TODOS',   titulo: 'Catálogo Completo', sub: 'Todas las variedades e híbridos disponibles', icono: 'grid_view', color: '#1b4332' },
    { codigo: 'Maíz',    titulo: 'Maíz Híbrido',      sub: 'Alta potencialidad VIP3 y VT3PRO para grano y silaje', icono: 'grass', color: '#ca8a04' },
    { codigo: 'Girasol', titulo: 'Girasol',           sub: 'Híbridos Clearfield de alto contenido graso', icono: 'wb_sunny', color: '#d97706' },
    { codigo: 'Trigo',   titulo: 'Trigo',             sub: 'Ciclos cortos, intermedios y largos de alta sanidad', icono: 'grain', color: '#9a3412' },
    { codigo: 'Soja',    titulo: 'Soja',              sub: 'Variedades adaptadas a Zona Núcleo, Centro y Norte', icono: 'spa', color: '#15803d' },
  ];

  readonly semillasFiltradas = computed(() => {
    const filtro = this.cultivoFiltro();
    const lista = this.dataSource();
    if (filtro === 'TODOS') return lista;
    return lista.filter(s => s.cultivoNombre.toLowerCase() === filtro.toLowerCase());
  });

  constructor(
    private readonly semillaService: SemillaService,
    private readonly cotizacionService: CotizacionService
  ) {}

  ngOnInit(): void {
    this.cargarSemillas();
  }

  seleccionarCultivo(codigo: string): void {
    this.cultivoFiltro.set(codigo);
  }

  cargarSemillas(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.semillaService
      .getSemillas()
      .pipe(
        timeout({ first: 10000 }),
        finalize(() => {
          this.loading.set(false);
        })
      )
      .subscribe({
        next: (semillas) => {
          this.dataSource.set(semillas.map(s => this.enriquecerFicha(s)));
        },
        error: (err) => {
          console.error('Error al cargar semillas:', err);
          this.errorMessage.set(
            'No se pudo conectar con el servidor de AgroEco. Verificá que la API esté corriendo en el puerto 3000.'
          );
        }
      });
  }

  agregarACotizacion(semilla: FichaSemillaExtendida): void {
    this.cotizacionService.addItem(semilla);
  }

  eliminarSemilla(semilla: FichaSemillaExtendida): void {
    const confirmacion = confirm(`¿Estás segura de eliminar la semilla "${semilla.nombre}"?`);
    if (!confirmacion) return;

    this.semillaService.deleteSemilla(String(semilla.id)).subscribe({
      next: () => {
        this.cargarSemillas();
      },
      error: (err) => {
        alert('Ocurrió un error al intentar eliminar la semilla.');
        console.error(err);
      }
    });
  }

  estrellasArray(puntos: number): boolean[] {
    return [1, 2, 3, 4, 5].map(i => i <= puntos);
  }

  private enriquecerFicha(s: Semilla): FichaSemillaExtendida {
    const nombreUpper = (s.nombre || '').toUpperCase();
    const mapaCultivo: Record<number, string> = {
      1: 'Soja',
      2: 'Maíz',
      3: 'Trigo',
      4: 'Girasol'
    };

    let cultivoNombre = s.cultivo || (s.cultivo_id ? mapaCultivo[s.cultivo_id] : '') || 'Maíz';
    if (nombreUpper.includes('TRIGO')) cultivoNombre = 'Trigo';
    if (nombreUpper.includes('GIRASOL') || nombreUpper.includes('5710')) cultivoNombre = 'Girasol';
    if (nombreUpper.includes('MAÍZ') || nombreUpper.includes('MAIZ') || nombreUpper.includes('LG 30') || nombreUpper.includes('DK')) cultivoNombre = 'Maíz';
    if (nombreUpper.includes('SOJA') || nombreUpper.includes('DM')) cultivoNombre = 'Soja';

    if (cultivoNombre === 'Girasol') {
      return {
        ...s,
        cultivoNombre,
        empresaElaboradora: 'Limagrain (LG Semillas) · Tecnología Clearfield® (BASF)',
        origenLicencia: 'Semillero Oficial Fiscalizado — Guarda en Cámara Fría Incluida',
        tecnologiaBadge: 'Clearfield CL',
        cruzamientoFicha: 'Híbrido Simple',
        madurezFicha: '108 días a madurez',
        diasFloracionFicha: '66 días',
        alturaPlantaFicha: '1,75 m (muy uniforme)',
        colorGranoFicha: 'Negro estriado · 51% materia grasa',
        rendimientoFicha: '3,8 - 4,5 t/ha',
        sanidad: [
          { nombre: 'Tolerancia a Phomopsis', puntos: 5 },
          { nombre: 'Resistencia a Downy Mildew', puntos: 5 },
          { nombre: 'Tolerancia a vuelco / quebrado', puntos: 4 },
          { nombre: 'Tolerancia a Sclerotinia', puntos: 4 }
        ],
        zonasFicha: ['Centro-Norte Santa Fe', 'Córdoba', 'Entre Ríos', 'Oeste de Buenos Aires', 'La Pampa']
      };
    }

    if (cultivoNombre === 'Trigo') {
      return {
        ...s,
        cultivoNombre,
        empresaElaboradora: 'Limagrain / Buck Semillas — Red Líder AgroEco',
        origenLicencia: 'Variedad Fiscalizada con Seguro de Resiembra',
        tecnologiaBadge: s.ciclo === 'Largo' ? 'Grupo Calidad 1 · Heladas' : 'Alto Potencial Sanitario',
        cruzamientoFicha: 'Variedad Autógama Purificada',
        madurezFicha: s.ciclo === 'Largo' ? '145 días' : '118 días',
        diasFloracionFicha: s.ciclo === 'Largo' ? '98 días' : '82 días',
        alturaPlantaFicha: '0,88 m (bajo riesgo de vuelco)',
        colorGranoFicha: 'Rojo duro panadero (Alto Gluten)',
        rendimientoFicha: '5,5 - 7,2 t/ha',
        sanidad: [
          { nombre: 'Tolerancia a Roya Amarilla y Anaranjada', puntos: 5 },
          { nombre: 'Tolerancia a Heladas en pasto', puntos: s.ciclo === 'Largo' ? 5 : 4 },
          { nombre: 'Tolerancia a Fusariosis de la espiga', puntos: 4 },
          { nombre: 'Tolerancia a Mancha Amarilla', puntos: 4 }
        ],
        zonasFicha: ['Sur y Centro de Santa Fe', 'Sudeste y Oeste de Bs. As.', 'Entre Ríos', 'Sudeste de Córdoba']
      };
    }

    if (cultivoNombre === 'Soja') {
      return {
        ...s,
        cultivoNombre,
        empresaElaboradora: 'DonMario (GDM) / Nidera Semillas',
        origenLicencia: 'Multiplicador Oficial AgroEco',
        tecnologiaBadge: 'Enlist E3 / STS',
        cruzamientoFicha: 'Variedad Grupo IV Medio',
        madurezFicha: 'GM 4.6',
        diasFloracionFicha: '54 días',
        alturaPlantaFicha: '0,95 m (crecimiento indeterminado)',
        colorGranoFicha: 'Amarillo hilo castaño · Alto tenor proteico',
        rendimientoFicha: '4,2 - 5,4 t/ha',
        sanidad: [
          { nombre: 'Tolerancia a Mancha Ojo de Rana (MOR)', puntos: 5 },
          { nombre: 'Tolerancia a Phytophthora', puntos: 4 },
          { nombre: 'Tolerancia a Cancro del Tallo', puntos: 5 },
          { nombre: 'Comportamiento frente a vuelco', puntos: 4 }
        ],
        zonasFicha: ['Zona Núcleo', 'Centro-Sur de Santa Fe', 'Norte de Buenos Aires', 'Marcos Juárez (Córdoba)']
      };
    }

    // Por defecto: Maíz (estilo LG 30849 / DK 72-10)
    const esDekalb = nombreUpper.includes('DK');
    return {
      ...s,
      cultivoNombre: 'Maíz',
      empresaElaboradora: esDekalb
        ? 'Dekalb (Bayer CropScience) · Distribuidor Oficial AgroEco'
        : 'Limagrain (LG Semillas · 60 años) · Semillero Oficial',
      origenLicencia: 'Seguro de Resiembra 100% + Guarda en Cámara Fría sin costo',
      tecnologiaBadge: esDekalb ? 'VT Triple PRO (VT3P)' : 'Agrisure Viptera 3 (VIP3)',
      cruzamientoFicha: 'Simple',
      madurezFicha: '124 ( Ciclo ' + (s.ciclo || 'Medio') + ' )',
      diasFloracionFicha: '72 días',
      alturaPlantaFicha: '2,30 m · 18/20 hileras',
      colorGranoFicha: 'Semidentado amarillo anaranjado',
      rendimientoFicha: '11,5 - 14,2 t/ha',
      sanidad: [
        { nombre: 'Tolerancia a Roya común', puntos: 3 },
        { nombre: 'Tolerancia a enfermedades de espiga', puntos: 4 },
        { nombre: 'Tolerancia a Mal de Río IV', puntos: 3 },
        { nombre: 'Tolerancia a Tizón foliar', puntos: 4 }
      ],
      zonasFicha: ['Zona Núcleo', 'Centro y Sur de Santa Fe', 'Córdoba', 'Entre Ríos', 'Buenos Aires', 'La Pampa']
    };
  }
}
