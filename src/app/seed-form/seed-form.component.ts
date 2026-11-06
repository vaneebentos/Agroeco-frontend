import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { SeedService } from '../shared/seed.service';
import { HealthItem, CycleType } from '../shared/models/seed.model';

const HEALTH_BY_CROP: Record<number, HealthItem[]> = {
  1: [
    { name: 'Tolerancia a Mancha Ojo de Rana (MOR)', points: 5 },
    { name: 'Tolerancia a Phytophthora', points: 4 },
    { name: 'Tolerancia a Cancro del Tallo', points: 5 },
    { name: 'Comportamiento frente a vuelco', points: 4 },
  ],
  2: [
    { name: 'Tolerancia Roya', points: 4 },
    { name: 'Tolerancia a enfermedades de espiga', points: 5 },
    { name: 'Tolerancia a Mal de Río IV', points: 4 },
    { name: 'Tolerancia a Tizón', points: 4 },
    { name: 'Tolerancia a Cercóspora', points: 4 },
  ],
  3: [
    { name: 'Tolerancia a Roya Amarilla', points: 5 },
    { name: 'Tolerancia a Roya Anaranjada', points: 4 },
    { name: 'Tolerancia a Heladas en pasto', points: 5 },
    { name: 'Tolerancia a Fusariosis de la espiga', points: 4 },
    { name: 'Tolerancia a Mancha Amarilla', points: 4 },
  ],
  4: [
    { name: 'Tolerancia a Phomopsis', points: 5 },
    { name: 'Resistencia a Downy Mildew', points: 5 },
    { name: 'Tolerancia a vuelco / quebrado', points: 4 },
    { name: 'Tolerancia a Sclerotinia', points: 4 },
  ],
};

