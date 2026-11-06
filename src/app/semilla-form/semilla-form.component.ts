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

import { SemillaService } from '../shared/semilla.service';
import { ItemSanidad, TipoCiclo } from '../shared/models/semilla.model';

const SANIDAD_POR_CULTIVO: Record<number, ItemSanidad[]> = {
  1: [
    { nombre: 'Tolerancia a Mancha Ojo de Rana (MOR)', puntos: 5 },
    { nombre: 'Tolerancia a Phytophthora', puntos: 4 },
    { nombre: 'Tolerancia a Cancro del Tallo', puntos: 5 },
    { nombre: 'Comportamiento frente a vuelco', puntos: 4 },
  ],
  2: [
    { nombre: 'Tolerancia Roya', puntos: 4 },
    { nombre: 'Tolerancia a enfermedades de espiga', puntos: 5 },
    { nombre: 'Tolerancia a Mal de Río IV', puntos: 4 },
    { nombre: 'Tolerancia a Tizón', puntos: 4 },
    { nombre: 'Tolerancia a Cercóspora', puntos: 4 },
  ],
  3: [
    { nombre: 'Tolerancia a Roya Amarilla', puntos: 5 },
    { nombre: 'Tolerancia a Roya Anaranjada', puntos: 4 },
    { nombre: 'Tolerancia a Heladas en pasto', puntos: 5 },
    { nombre: 'Tolerancia a Fusariosis de la espiga', puntos: 4 },
    { nombre: 'Tolerancia a Mancha Amarilla', puntos: 4 },
  ],
  4: [
    { nombre: 'Tolerancia a Phomopsis', puntos: 5 },
    { nombre: 'Resistencia a Downy Mildew', puntos: 5 },
    { nombre: 'Tolerancia a vuelco / quebrado', puntos: 4 },
    { nombre: 'Tolerancia a Sclerotinia', puntos: 4 },
  ],
};

@Component({
  selector: 'app-semilla-form',
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
  templateUrl: './semilla-form.component.html',
  styleUrl: './semilla-form.component.css',
})
export class SemillaFormComponent implements OnInit {
  private readonly constructorFormulario = inject(FormBuilder);
  readonly semillaId = signal<string | null>(null);
  readonly cargando = signal(false);
  readonly errorCarga = signal(false);
  readonly esEdicion = computed(() => this.semillaId() !== null);
  readonly guardando = signal(false);
  readonly mensajeError = signal('');

  readonly cultivosOpciones = [
    { id: 1, nombre: 'Soja' },
    { id: 2, nombre: 'Maíz' },
    { id: 3, nombre: 'Trigo' },
    { id: 4, nombre: 'Girasol' },
  ];

  readonly ciclosOpciones: { valor: TipoCiclo; etiqueta: string }[] = [
    { valor: 'Corto', etiqueta: 'Corto' },
    { valor: 'Medio', etiqueta: 'Intermedio (Medio)' },
    { valor: 'Largo', etiqueta: 'Largo' },
  ];

  readonly puntajesSanidad = [
    { valor: 5, etiqueta: '5 ★★★★★ (Muy Alta)' },
    { valor: 4, etiqueta: '4 ★★★★☆ (Alta)' },
    { valor: 3, etiqueta: '3 ★★★☆☆ (Media)' },
    { valor: 2, etiqueta: '2 ★★☆☆☆ (Moderada)' },
    { valor: 1, etiqueta: '1 ★☆☆☆☆ (Baja)' },
  ];

