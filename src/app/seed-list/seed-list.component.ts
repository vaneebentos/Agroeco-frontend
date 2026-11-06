import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, timeout } from 'rxjs';

import { Seed } from '../shared/seed';
import { SeedService } from '../shared/seed.service';
import { QuoteService } from '../core/services/quote.service';

export interface ExtendedSeedSheet extends Seed {
  manufacturer: string;
  licenseOrigin: string;
  cropName: string;
  technologyBadge: string;
  crossingSheet: string;
  cycleSheet: string;
  maturitySheet: string;
  floweringDaysSheet: string;
  plantHeightSheet: string;
  rowCountSheet: string;
  grainColorSheet: string;
  yieldSheet: string;
  healthSheet: { name: string; points: number }[];
  zonesSheet: string[];
}

const DEFAULT_AVAILABLE_SEASONS = ['2025/26 Temprana', '2025/26 Tardía'];

const ROUTE_TO_CROP: Record<string, string> = {
  maiz: 'Maíz',
  'maíz': 'Maíz',
  girasol: 'Girasol',
  trigo: 'Trigo',
  soja: 'Soja',
};

const CROP_TO_ROUTE: Record<string, string> = {
  'Maíz': 'maiz',
  Girasol: 'girasol',
  Trigo: 'trigo',
  Soja: 'soja',
};

@Component({
  selector: 'app-seed-list',
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
  templateUrl: './seed-list.component.html',
  styleUrl: './seed-list.component.css'
})
export class SeedListComponent implements OnInit {
  readonly seedList = signal<ExtendedSeedSheet[]>([]);
  readonly catalogTable = signal<ExtendedSeedSheet[]>([]);
  readonly loading = signal(false);
  readonly loadingTable = signal(false);
  readonly errorMessage = signal('');
  readonly cropFilter = signal<string>('TODOS');
  readonly deletingIds = signal<Set<string>>(new Set());

  // Customer view (/ or /semilla/:crop) vs admin view (/admin/panel and /admin/panel/catalogo)
  readonly isAdminMode = signal(false);
  readonly isCatalogTableView = signal(false);

  // Notification banner (seed created, edited, deleted or added to quote)
  readonly alertMessage = signal('');
  readonly alertType = signal<'success' | 'edit' | 'deleted'>('success');

  readonly catalogCategories = [
    { code: 'TODOS', title: 'Catálogo Completo', subtitle: 'Todas las variedades e híbridos disponibles', icon: 'grid_view', color: '#1b4332' },
    { code: 'Maíz', title: 'Maíz Híbrido', subtitle: 'Alta potencialidad VIP3 y VT3PRO para grano y silaje', icon: 'grass', color: '#ca8a04' },
    { code: 'Girasol', title: 'Girasol', subtitle: 'Híbridos Clearfield de alto contenido graso', icon: 'wb_sunny', color: '#d97706' },
    { code: 'Trigo', title: 'Trigo', subtitle: 'Ciclos cortos, intermedios y largos de alta sanidad', icon: 'grain', color: '#9a3412' },
    { code: 'Soja', title: 'Soja', subtitle: 'Variedades adaptadas a Zona Núcleo, Centro y Norte', icon: 'spa', color: '#15803d' },
  ];

  readonly filteredSeeds = computed(() => {
    const filter = this.cropFilter();
    const list = this.seedList();
    if (filter === 'TODOS') return list;
    return list.filter(s => s.cropName.toLowerCase() === filter.toLowerCase());
  });

  readonly activeCatalogSeeds = computed(() =>
    this.catalogTable().filter(s => !s.deleted)
  );

  readonly deletedCatalogSeeds = computed(() =>
    this.catalogTable().filter(s => Boolean(s.deleted))
  );

  constructor(
    private readonly seedService: SeedService,
    private readonly quoteService: QuoteService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const currentUrl = this.router.url;
    this.isAdminMode.set(currentUrl.includes('admin'));
    this.isCatalogTableView.set(currentUrl.includes('admin/panel/catalogo'));

    this.route.paramMap.subscribe(params => {
      const cropRoute = params.get('crop')?.toLowerCase().trim() || '';
      if (cropRoute && ROUTE_TO_CROP[cropRoute]) {
        this.cropFilter.set(ROUTE_TO_CROP[cropRoute]);
      } else if (!this.isAdminMode()) {
        this.cropFilter.set('TODOS');
      }
    });

    this.route.queryParamMap.subscribe(params => {
      const alert = params.get('alert');
      const name = params.get('name') || 'la semilla';
      if (alert === 'created') {
        this.showAlert(
          `¡Semilla "${name}" creada correctamente!`,
          'success'
        );
      } else if (alert === 'edited') {
        this.showAlert(
          `¡Los cambios de la semilla "${name}" se guardaron correctamente!`,
          'edit'
        );
      }
    });

    this.normalizeCartSeasons();
    this.loadSeeds();
    if (this.isAdminMode()) {
      this.loadCatalogTable();
    }
  }

