import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, timeout } from 'rxjs';

import { Semilla } from '../shared/semilla';
import { SemillaService } from '../shared/semilla.service';
import { CotizacionService } from '../core/services/cotizacion.service';

export interface FichaSemillaExtendida extends Semilla {
  empresaElaboradora: string;
  origenLicencia: string;
  cultivoNombre: string;
  insigniaTecnologia: string;
  cruzamientoFicha: string;
  cicloFicha: string;
  madurezFicha: string;
  diasFloracionFicha: string;
  alturaPlantaFicha: string;
  numeroHilerasFicha: string;
  colorGranoFicha: string;
  rendimientoFicha: string;
  sanidadFicha: { nombre: string; puntos: number }[];
  zonasFicha: string[];
}

const TEMPORADAS_DISPONIBLES_POR_DEFECTO = ['2025/26 Temprana', '2025/26 Tardía'];

const RUTA_A_CULTIVO: Record<string, string> = {
  maiz: 'Maíz',
  'maíz': 'Maíz',
  girasol: 'Girasol',
  trigo: 'Trigo',
  soja: 'Soja',
};

const CULTIVO_A_RUTA: Record<string, string> = {
  'Maíz': 'maiz',
  Girasol: 'girasol',
  Trigo: 'trigo',
  Soja: 'soja',
};

