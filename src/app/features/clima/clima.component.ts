import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface MesClima {
  mes: string;
  lluvia2024: number;
  lluvia2025: number;
  vientoMaxKmH: number;
  eventosGranizo: number;
}

interface EventoSevero {
  fecha: string;
  localidad: string;
  tipo: 'Granizo' | 'Viento Fuerte' | 'Lluvia Intensa';
  detalle: string;
  impactoCultivo: string;
}

@Component({
  selector: 'app-clima',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="clima-page">
      <!-- Encabezado de Central Meteorológica -->
      <div class="clima-hero">
        <div>
          <span class="hero-tag">CENTRAL METEOROLÓGICA AGROECO · DATOS OPEN-METEO</span>
          <h1>Historial de Lluvia, Viento y Granizo</h1>
          <p>Seguimiento agroclimático por campaña para planificación de siembra, resiembra y manejo de lotes.</p>
        </div>
        <div class="zona-selector">
          <label>Zona / Estación:</label>
          <select [(ngModel)]="zonaSeleccionada" (change)="cambiarZona()">
            <option value="esperanza">Esperanza / Centro Santa Fe</option>
            <option value="venado">Venado Tuerto / Sur Santa Fe</option>
            <option value="marcosjuarez">Marcos Juárez / Córdoba</option>
            <option value="pergamino">Pergamino / Zona Núcleo</option>
          </select>
        </div>
      </div>

      <!-- 4 Tarjetas de Resumen (Lluvia 2024, Lluvia 2025, Viento Máximo, Alertas de Granizo) -->
      <div class="summary-grid">
        <div class="summary-card rain-prev">
          <span class="card-label">Acumulado Campaña 2024</span>
          <strong class="card-value">{{ total2024() }} mm</strong>
          <span class="card-foot">Promedio histórico: 910 mm</span>
        </div>

        <div class="summary-card rain-curr">
          <span class="card-label">Acumulado Campaña 2025</span>
          <strong class="card-value">{{ total2025() }} mm</strong>
          <span class="card-foot" [class.positive]="diferenciaAnual() >= 0">
            {{ diferenciaAnual() >= 0 ? '+' : '' }}{{ diferenciaAnual() }} mm vs. 2024
          </span>
        </div>

        <div class="summary-card wind-card">
          <span class="card-label">Ráfagas Máximas Registradas</span>
          <strong class="card-value">{{ maxViento() }} km/h</strong>
          <span class="card-foot">Monitoreo de vuelco en Maíz / Girasol</span>
        </div>

        <div class="summary-card hail-card">
          <span class="card-label">Eventos de Granizo (Campaña)</span>
          <strong class="card-value">{{ totalGranizo() }} alertas</strong>
          <span class="card-foot">Cobertura de Seguro de Resiembra activa</span>
        </div>
      </div>

      <!-- Gráfico de barras comparativo mensual + Tabla -->
      <div class="clima-Panels">
        <div class="panel-card">
          <div class="panel-head">
            <h2>Comparativa Mensual de Lluvias (mm) y Viento</h2>
            <div class="legend">
              <span class="dot d2024"></span> 2024
              <span class="dot d2025"></span> 2025
              <span class="dot dwind"></span> Ráfaga máx. (km/h)
            </div>
          </div>

          <div class="bars-chart">
            <div class="bar-col" *ngFor="let m of datosMensuales()">
              <div class="bars-pair">
                <div class="bar b2024" [style.height.px]="m.lluvia2024 * 1.1" [title]="'2024: ' + m.lluvia2024 + ' mm'">
                  <span>{{ m.lluvia2024 }}</span>
                </div>
                <div class="bar b2025" [style.height.px]="m.lluvia2025 * 1.1" [title]="'2025: ' + m.lluvia2025 + ' mm'">
                  <span>{{ m.lluvia2025 }}</span>
                </div>
              </div>
              <div class="wind-chip">{{ m.vientoMaxKmH }} km/h</div>
              <div class="hail-indicator" *ngIf="m.eventosGranizo > 0" title="Granizo registrado">
                ❄️ {{ m.eventosGranizo }}
              </div>
              <span class="month-name">{{ m.mes }}</span>
            </div>
          </div>
        </div>

        <!-- Bitácora de Granizo, Viento y Lluvias severas -->
        <div class="panel-card">
          <div class="panel-head">
            <h2>Registro de Eventos de Viento, Granizo y Tormentas</h2>
          </div>

          <div class="events-list">
            <div class="event-item" *ngFor="let ev of eventosSeveros">
              <div class="event-badge" [ngClass]="ev.tipo.toLowerCase().replace(' ', '-')">
                {{ ev.tipo }}
              </div>
              <div class="event-body">
                <div class="event-top">
                  <strong>{{ ev.localidad }}</strong>
                  <span>{{ ev.fecha }}</span>
                </div>
                <p class="event-desc">{{ ev.detalle }}</p>
                <small class="event-impact">Impacto agronómico: {{ ev.impactoCultivo }}</small>
              </div>
            </div>
          </div>

          <!-- Tabla resumen mensual -->
          <table class="clima-table">
            <thead>
              <tr>
                <th>Mes</th>
                <th>Lluvia 2024</th>
                <th>Lluvia 2025</th>
                <th>Diferencia</th>
                <th>Viento Máx.</th>
                <th>Granizo</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let m of datosMensuales()">
                <td><strong>{{ m.mes }}</strong></td>
                <td>{{ m.lluvia2024 }} mm</td>
                <td>{{ m.lluvia2025 }} mm</td>
                <td [class.pos]="m.lluvia2025 - m.lluvia2024 >= 0" [class.neg]="m.lluvia2025 - m.lluvia2024 < 0">
                  {{ m.lluvia2025 - m.lluvia2024 >= 0 ? '+' : '' }}{{ m.lluvia2025 - m.lluvia2024 }} mm
                </td>
                <td>{{ m.vientoMaxKmH }} km/h</td>
                <td>
                  <span class="hail-tag" *ngIf="m.eventosGranizo > 0">{{ m.eventosGranizo }} evento(s)</span>
                  <span class="ok-tag" *ngIf="m.eventosGranizo === 0">Sin granizo</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .clima-page {
      max-width: 1340px;
      margin: 0 auto;
      padding: 1.75rem 1.25rem 3rem;
    }
    .clima-hero {
      background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
      color: #fff;
      padding: 1.75rem 2rem;
      border-radius: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1.5rem;
      flex-wrap: wrap;
      margin-bottom: 1.5rem;
    }
    .hero-tag {
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 1px;
      color: #38bdf8;
    }
    .clima-hero h1 {
      margin: 0.35rem 0;
      font-size: 1.75rem;
    }
    .clima-hero p {
      margin: 0;
      color: #cbd5e1;
      font-size: 0.95rem;
    }
    .zona-selector {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .zona-selector label {
      font-size: 0.8rem;
      color: #bae6fd;
      font-weight: 600;
    }
    .zona-selector select {
      padding: 0.6rem 1rem;
      border-radius: 10px;
      border: none;
      font-weight: 600;
      font-size: 0.95rem;
      background: #fff;
      color: #0f172a;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .summary-card {
      background: #fff;
      border-radius: 14px;
      padding: 1.25rem 1.4rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.06);
      border-left: 5px solid #0284c7;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .summary-card.rain-curr { border-left-color: #16a34a; }
    .summary-card.wind-card { border-left-color: #f59e0b; }
    .summary-card.hail-card { border-left-color: #dc2626; }
    .card-label { font-size: 0.82rem; color: #64748b; font-weight: 600; text-transform: uppercase; }
    .card-value { font-size: 1.85rem; font-weight: 800; color: #0f172a; }
    .card-foot { font-size: 0.82rem; color: #475569; }
    .card-foot.positive { color: #15803d; font-weight: 700; }

    .clima-Panels {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    .panel-card {
      background: #fff;
      border-radius: 14px;
      padding: 1.5rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.06);
    }
    .panel-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      margin-bottom: 1.25rem;
    }
    .panel-head h2 {
      margin: 0;
      font-size: 1.2rem;
      color: #1e293b;
    }
    .legend {
      display: flex;
      align-items: center;
      gap: 1rem;
      font-size: 0.85rem;
      color: #475569;
    }
    .dot {
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 3px;
      margin-right: 4px;
    }
    .dot.d2024 { background: #94a3b8; }
    .dot.d2025 { background: #0284c7; }
    .dot.dwind { background: #f59e0b; }

    .bars-chart {
      display: grid;
      grid-template-columns: repeat(12, minmax(56px, 1fr));
      gap: 0.5rem;
      align-items: end;
      padding: 1rem 0.5rem;
      border-bottom: 1px solid #e2e8f0;
      overflow-x: auto;
    }
    .bar-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;
    }
    .bars-pair {
      height: 190px;
      display: flex;
      align-items: flex-end;
      gap: 4px;
    }
    .bar {
      width: 20px;
      border-radius: 5px 5px 0 0;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      font-size: 0.68rem;
      font-weight: 700;
      color: #0f172a;
      padding-top: 2px;
      min-height: 18px;
    }
    .bar.b2024 { background: #cbd5e1; }
    .bar.b2025 { background: #0284c7; color: #fff; }
    .wind-chip {
      font-size: 0.7rem;
      background: #fef3c7;
      color: #92400e;
      padding: 2px 6px;
      border-radius: 99px;
      font-weight: 600;
    }
    .hail-indicator {
      font-size: 0.72rem;
      background: #fee2e2;
      color: #b91c1c;
      padding: 1px 6px;
      border-radius: 99px;
      font-weight: 700;
    }
    .month-name {
      font-size: 0.8rem;
      font-weight: 700;
      color: #334155;
    }
    .events-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .event-item {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1rem;
      background: #f8fafc;
    }
    .event-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 99px;
      font-size: 0.75rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    .event-badge.granizo { background: #fee2e2; color: #b91c1c; }
    .event-badge.viento-fuerte { background: #fef3c7; color: #b45309; }
    .event-badge.lluvia-intensa { background: #e0f2fe; color: #0369a1; }
    .event-top {
      display: flex;
      justify-content: space-between;
      font-size: 0.88rem;
      margin-bottom: 0.35rem;
    }
    .event-desc {
      margin: 0 0 0.4rem;
      font-size: 0.85rem;
      color: #334155;
    }
    .event-impact {
      color: #15803d;
      font-weight: 600;
      font-size: 0.78rem;
    }
    .clima-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }
    .clima-table th, .clima-table td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #e2e8f0;
      text-align: left;
    }
    .clima-table th {
      background: #f1f5f9;
      font-size: 0.78rem;
      text-transform: uppercase;
      color: #475569;
    }
    .pos { color: #15803d; font-weight: 700; }
    .neg { color: #dc2626; font-weight: 700; }
    .hail-tag {
      background: #fee2e2;
      color: #b91c1c;
      padding: 2px 8px;
      border-radius: 99px;
      font-size: 0.78rem;
      font-weight: 700;
    }
    .ok-tag {
      color: #64748b;
      font-size: 0.8rem;
    }
  `]
})
export class ClimaComponent implements OnInit {
  zonaSeleccionada = 'esperanza';

  readonly datosMensuales = signal<MesClima[]>([
    { mes: 'Ene', lluvia2024: 112, lluvia2025: 98,  vientoMaxKmH: 64, eventosGranizo: 1 },
    { mes: 'Feb', lluvia2024: 95,  lluvia2025: 134, vientoMaxKmH: 58, eventosGranizo: 0 },
    { mes: 'Mar', lluvia2024: 140, lluvia2025: 128, vientoMaxKmH: 72, eventosGranizo: 1 },
    { mes: 'Abr', lluvia2024: 88,  lluvia2025: 92,  vientoMaxKmH: 49, eventosGranizo: 0 },
    { mes: 'May', lluvia2024: 42,  lluvia2025: 38,  vientoMaxKmH: 45, eventosGranizo: 0 },
    { mes: 'Jun', lluvia2024: 18,  lluvia2025: 24,  vientoMaxKmH: 41, eventosGranizo: 0 },
    { mes: 'Jul', lluvia2024: 15,  lluvia2025: 19,  vientoMaxKmH: 52, eventosGranizo: 0 },
    { mes: 'Ago', lluvia2024: 22,  lluvia2025: 31,  vientoMaxKmH: 68, eventosGranizo: 0 },
    { mes: 'Sep', lluvia2024: 48,  lluvia2025: 56,  vientoMaxKmH: 61, eventosGranizo: 0 },
    { mes: 'Oct', lluvia2024: 92,  lluvia2025: 105, vientoMaxKmH: 76, eventosGranizo: 1 },
    { mes: 'Nov', lluvia2024: 98,  lluvia2025: 84,  vientoMaxKmH: 63, eventosGranizo: 0 },
    { mes: 'Dic', lluvia2024: 90,  lluvia2025: 68,  vientoMaxKmH: 59, eventosGranizo: 0 }
  ]);

  eventosSeveros: EventoSevero[] = [
    {
      fecha: '14 Oct 2025',
      localidad: 'Esperanza / Pilar (Sta. Fe)',
      tipo: 'Granizo',
      detalle: 'Caída de granizo localizado de 8-12 mm durante 7 minutos con ráfagas de 76 km/h.',
      impactoCultivo: 'Activación de Seguro de Resiembra 100% en lotes de Maíz temprano V4.'
    },
    {
      fecha: '22 Mar 2025',
      localidad: 'Venado Tuerto / Murphy',
      tipo: 'Viento Fuerte',
      detalle: 'Frente de tormenta del sector sur con ráfagas de 72 km/h y 65 mm acumulados.',
      impactoCultivo: 'Híbridos LG 30849 y Girasol 5710CL sin vuelco ni quebrado de tallo.'
    },
    {
      fecha: '18 Feb 2025',
      localidad: 'Marcos Juárez',
      tipo: 'Lluvia Intensa',
      detalle: 'Recarga hídrica de 134 mm en período crítico de floración y llenado de grano.',
      impactoCultivo: 'Excelente respuesta en rindes de Maíz tardío y Soja de primera.'
    }
  ];

  ngOnInit(): void {}

  total2024(): number {
    return this.datosMensuales().reduce((a, b) => a + b.lluvia2024, 0);
  }

  total2025(): number {
    return this.datosMensuales().reduce((a, b) => a + b.lluvia2025, 0);
  }

  diferenciaAnual(): number {
    return this.total2025() - this.total2024();
  }

  maxViento(): number {
    return Math.max(...this.datosMensuales().map(m => m.vientoMaxKmH));
  }

  totalGranizo(): number {
    return this.datosMensuales().reduce((a, b) => a + b.eventosGranizo, 0);
  }

  cambiarZona(): void {
    const factor =
      this.zonaSeleccionada === 'esperanza' ? 1 :
      this.zonaSeleccionada === 'venado' ? 1.08 :
      this.zonaSeleccionada === 'marcosjuarez' ? 0.94 : 1.12;

    const base: MesClima[] = [
      { mes: 'Ene', lluvia2024: 112, lluvia2025: 98,  vientoMaxKmH: 64, eventosGranizo: 1 },
      { mes: 'Feb', lluvia2024: 95,  lluvia2025: 134, vientoMaxKmH: 58, eventosGranizo: 0 },
      { mes: 'Mar', lluvia2024: 140, lluvia2025: 128, vientoMaxKmH: 72, eventosGranizo: 1 },
      { mes: 'Abr', lluvia2024: 88,  lluvia2025: 92,  vientoMaxKmH: 49, eventosGranizo: 0 },
      { mes: 'May', lluvia2024: 42,  lluvia2025: 38,  vientoMaxKmH: 45, eventosGranizo: 0 },
      { mes: 'Jun', lluvia2024: 18,  lluvia2025: 24,  vientoMaxKmH: 41, eventosGranizo: 0 },
      { mes: 'Jul', lluvia2024: 15,  lluvia2025: 19,  vientoMaxKmH: 52, eventosGranizo: 0 },
      { mes: 'Ago', lluvia2024: 22,  lluvia2025: 31,  vientoMaxKmH: 68, eventosGranizo: 0 },
      { mes: 'Sep', lluvia2024: 48,  lluvia2025: 56,  vientoMaxKmH: 61, eventosGranizo: 0 },
      { mes: 'Oct', lluvia2024: 92,  lluvia2025: 105, vientoMaxKmH: 76, eventosGranizo: 1 },
      { mes: 'Nov', lluvia2024: 98,  lluvia2025: 84,  vientoMaxKmH: 63, eventosGranizo: 0 },
      { mes: 'Dic', lluvia2024: 90,  lluvia2025: 68,  vientoMaxKmH: 59, eventosGranizo: 0 }
    ];

    this.datosMensuales.set(
      base.map(m => ({
        ...m,
        lluvia2024: Math.round(m.lluvia2024 * factor),
        lluvia2025: Math.round(m.lluvia2025 * factor)
      }))
    );
  }
}