  goToCatalogTable(): void {
    this.isCatalogTableView.set(true);
    this.router.navigate(['/admin/panel/catalogo']);
    this.loadCatalogTable();
  }

  backToAdminSheets(): void {
    this.isCatalogTableView.set(false);
    this.router.navigate(['/admin/panel']);
    this.loadSeeds();
  }

  loadCatalogTable(): void {
    this.loadingTable.set(true);
    this.errorMessage.set('');

    this.seedService
      .getAdminCatalog()
      .pipe(
        timeout({ first: 10000 }),
        finalize(() => {
          this.loadingTable.set(false);
        })
      )
      .subscribe({
        next: (seeds) => {
          const enriched = seeds.map(s => this.enrichSheet(s));
          this.catalogTable.set(enriched);
        },
        error: (err) => {
          console.error('Error al cargar listado de semillas:', err);
          this.errorMessage.set(
            'No se pudo obtener el listado de semillas. Intentá nuevamente.'
          );
        }
      });
  }

  showAlert(message: string, type: 'success' | 'edit' | 'deleted'): void {
    this.alertMessage.set(message);
    this.alertType.set(type);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setTimeout(() => {
      if (this.alertMessage() === message) {
        this.alertMessage.set('');
      }
    }, 6500);
  }

  closeAlert(): void {
    this.alertMessage.set('');
  }

  selectCrop(code: string): void {
    this.cropFilter.set(code);

    if (!this.isAdminMode()) {
      if (code === 'TODOS') {
        this.router.navigate(['/']);
      } else {
        const cropRoute = CROP_TO_ROUTE[code] || code.toLowerCase();
        this.router.navigate(['/semilla', cropRoute]);
      }
    }
  }

  loadSeeds(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.seedService
      .getSeeds()
      .pipe(
        timeout({ first: 10000 }),
        finalize(() => {
          this.loading.set(false);
        })
      )
      .subscribe({
        next: (seeds) => {
          const enriched = seeds.map(s => this.enrichSheet(s));
          this.seedList.set(enriched);
          this.normalizeCartSeasons();
        },
        error: (err) => {
          console.error('Error al cargar semillas:', err);
          this.errorMessage.set(
            'No se pudo cargar el catálogo de semillas. Intentá nuevamente.'
          );
        }
      });
  }

  addToQuote(seed: ExtendedSeedSheet): void {
    const seedWithSeasons: ExtendedSeedSheet = {
      ...seed,
      crop: seed.crop || seed.cropName,
      availableSeasons:
        seed.availableSeasons && seed.availableSeasons.length >= 2
          ? seed.availableSeasons
          : DEFAULT_AVAILABLE_SEASONS
    };

    const existing = this.quoteService
      .items()
      .find(i => i.seedId === Number(seedWithSeasons.id));

    if (
      existing &&
      (!existing.seed.availableSeasons || existing.seed.availableSeasons.length < 2)
    ) {
      const previousHectares = Number(existing.hectares) || 0;
      const previousSeason = existing.season || DEFAULT_AVAILABLE_SEASONS[0];
      this.quoteService.removeItem(Number(seedWithSeasons.id));
      this.quoteService.addItem(seedWithSeasons, previousHectares + 50, previousSeason);
    } else {
      this.quoteService.addItem(seedWithSeasons);
    }

    this.showAlert(`Se añadió "${seed.name}" al carrito.`, 'success');
  }

  deleteSeed(seed: ExtendedSeedSheet): void {
    const idText = String(seed.id);
    if (this.deletingIds().has(idText)) return;

    const confirmed = window.confirm(
      `¿Seguro que querés eliminar la semilla "${seed.name}"?`
    );
    if (!confirmed) {
      return;
    }

    this.deletingIds.update(ids => new Set(ids).add(idText));

    this.seedService
      .deleteSeed(idText)
      .pipe(
        finalize(() =>
          this.deletingIds.update(ids => {
            const remaining = new Set(ids);
            remaining.delete(idText);
            return remaining;
          })
        )
      )
      .subscribe({
        next: () => {
          this.seedList.update(seeds =>
            seeds.filter(item => String(item.id) !== idText)
          );
          this.loadCatalogTable();
          this.showAlert(
            `¡La semilla "${seed.name}" fue eliminada correctamente!`,
            'deleted'
          );
        },
        error: (err) => {
          console.error('Error al eliminar semilla:', err);
          this.showAlert(
            `No se pudo eliminar la semilla "${seed.name}". Intentá nuevamente.`,
            'deleted'
          );
        }
      });
  }