  readonly formulario = this.constructorFormulario.nonNullable.group({
    codigo: ['AGRO-001', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
    nombre: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(255)]],
    cultivo_id: [2, [Validators.required]],
    tecnologia: ['VIP3'],
    tipo: ['HIBRIDA', [Validators.required]],
    categoria: ['PRIMERA', [Validators.required]],
    ciclo: ['Medio' as TipoCiclo, [Validators.required]],
    cruzamiento: ['Simple'],
    madurez_relativa: ['120'],
    dias_floracion: ['73'],
    color_grano: ['Semidentado amarillo'],
    altura_planta: ['2,11'],
    numero_hileras: ['18'],
    stock: [50, [Validators.required, Validators.min(0)]],
    rendimiento_estimado: [12.5, [Validators.required, Validators.min(0)]],
    descripcion: ['Estabilidad y potencial en todos los ambientes.'],
    caracteristicas: [''],
    activo: [true],
    sanidad: this.constructorFormulario.array<FormGroup>([]),
  });

  get arregloSanidad(): FormArray<FormGroup> {
    return this.formulario.controls.sanidad;
  }

  constructor(
    private readonly route: ActivatedRoute,
    private readonly semillaService: SemillaService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.semillaId.set(id);

    if (id) {
      this.cargarSemilla(id);
    } else {
      const sugerido = `LG-${Math.floor(30000 + Math.random() * 999)}`;
      this.formulario.controls.codigo.setValue(sugerido);
      this.cargarSanidadInicial(SANIDAD_POR_CULTIVO[2]);
    }
  }

  alCambiarCultivo(cultivoId: number): void {
    if (!this.esEdicion()) {
      const plantilla = SANIDAD_POR_CULTIVO[cultivoId] || SANIDAD_POR_CULTIVO[2];
      this.cargarSanidadInicial(plantilla);
    }
  }

  private crearGrupoSanidad(item: ItemSanidad): FormGroup {
    return this.constructorFormulario.nonNullable.group({
      nombre: [item.nombre, [Validators.required]],
      puntos: [Number(item.puntos) || 4, [Validators.required, Validators.min(1), Validators.max(5)]],
    });
  }

  private cargarSanidadInicial(items: ItemSanidad[]): void {
    this.arregloSanidad.clear();
    for (const item of items) {
      this.arregloSanidad.push(this.crearGrupoSanidad(item));
    }
  }

  agregarItemSanidad(): void {
    this.arregloSanidad.push(
      this.crearGrupoSanidad({ nombre: 'Nueva tolerancia sanitaria', puntos: 4 })
    );
  }

  eliminarItemSanidad(indice: number): void {
    if (this.arregloSanidad.length > 1) {
      this.arregloSanidad.removeAt(indice);
    }
  }

  private cargarSemilla(id: string): void {
    this.cargando.set(true);
    this.mensajeError.set('');

    this.semillaService
      .obtenerSemillaPorId(id)
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (semilla) => {
          const cultivoId = Number(semilla.cultivo_id) || 2;
          this.formulario.patchValue({
            codigo: semilla.codigo ?? `AGRO-${semilla.id}`,
            nombre: semilla.nombre,
            cultivo_id: cultivoId,
            tecnologia: semilla.tecnologia ?? 'VIP3',
            tipo: semilla.tipo === 'COMUN' ? 'COMUN' : 'HIBRIDA',
            categoria: semilla.categoria === 'SEGUNDA' ? 'SEGUNDA' : 'PRIMERA',
            ciclo: (semilla.ciclo as TipoCiclo) ?? 'Medio',
            cruzamiento: semilla.cruzamiento ?? 'Simple',
            madurez_relativa: semilla.madurez_relativa ?? '120',
            dias_floracion: semilla.dias_floracion ?? '73',
            color_grano: semilla.color_grano ?? 'Semidentado amarillo',
            altura_planta: semilla.altura_planta ?? '2,11',
            numero_hileras: semilla.numero_hileras ?? '18',
            stock: semilla.stock !== undefined ? Number(semilla.stock) : 50,
            rendimiento_estimado:
              semilla.rendimiento_estimado !== undefined
                ? Number(semilla.rendimiento_estimado)
                : 12.5,
            descripcion: semilla.descripcion ?? '',
            caracteristicas: semilla.caracteristicas ?? '',
            activo: semilla.activo ?? true,
          });

          const sanidadActual =
            Array.isArray(semilla.sanidad) && semilla.sanidad.length > 0
              ? semilla.sanidad
              : SANIDAD_POR_CULTIVO[cultivoId] || SANIDAD_POR_CULTIVO[2];
          this.cargarSanidadInicial(sanidadActual);
        },
        error: () => {
          this.errorCarga.set(true);
          this.mensajeError.set('No se pudo cargar la semilla solicitada desde el servidor.');
        },
      });
  }

  guardarSemilla(): void {
    if (this.guardando() || this.cargando() || this.errorCarga()) return;

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const id = this.semillaId();
    const datosFormulario = this.formulario.getRawValue();
    const categoria = datosFormulario.categoria === 'SEGUNDA' ? 'SEGUNDA' : 'PRIMERA';
    const datosEnvio = {
      ...datosFormulario,
      categoria: categoria as 'PRIMERA' | 'SEGUNDA',
      sanidad: datosFormulario.sanidad.map((item: any) => ({
        nombre: String(item.nombre || '').trim(),
        puntos: Number(item.puntos) || 4,
      })),
    };

    this.guardando.set(true);
    this.mensajeError.set('');

    const peticion$ = id
      ? this.semillaService.actualizarSemilla(id, datosEnvio)
      : this.semillaService.crearSemilla(datosEnvio);

    peticion$.pipe(finalize(() => this.guardando.set(false))).subscribe({
      next: (semillaGuardada) => {
        this.router.navigate(['/admin/panel'], {
          queryParams: {
            alerta: id ? 'editada' : 'creada',
            nombre: semillaGuardada?.nombre || datosEnvio.nombre,
          },
        });
      },
      error: (err) => {
        const errorServidor = err?.error?.error || err?.error?.message || '';
        this.mensajeError.set(
          `No se pudo ${id ? 'actualizar' : 'crear'} la semilla en el servidor. ${errorServidor || 'Revisá los datos e intentá nuevamente.'}`,
        );
      },
    });
  }
}