@Component({
  selector: 'app-seed-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
  templateUrl: './seed-form.component.html',
  styleUrl: './seed-form.component.css',
})
export class SeedFormComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  readonly seedId = signal<string | null>(null);
  readonly loading = signal(false);
  readonly loadError = signal(false);
  readonly isEditMode = computed(() => this.seedId() !== null);
  readonly saving = signal(false);
  readonly errorMessage = signal('');

  readonly cropOptions = [
    { id: 1, name: 'Soja' },
    { id: 2, name: 'Maíz' },
    { id: 3, name: 'Trigo' },
    { id: 4, name: 'Girasol' },
  ];

  readonly cycleOptions: { value: CycleType; label: string }[] = [
    { value: 'Corto', label: 'Corto' },
    { value: 'Medio', label: 'Intermedio (Medio)' },
    { value: 'Largo', label: 'Largo' },
  ];

  readonly healthScores = [
    { value: 5, label: '5 ★★★★★ (Muy Alta)' },
    { value: 4, label: '4 ★★★★☆ (Alta)' },
    { value: 3, label: '3 ★★★☆☆ (Media)' },
    { value: 2, label: '2 ★★☆☆☆ (Moderada)' },
    { value: 1, label: '1 ★☆☆☆☆ (Baja)' },
  ];

  readonly form = this.formBuilder.nonNullable.group({
    code: ['AGRO-001', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
    name: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(255)]],
    cropId: [2, [Validators.required]],
    technology: ['VIP3'],
    type: ['HIBRIDA', [Validators.required]],
    category: ['PRIMERA', [Validators.required]],
    cycle: ['Medio' as CycleType, [Validators.required]],
    crossing: ['Simple'],
    relativeMaturity: ['120'],
    floweringDays: ['73'],
    grainColor: ['Semidentado amarillo'],
    plantHeight: ['2,11'],
    rowCount: ['18'],
    stock: [50, [Validators.required, Validators.min(0)]],
    estimatedYield: [12.5, [Validators.required, Validators.min(0)]],
    description: ['Estabilidad y potencial en todos los ambientes.'],
    characteristics: [''],
    active: [true],
    health: this.formBuilder.array<FormGroup>([]),
  });

  get healthArray(): FormArray<FormGroup> {
    return this.form.controls.health;
  }

  constructor(
    private readonly route: ActivatedRoute,
    private readonly seedService: SeedService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.seedId.set(id);

    if (id) {
      this.loadSeed(id);
    } else {
      const suggested = `LG-${Math.floor(30000 + Math.random() * 999)}`;
      this.form.controls.code.setValue(suggested);
      this.loadInitialHealth(HEALTH_BY_CROP[2]);
    }
  }

  onCropChange(cropId: number): void {
    if (!this.isEditMode()) {
      const template = HEALTH_BY_CROP[cropId] || HEALTH_BY_CROP[2];
      this.loadInitialHealth(template);
    }
  }

  private createHealthGroup(item: HealthItem): FormGroup {
    return this.formBuilder.nonNullable.group({
      name: [item.name, [Validators.required]],
      points: [Number(item.points) || 4, [Validators.required, Validators.min(1), Validators.max(5)]],
    });
  }

  private loadInitialHealth(items: HealthItem[]): void {
    this.healthArray.clear();
    for (const item of items) {
      this.healthArray.push(this.createHealthGroup(item));
    }
  }

  addHealthItem(): void {
    this.healthArray.push(
      this.createHealthGroup({ name: 'Nueva tolerancia sanitaria', points: 4 })
    );
  }

  removeHealthItem(index: number): void {
    if (this.healthArray.length > 1) {
      this.healthArray.removeAt(index);
    }
  }

  private loadSeed(id: string): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.seedService
      .getSeedById(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (seed) => {
          const cropId = Number(seed.cropId) || 2;
          this.form.patchValue({
            code: seed.code ?? `AGRO-${seed.id}`,
            name: seed.name,
            cropId: cropId,
            technology: seed.technology ?? 'VIP3',
            type: seed.type === 'COMUN' ? 'COMUN' : 'HIBRIDA',
            category: seed.category === 'SEGUNDA' ? 'SEGUNDA' : 'PRIMERA',
            cycle: (seed.cycle as CycleType) ?? 'Medio',
            crossing: seed.crossing ?? 'Simple',
            relativeMaturity: seed.relativeMaturity !== undefined && seed.relativeMaturity !== null
              ? String(seed.relativeMaturity)
              : '120',
            floweringDays: seed.floweringDays ?? '73',
            grainColor: seed.grainColor ?? 'Semidentado amarillo',
            plantHeight: seed.plantHeight ?? '2,11',
            rowCount: seed.rowCount ?? '18',
            stock: seed.stock !== undefined ? Number(seed.stock) : 50,
            estimatedYield:
              seed.estimatedYield !== undefined
                ? Number(seed.estimatedYield)
                : 12.5,
            description: seed.description ?? '',
            characteristics: seed.characteristics ?? '',
            active: seed.active ?? true,
          });

          const currentHealth =
            Array.isArray(seed.health) && seed.health.length > 0
              ? seed.health
              : HEALTH_BY_CROP[cropId] || HEALTH_BY_CROP[2];
          this.loadInitialHealth(currentHealth);
        },
        error: () => {
          this.loadError.set(true);
          this.errorMessage.set('No se pudo cargar la semilla solicitada desde el servidor.');
        },
      });
  }

  saveSeed(): void {
    if (this.saving() || this.loading() || this.loadError()) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const id = this.seedId();
    const formData = this.form.getRawValue();
    const category = formData.category === 'SEGUNDA' ? 'SEGUNDA' : 'PRIMERA';
    const payload = {
      ...formData,
      category: category as 'PRIMERA' | 'SEGUNDA',
      health: formData.health.map((item: any) => ({
        name: String(item.name || '').trim(),
        points: Number(item.points) || 4,
      })),
    };

    this.saving.set(true);
    this.errorMessage.set('');

    const request$ = id
      ? this.seedService.updateSeed(id, payload)
      : this.seedService.createSeed(payload);

    request$.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: (savedSeed) => {
        this.router.navigate(['/admin/panel'], {
          queryParams: {
            alert: id ? 'edited' : 'created',
            name: savedSeed?.name || payload.name,
          },
        });
      },
      error: (err) => {
        const serverError = err?.error?.error || err?.error?.message || '';
        this.errorMessage.set(
          `No se pudo ${id ? 'actualizar' : 'crear'} la semilla en el servidor. ${serverError || 'Revisá los datos e intentá nuevamente.'}`,
        );
      },
    });
  }
}