  starsArray(points: number): boolean[] {
    return [1, 2, 3, 4, 5].map(i => i <= points);
  }

  private normalizeCartSeasons(): void {
    const currentItems = this.quoteService.items();
    for (const item of currentItems) {
      if (!item.seed.availableSeasons || item.seed.availableSeasons.length < 2) {
        const normalizedSeed: Seed = {
          ...item.seed,
          availableSeasons: DEFAULT_AVAILABLE_SEASONS
        };
        const ha = Number(item.hectares) || 50;
        const season = item.season || DEFAULT_AVAILABLE_SEASONS[0];
        this.quoteService.removeItem(item.seedId);
        this.quoteService.addItem(normalizedSeed, ha, season);
      }
    }
  }

  private enrichSheet(s: Seed): ExtendedSeedSheet {
    const upperName = (s.name || '').toUpperCase();
    const cropMap: Record<number, string> = {
      1: 'Soja',
      2: 'Maíz',
      3: 'Trigo',
      4: 'Girasol'
    };

    let cropName =
      (s.cropId ? cropMap[Number(s.cropId)] : '') ||
      s.crop ||
      '';

    if (!cropName) {
      if (upperName.includes('TRIGO')) cropName = 'Trigo';
      else if (upperName.includes('GIRASOL') || upperName.includes('5710')) cropName = 'Girasol';
      else if (upperName.includes('SOJA') || upperName.includes('DM')) cropName = 'Soja';
      else cropName = 'Maíz';
    }

    const availableSeasons =
      s.availableSeasons && s.availableSeasons.length >= 2
        ? s.availableSeasons
        : DEFAULT_AVAILABLE_SEASONS;

    const customYield =
      s.estimatedYield !== undefined && s.estimatedYield !== null
        ? `${s.estimatedYield} ${s.yieldUnit || 't/ha'}`
        : null;

    const cycleText = s.cycle === 'Medio' ? 'Intermedio' : (s.cycle || 'Intermedio');
    const savedHealth =
      Array.isArray(s.health) && s.health.length > 0 ? s.health : null;

    if (cropName === 'Girasol') {
      const zones = ['Centro-Norte Santa Fe', 'Córdoba', 'Entre Ríos', 'Oeste de Buenos Aires', 'La Pampa'];
      return {
        ...s,
        crop: cropName,
        cropName,
        availableSeasons,
        adaptationZones: s.adaptationZones?.length ? s.adaptationZones : zones,
        manufacturer: 'Limagrain (LG Semillas) · Tecnología Clearfield® (BASF)',
        licenseOrigin: 'Semillero Oficial Fiscalizado — Guarda en Cámara Fría Incluida',
        technologyBadge: s.technology || 'Clearfield CL',
        crossingSheet: s.crossing || (s.type === 'COMUN' ? 'Variedad Polinización Abierta' : 'Simple'),
        cycleSheet: cycleText,
        maturitySheet: String(s.relativeMaturity || '108'),
        floweringDaysSheet: s.floweringDays || '66',
        plantHeightSheet: s.plantHeight || '1,75',
        rowCountSheet: s.rowCount || '-',
        grainColorSheet: s.grainColor || 'Negro estriado · 51% materia grasa',
        yieldSheet: customYield || '3,8 - 4,5 t/ha',
        healthSheet: savedHealth || [
          { name: 'Tolerancia a Phomopsis', points: 5 },
          { name: 'Resistencia a Downy Mildew', points: 5 },
          { name: 'Tolerancia a vuelco / quebrado', points: 4 },
          { name: 'Tolerancia a Sclerotinia', points: 4 }
        ],
        zonesSheet: zones
      };
    }

    if (cropName === 'Trigo') {
      const zones = ['Sur y Centro de Santa Fe', 'Sudeste y Oeste de Bs. As.', 'Entre Ríos', 'Sudeste de Córdoba'];
      return {
        ...s,
        crop: cropName,
        cropName,
        availableSeasons,
        adaptationZones: s.adaptationZones?.length ? s.adaptationZones : zones,
        manufacturer: 'Limagrain / Buck Semillas — Red Líder AgroEco',
        licenseOrigin: 'Variedad Fiscalizada con Seguro de Resiembra',
        technologyBadge: s.technology || (s.cycle === 'Largo' ? 'Grupo Calidad 1 · Heladas' : 'Alto Potencial Sanitario'),
        crossingSheet: s.crossing || 'Autógama Purificada',
        cycleSheet: cycleText,
        maturitySheet: String(s.relativeMaturity || (s.cycle === 'Largo' ? '142' : '118')),
        floweringDaysSheet: s.floweringDays || (s.cycle === 'Largo' ? '96' : '82'),
        plantHeightSheet: s.plantHeight || '0,88',
        rowCountSheet: s.rowCount || '-',
        grainColorSheet: s.grainColor || 'Rojo duro panadero (Alto Gluten)',
        yieldSheet: customYield || '5,5 - 7,2 t/ha',
        healthSheet: savedHealth || [
          { name: 'Tolerancia a Roya Amarilla', points: 5 },
          { name: 'Tolerancia a Roya Anaranjada', points: 4 },
          { name: 'Tolerancia a Heladas en pasto', points: s.cycle === 'Largo' ? 5 : 4 },
          { name: 'Tolerancia a Fusariosis de la espiga', points: 4 },
          { name: 'Tolerancia a Mancha Amarilla', points: 4 }
        ],
        zonesSheet: zones
      };
    }

    if (cropName === 'Soja') {
      const zones = ['Zona Núcleo', 'Centro-Sur de Santa Fe', 'Norte de Buenos Aires', 'Marcos Juárez (Córdoba)'];
      return {
        ...s,
        crop: cropName,
        cropName,
        availableSeasons,
        adaptationZones: s.adaptationZones?.length ? s.adaptationZones : zones,
        manufacturer: 'DonMario (GDM) / Nidera Semillas',
        licenseOrigin: 'Multiplicador Oficial AgroEco',
        technologyBadge: s.technology || 'Enlist E3 / STS',
        crossingSheet: s.crossing || 'Variedad Grupo IV Medio',
        cycleSheet: cycleText,
        maturitySheet: String(s.relativeMaturity || 'GM 4.6'),
        floweringDaysSheet: s.floweringDays || '54',
        plantHeightSheet: s.plantHeight || '0,95',
        rowCountSheet: s.rowCount || '-',
        grainColorSheet: s.grainColor || 'Amarillo hilo castaño',
        yieldSheet: customYield || '4,2 - 5,4 t/ha',
        healthSheet: savedHealth || [
          { name: 'Tolerancia a Mancha Ojo de Rana (MOR)', points: 5 },
          { name: 'Tolerancia a Phytophthora', points: 4 },
          { name: 'Tolerancia a Cancro del Tallo', points: 5 },
          { name: 'Comportamiento frente a vuelco', points: 4 }
        ],
        zonesSheet: zones
      };
    }

    const isDekalb = upperName.includes('DK');
    const zones = ['Zona Núcleo', 'Centro y Sur de Santa Fe', 'Córdoba', 'Entre Ríos', 'Buenos Aires', 'La Pampa'];
    return {
      ...s,
      crop: 'Maíz',
      cropName: 'Maíz',
      availableSeasons,
      adaptationZones: s.adaptationZones?.length ? s.adaptationZones : zones,
      manufacturer: isDekalb
        ? 'Dekalb (Bayer CropScience) · Distribuidor Oficial AgroEco'
        : 'Limagrain (LG Semillas · 60 años) · Semillero Oficial',
      licenseOrigin: 'Seguro de Resiembra 100% + Guarda en Cámara Fría sin costo',
      technologyBadge: s.technology || (isDekalb ? 'VT Triple PRO (VT3P)' : 'VIP3'),
      crossingSheet: s.crossing || (s.type === 'COMUN' ? 'Variedad Abierta' : 'Simple'),
      cycleSheet: cycleText,
      maturitySheet: String(s.relativeMaturity || '120'),
      floweringDaysSheet: s.floweringDays || '73',
      plantHeightSheet: s.plantHeight || '2,11',
      rowCountSheet: s.rowCount || '18',
      grainColorSheet: s.grainColor || 'Semidentado amarillo',
      yieldSheet: customYield || '11,5 - 14,2 t/ha',
      healthSheet: savedHealth || [
        { name: 'Tolerancia Roya', points: 4 },
        { name: 'Tolerancia a enfermedades de espiga', points: 5 },
        { name: 'Tolerancia a Mal de Río IV', points: 4 },
        { name: 'Tolerancia a Tizón', points: 4 },
        { name: 'Tolerancia a Cercóspora', points: 4 }
      ],
      zonesSheet: zones
    };
  }
}