@Component({
  selector: 'app-semilla-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
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
  readonly listaSemillas = signal<FichaSemillaExtendida[]>([]);
  readonly tablaCatalogoBD = signal<FichaSemillaExtendida[]>([]);
  readonly cargando = signal(false);
  readonly cargandoTablaBD = signal(false);
  readonly mensajeError = signal('');
  readonly cultivoFiltro = signal<string>('TODOS');
  readonly idsEliminando = signal<Set<string>>(new Set());

  // Separación Vista Cliente (/ o /semilla/:cultivo) vs Vista Admin (/admin/panel y /admin/panel/catalogo)
  readonly esModoAdmin = signal(false);
  readonly esVistaTablaCatalogo = signal(false);

  // Cartel de notificación (Semilla creada, editada, eliminada o sumada a cotización)
  readonly alertaMensaje = signal('');
  readonly alertaTipo = signal<'exito' | 'edicion' | 'eliminada'>('exito');

  readonly categoriasCatalogo = [
    { codigo: 'TODOS', titulo: 'Catálogo Completo', sub: 'Todas las variedades e híbridos disponibles', icono: 'grid_view', color: '#1b4332' },
    { codigo: 'Maíz', titulo: 'Maíz Híbrido', sub: 'Alta potencialidad VIP3 y VT3PRO para grano y silaje', icono: 'grass', color: '#ca8a04' },
    { codigo: 'Girasol', titulo: 'Girasol', sub: 'Híbridos Clearfield de alto contenido graso', icono: 'wb_sunny', color: '#d97706' },
    { codigo: 'Trigo', titulo: 'Trigo', sub: 'Ciclos cortos, intermedios y largos de alta sanidad', icono: 'grain', color: '#9a3412' },
    { codigo: 'Soja', titulo: 'Soja', sub: 'Variedades adaptadas a Zona Núcleo, Centro y Norte', icono: 'spa', color: '#15803d' },
  ];

  readonly semillasFiltradas = computed(() => {
    const filtro = this.cultivoFiltro();
    const lista = this.listaSemillas();
    if (filtro === 'TODOS') return lista;
    return lista.filter(s => s.cultivoNombre.toLowerCase() === filtro.toLowerCase());
  });

  readonly semillasActivasBD = computed(() =>
    this.tablaCatalogoBD().filter(s => !s.eliminado)
  );

  readonly semillasEliminadasBD = computed(() =>
    this.tablaCatalogoBD().filter(s => Boolean(s.eliminado))
  );

  constructor(
    private readonly semillaService: SemillaService,
    private readonly cotizacionService: CotizacionService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const urlActual = this.router.url;
    this.esModoAdmin.set(urlActual.includes('admin'));
    this.esVistaTablaCatalogo.set(urlActual.includes('admin/panel/catalogo'));

    this.route.paramMap.subscribe(parametros => {
      const rutaCultivo = parametros.get('cultivo')?.toLowerCase().trim() || '';
      if (rutaCultivo && RUTA_A_CULTIVO[rutaCultivo]) {
        this.cultivoFiltro.set(RUTA_A_CULTIVO[rutaCultivo]);
      } else if (!this.esModoAdmin()) {
        this.cultivoFiltro.set('TODOS');
      }
    });

    this.route.queryParamMap.subscribe(parametros => {
      const alerta = parametros.get('alerta');
      const nombre = parametros.get('nombre') || 'la semilla';
      if (alerta === 'creada') {
        this.mostrarAlerta(
          `¡Semilla "${nombre}" creada correctamente!`,
          'exito'
        );
      } else if (alerta === 'editada') {
        this.mostrarAlerta(
          `¡Los cambios de la semilla "${nombre}" se guardaron correctamente!`,
          'edicion'
        );
      }
    });

    this.normalizarTemporadasEnCarrito();
    this.cargarSemillas();
    if (this.esModoAdmin()) {
      this.cargarCatalogoTablaBD();
    }
  }

  irATablaCatalogoBD(): void {
    this.esVistaTablaCatalogo.set(true);
    this.router.navigate(['/admin/panel/catalogo']);
    this.cargarCatalogoTablaBD();
  }

  volverAFichasAdmin(): void {
    this.esVistaTablaCatalogo.set(false);
    this.router.navigate(['/admin/panel']);
    this.cargarSemillas();
  }

  cargarCatalogoTablaBD(): void {
    this.cargandoTablaBD.set(true);
    this.mensajeError.set('');

    this.semillaService
      .obtenerCatalogoAdmin()
      .pipe(
        timeout({ first: 10000 }),
        finalize(() => {
          this.cargandoTablaBD.set(false);
        })
      )
      .subscribe({
        next: (semillas) => {
          const enriquecidas = semillas.map(s => this.enriquecerFicha(s));
          this.tablaCatalogoBD.set(enriquecidas);
        },
        error: (err) => {
          console.error('Error al cargar listado de semillas:', err);
          this.mensajeError.set(
            'No se pudo obtener el listado de semillas. Intentá nuevamente.'
          );
        }
      });
  }

  mostrarAlerta(mensaje: string, tipo: 'exito' | 'edicion' | 'eliminada'): void {
    this.alertaMensaje.set(mensaje);
    this.alertaTipo.set(tipo);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setTimeout(() => {
      if (this.alertaMensaje() === mensaje) {
        this.alertaMensaje.set('');
      }
    }, 6500);
  }

  cerrarAlerta(): void {
    this.alertaMensaje.set('');
  }

  seleccionarCultivo(codigo: string): void {
    this.cultivoFiltro.set(codigo);

    if (!this.esModoAdmin()) {
      if (codigo === 'TODOS') {
        this.router.navigate(['/']);
      } else {
        const rutaCultivo = CULTIVO_A_RUTA[codigo] || codigo.toLowerCase();
        this.router.navigate(['/semilla', rutaCultivo]);
      }
    }
  }

  cargarSemillas(): void {
    this.cargando.set(true);
    this.mensajeError.set('');

    this.semillaService
      .obtenerSemillas()
      .pipe(
        timeout({ first: 10000 }),
        finalize(() => {
          this.cargando.set(false);
        })
      )
      .subscribe({
        next: (semillas) => {
          const enriquecidas = semillas.map(s => this.enriquecerFicha(s));
          this.listaSemillas.set(enriquecidas);
          this.normalizarTemporadasEnCarrito();
        },
        error: (err) => {
          console.error('Error al cargar semillas:', err);
          this.mensajeError.set(
            'No se pudo cargar el catálogo de semillas. Intentá nuevamente.'
          );
        }
      });
  }

  agregarACotizacion(semilla: FichaSemillaExtendida): void {
    const semillaConTemporadas: FichaSemillaExtendida = {
      ...semilla,
      cultivo: semilla.cultivo || semilla.cultivoNombre,
      temporadasDisponibles:
        semilla.temporadasDisponibles && semilla.temporadasDisponibles.length >= 2
          ? semilla.temporadasDisponibles
          : TEMPORADAS_DISPONIBLES_POR_DEFECTO
    };

    const existente = this.cotizacionService
      .items()
      .find(i => i.semillaId === Number(semillaConTemporadas.id));

    if (
      existente &&
      (!existente.semilla.temporadasDisponibles || existente.semilla.temporadasDisponibles.length < 2)
    ) {
      const hectareasPrevias = Number(existente.hectareas) || 0;
      const temporadaPrevia = existente.temporada || TEMPORADAS_DISPONIBLES_POR_DEFECTO[0];
      this.cotizacionService.removeItem(Number(semillaConTemporadas.id));
      this.cotizacionService.addItem(semillaConTemporadas, hectareasPrevias + 50, temporadaPrevia);
    } else {
      this.cotizacionService.addItem(semillaConTemporadas);
    }

    this.mostrarAlerta(`Se añadió "${semilla.nombre}" al carrito.`, 'exito');
  }

  eliminarSemilla(semilla: FichaSemillaExtendida): void {
    const idTexto = String(semilla.id);
    if (this.idsEliminando().has(idTexto)) return;

    const confirmado = window.confirm(
      `¿Seguro que querés eliminar la semilla "${semilla.nombre}"?`
    );
    if (!confirmado) {
      return;
    }

    this.idsEliminando.update(ids => new Set(ids).add(idTexto));

    this.semillaService
      .eliminarSemilla(idTexto)
      .pipe(
        finalize(() =>
          this.idsEliminando.update(ids => {
            const restantes = new Set(ids);
            restantes.delete(idTexto);
            return restantes;
          })
        )
      )
      .subscribe({
        next: () => {
          this.listaSemillas.update(semillas =>
            semillas.filter(item => String(item.id) !== idTexto)
          );
          this.cargarCatalogoTablaBD();
          this.mostrarAlerta(
            `¡La semilla "${semilla.nombre}" fue eliminada correctamente!`,
            'eliminada'
          );
        },
        error: (err) => {
          console.error('Error al eliminar semilla:', err);
          this.mostrarAlerta(
            `No se pudo eliminar la semilla "${semilla.nombre}". Intentá nuevamente.`,
            'eliminada'
          );
        }
      });
  }

  arregloEstrellas(puntos: number): boolean[] {
    return [1, 2, 3, 4, 5].map(i => i <= puntos);
  }

  private normalizarTemporadasEnCarrito(): void {
    const itemsActuales = this.cotizacionService.items();
    for (const item of itemsActuales) {
      if (!item.semilla.temporadasDisponibles || item.semilla.temporadasDisponibles.length < 2) {
        const semillaNormalizada: Semilla = {
          ...item.semilla,
          temporadasDisponibles: TEMPORADAS_DISPONIBLES_POR_DEFECTO
        };
        const ha = Number(item.hectareas) || 50;
        const temp = item.temporada || TEMPORADAS_DISPONIBLES_POR_DEFECTO[0];
        this.cotizacionService.removeItem(item.semillaId);
        this.cotizacionService.addItem(semillaNormalizada, ha, temp);
      }
    }
  }

  private enriquecerFicha(s: Semilla): FichaSemillaExtendida {
    const nombreMayusculas = (s.nombre || '').toUpperCase();
    const mapaCultivo: Record<number, string> = {
      1: 'Soja',
      2: 'Maíz',
      3: 'Trigo',
      4: 'Girasol'
    };

    let cultivoNombre =
      (s.cultivo_id ? mapaCultivo[Number(s.cultivo_id)] : '') ||
      s.cultivo ||
      '';

    if (!cultivoNombre) {
      if (nombreMayusculas.includes('TRIGO')) cultivoNombre = 'Trigo';
      else if (nombreMayusculas.includes('GIRASOL') || nombreMayusculas.includes('5710')) cultivoNombre = 'Girasol';
      else if (nombreMayusculas.includes('SOJA') || nombreMayusculas.includes('DM')) cultivoNombre = 'Soja';
      else cultivoNombre = 'Maíz';
    }

    const temporadasDisponibles =
      s.temporadasDisponibles && s.temporadasDisponibles.length >= 2
        ? s.temporadasDisponibles
        : TEMPORADAS_DISPONIBLES_POR_DEFECTO;

    const rindePersonalizado =
      s.rendimiento_estimado !== undefined && s.rendimiento_estimado !== null
        ? `${s.rendimiento_estimado} ${s.unidad_rendimiento || 't/ha'}`
        : null;

    const cicloTexto = s.ciclo === 'Medio' ? 'Intermedio' : (s.ciclo || 'Intermedio');
    const sanidadGuardada =
      Array.isArray(s.sanidad) && s.sanidad.length > 0 ? s.sanidad : null;

    if (cultivoNombre === 'Girasol') {
      const zonas = ['Centro-Norte Santa Fe', 'Córdoba', 'Entre Ríos', 'Oeste de Buenos Aires', 'La Pampa'];
      return {
        ...s,
        cultivo: cultivoNombre,
        cultivoNombre,
        temporadasDisponibles,
        zonasAdaptacion: s.zonasAdaptacion?.length ? s.zonasAdaptacion : zonas,
        empresaElaboradora: 'Limagrain (LG Semillas) · Tecnología Clearfield® (BASF)',
        origenLicencia: 'Semillero Oficial Fiscalizado — Guarda en Cámara Fría Incluida',
        insigniaTecnologia: s.tecnologia || 'Clearfield CL',
        cruzamientoFicha: s.cruzamiento || (s.tipo === 'COMUN' ? 'Variedad Polinización Abierta' : 'Simple'),
        cicloFicha: cicloTexto,
        madurezFicha: s.madurez_relativa || '108',
        diasFloracionFicha: s.dias_floracion || '66',
        alturaPlantaFicha: s.altura_planta || '1,75',
        numeroHilerasFicha: s.numero_hileras || '-',
        colorGranoFicha: s.color_grano || 'Negro estriado · 51% materia grasa',
        rendimientoFicha: rindePersonalizado || '3,8 - 4,5 t/ha',
        sanidadFicha: sanidadGuardada || [
          { nombre: 'Tolerancia a Phomopsis', puntos: 5 },
          { nombre: 'Resistencia a Downy Mildew', puntos: 5 },
          { nombre: 'Tolerancia a vuelco / quebrado', puntos: 4 },
          { nombre: 'Tolerancia a Sclerotinia', puntos: 4 }
        ],
        zonasFicha: zonas
      };
    }

    if (cultivoNombre === 'Trigo') {
      const zonas = ['Sur y Centro de Santa Fe', 'Sudeste y Oeste de Bs. As.', 'Entre Ríos', 'Sudeste de Córdoba'];
      return {
        ...s,
        cultivo: cultivoNombre,
        cultivoNombre,
        temporadasDisponibles,
        zonasAdaptacion: s.zonasAdaptacion?.length ? s.zonasAdaptacion : zonas,
        empresaElaboradora: 'Limagrain / Buck Semillas — Red Líder AgroEco',
        origenLicencia: 'Variedad Fiscalizada con Seguro de Resiembra',
        insigniaTecnologia: s.tecnologia || (s.ciclo === 'Largo' ? 'Grupo Calidad 1 · Heladas' : 'Alto Potencial Sanitario'),
        cruzamientoFicha: s.cruzamiento || 'Autógama Purificada',
        cicloFicha: cicloTexto,
        madurezFicha: s.madurez_relativa || (s.ciclo === 'Largo' ? '142' : '118'),
        diasFloracionFicha: s.dias_floracion || (s.ciclo === 'Largo' ? '96' : '82'),
        alturaPlantaFicha: s.altura_planta || '0,88',
        numeroHilerasFicha: s.numero_hileras || '-',
        colorGranoFicha: s.color_grano || 'Rojo duro panadero (Alto Gluten)',
        rendimientoFicha: rindePersonalizado || '5,5 - 7,2 t/ha',
        sanidadFicha: sanidadGuardada || [
          { nombre: 'Tolerancia a Roya Amarilla', puntos: 5 },
          { nombre: 'Tolerancia a Roya Anaranjada', puntos: 4 },
          { nombre: 'Tolerancia a Heladas en pasto', puntos: s.ciclo === 'Largo' ? 5 : 4 },
          { nombre: 'Tolerancia a Fusariosis de la espiga', puntos: 4 },
          { nombre: 'Tolerancia a Mancha Amarilla', puntos: 4 }
        ],
        zonasFicha: zonas
      };
    }

    if (cultivoNombre === 'Soja') {
      const zonas = ['Zona Núcleo', 'Centro-Sur de Santa Fe', 'Norte de Buenos Aires', 'Marcos Juárez (Córdoba)'];
      return {
        ...s,
        cultivo: cultivoNombre,
        cultivoNombre,
        temporadasDisponibles,
        zonasAdaptacion: s.zonasAdaptacion?.length ? s.zonasAdaptacion : zonas,
        empresaElaboradora: 'DonMario (GDM) / Nidera Semillas',
        origenLicencia: 'Multiplicador Oficial AgroEco',
        insigniaTecnologia: s.tecnologia || 'Enlist E3 / STS',
        cruzamientoFicha: s.cruzamiento || 'Variedad Grupo IV Medio',
        cicloFicha: cicloTexto,
        madurezFicha: s.madurez_relativa || 'GM 4.6',
        diasFloracionFicha: s.dias_floracion || '54',
        alturaPlantaFicha: s.altura_planta || '0,95',
        numeroHilerasFicha: s.numero_hileras || '-',
        colorGranoFicha: s.color_grano || 'Amarillo hilo castaño',
        rendimientoFicha: rindePersonalizado || '4,2 - 5,4 t/ha',
        sanidadFicha: sanidadGuardada || [
          { nombre: 'Tolerancia a Mancha Ojo de Rana (MOR)', puntos: 5 },
          { nombre: 'Tolerancia a Phytophthora', puntos: 4 },
          { nombre: 'Tolerancia a Cancro del Tallo', puntos: 5 },
          { nombre: 'Comportamiento frente a vuelco', puntos: 4 }
        ],
        zonasFicha: zonas
      };
    }

    const esDekalb = nombreMayusculas.includes('DK');
    const zonas = ['Zona Núcleo', 'Centro y Sur de Santa Fe', 'Córdoba', 'Entre Ríos', 'Buenos Aires', 'La Pampa'];
    return {
      ...s,
      cultivo: 'Maíz',
      cultivoNombre: 'Maíz',
      temporadasDisponibles,
      zonasAdaptacion: s.zonasAdaptacion?.length ? s.zonasAdaptacion : zonas,
      empresaElaboradora: esDekalb
        ? 'Dekalb (Bayer CropScience) · Distribuidor Oficial AgroEco'
        : 'Limagrain (LG Semillas · 60 años) · Semillero Oficial',
      origenLicencia: 'Seguro de Resiembra 100% + Guarda en Cámara Fría sin costo',
      insigniaTecnologia: s.tecnologia || (esDekalb ? 'VT Triple PRO (VT3P)' : 'VIP3'),
      cruzamientoFicha: s.cruzamiento || (s.tipo === 'COMUN' ? 'Variedad Abierta' : 'Simple'),
      cicloFicha: cicloTexto,
      madurezFicha: s.madurez_relativa || '120',
      diasFloracionFicha: s.dias_floracion || '73',
      alturaPlantaFicha: s.altura_planta || '2,11',
      numeroHilerasFicha: s.numero_hileras || '18',
      colorGranoFicha: s.color_grano || 'Semidentado amarillo',
      rendimientoFicha: rindePersonalizado || '11,5 - 14,2 t/ha',
      sanidadFicha: sanidadGuardada || [
        { nombre: 'Tolerancia Roya', puntos: 4 },
        { nombre: 'Tolerancia a enfermedades de espiga', puntos: 5 },
        { nombre: 'Tolerancia a Mal de Río IV', puntos: 4 },
        { nombre: 'Tolerancia a Tizón', puntos: 4 },
        { nombre: 'Tolerancia a Cercóspora', puntos: 4 }
      ],
      zonasFicha: zonas
    };
  }
}
