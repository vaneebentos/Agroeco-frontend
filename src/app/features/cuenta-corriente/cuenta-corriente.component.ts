import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface HistorialCompraCosecha {
  campana: string;
  semilla: string;
  cultivo: string;
  elaborador: string;
  bolsasCompradas: number;
  lote: string;
  rindeLogrado: string;
  humedadCosecha: string;
  resultadoEvaluacion: 'Excelente' | 'Muy Bueno' | 'Con Resiembra';
  vendedorAsignado: string;
  asistenciaRecibida: string;
}

@Component({
  selector: 'app-cuenta-corriente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- VISTA 1: LOGIN PANTALLA DIVIDIDA (Estilo MiLehmannGo) -->
    <div class="login-split-wrapper" *ngIf="!logueado()">
      <div class="login-visual-side">
        <div class="visual-overlay">
          <span class="visual-badge">MiAgroEco · Cuenta Corriente</span>
          <h2>De generación en generación junto al productor</h2>
          <p>Consultá tu archivo histórico de semillas compradas, los rindes obtenidos en cada cosecha y el seguimiento técnico de tu asesor comercial.</p>
        </div>
        <div class="visual-bottom-strip">
          <span class="material-symbols-outlined">agriculture</span>
          <span class="material-symbols-outlined">eco</span>
          <span class="material-symbols-outlined">warehouse</span>
          <span class="material-symbols-outlined">water_drop</span>
          <span class="material-symbols-outlined">verified_user</span>
        </div>
      </div>

      <div class="login-form-side">
        <div class="login-box">
          <h1>Iniciar sesión</h1>
          <p class="login-sub">Accede a tu cuenta corriente de cliente habitual para continuar</p>

          <label>Correo electrónico</label>
          <input type="email" [(ngModel)]="email" placeholder="productor@establecimiento.com.ar" />

          <label>Contraseña</label>
          <input type="password" [(ngModel)]="password" placeholder="••••••••" />

          <div class="login-options">
            <label class="remember-check">
              <input type="checkbox" checked /> Recordarme
            </label>
            <a href="javascript:void(0)">Olvidé mi contraseña</a>
          </div>

          <button class="btn-login-primary" (click)="ingresar()">Iniciar sesión</button>
          <button class="btn-login-demo" (click)="ingresarDemo()">
            Ver legajo de ejemplo (Establecimiento Don Alberto)
          </button>
        </div>
      </div>
    </div>

    <!-- VISTA 2: EXPEDIENTE DEL CLIENTE HABITUAL (Compras + Resultados de Cosecha + Asistencia del Vendedor) -->
    <section class="cc-dashboard" *ngIf="logueado()">
      <div class="cc-header-card">
        <div>
          <span class="cc-tag">CLIENTE HABITUAL VERIFICADO · CUENTA CORRIENTE #4082</span>
          <h1>Establecimiento "La Esperanza" — Familia Boschetto</h1>
          <p>Localidad: Esperanza, Santa Fe · Asesor Comercial Asignado: <strong>Ing. Agr. Martín Pereyra</strong> (WhatsApp directo: +54 9 3496 51-2240)</p>
        </div>
        <button class="btn-logout" (click)="logueado.set(false)">Cerrar sesión</button>
      </div>

      <!-- Resumen de cuenta y campaña -->
      <div class="cc-kpis">
        <div class="kpi-box">
          <span>Semillas Compradas (3 campañas)</span>
          <strong>410 bolsas</strong>
          <small>100% con guarda en cámara fría bonificada</small>
        </div>
        <div class="kpi-box">
          <span>Rinde Promedio Maíz</span>
          <strong>11.8 t/ha</strong>
          <small>+14% sobre media zonal</small>
        </div>
        <div class="kpi-box">
          <span>Visitas Técnicas a Lote</span>
          <strong>9 seguimientos</strong>
          <small>Monitoreo de siembra, malezas y cosecha</small>
        </div>
      </div>

      <h2 class="section-title">Archivo de Semillas Compradas, Resultados de Cosecha y Asistencia Técnica</h2>

      <div class="historial-cards">
        <article class="compra-card" *ngFor="let item of historial">
          <div class="compra-top">
            <div>
              <span class="campana-pill">Campaña {{ item.campana }}</span>
              <span class="cultivo-pill">{{ item.cultivo }}</span>
              <h3>{{ item.semilla }} <small>— {{ item.elaborador }}</small></h3>
            </div>
            <span class="resultado-badge" [ngClass]="item.resultadoEvaluacion.toLowerCase().replace(' ', '-')">
              Cosecha: {{ item.resultadoEvaluacion }}
            </span>
          </div>

          <div class="compra-grid">
            <div class="info-block">
              <h4>1. Compra y Lote</h4>
              <p><strong>Cantidad comprada:</strong> {{ item.bolsasCompradas }} bolsas</p>
              <p><strong>Lote asignado:</strong> {{ item.lote }}</p>
            </div>

            <div class="info-block">
              <h4>2. Resultado de la Cosecha</h4>
              <p><strong>Rinde obtenido:</strong> {{ item.rindeLogrado }}</p>
              <p><strong>Humedad a cosecha:</strong> {{ item.humedadCosecha }}</p>
            </div>

            <div class="info-block assistance-block">
              <h4>3. Cómo fue asistido por su Vendedor</h4>
              <p><strong>Asesor:</strong> {{ item.vendedorAsignado }}</p>
              <p>{{ item.asistenciaRecibida }}</p>
            </div>
          </div>
        </article>
      </div>
    </section>
  `,
  styles: [`
    .login-split-wrapper {
      display: grid;
      grid-template-columns: 1.1fr 1fr;
      min-height: calc(100vh - 72px);
      background: #ffffff;
    }
    .login-visual-side {
      background: linear-gradient(160deg, rgba(27,67,50,0.85), rgba(20,83,45,0.92)),
                  url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80') center/cover no-repeat;
      color: #ffffff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .visual-overlay {
      padding: 4rem 3.5rem;
      max-width: 540px;
    }
    .visual-badge {
      background: rgba(255,255,255,0.18);
      padding: 0.35rem 0.9rem;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 700;
    }
    .visual-overlay h2 {
      font-size: 2.2rem;
      margin: 1.2rem 0 0.8rem;
      line-height: 1.2;
    }
    .visual-overlay p {
      font-size: 1.05rem;
      color: #e2e8f0;
      line-height: 1.6;
    }
    .visual-bottom-strip {
      background: #0d7a3e;
      padding: 1.25rem;
      display: flex;
      justify-content: center;
      gap: 2rem;
    }
    .login-form-side {
      display: grid;
      place-items: center;
      padding: 2rem;
    }
    .login-box {
      width: 100%;
      max-width: 420px;
      display: flex;
      flex-direction: column;
    }
    .login-box h1 {
      text-align: center;
      margin: 0 0 0.25rem;
      font-size: 1.9rem;
      color: #111827;
    }
    .login-sub {
      text-align: center;
      color: #4b5563;
      margin-bottom: 2rem;
      font-size: 0.95rem;
    }
    .login-box label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.35rem;
    }
    .login-box input[type="email"],
    .login-box input[type="password"] {
      padding: 0.8rem 1rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 0.95rem;
      margin-bottom: 1.15rem;
    }
    .login-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.85rem;
      margin-bottom: 1.5rem;
    }
    .login-options a {
      color: #0d7a3e;
      text-decoration: none;
      font-weight: 600;
    }
    .btn-login-primary {
      background: #15803d;
      color: #ffffff;
      border: none;
      padding: 0.85rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      margin-bottom: 0.75rem;
    }
    .btn-login-demo {
      background: #ffffff;
      color: #15803d;
      border: 1.5px solid #15803d;
      padding: 0.8rem;
      border-radius: 8px;
      font-size: 0.92rem;
      font-weight: 700;
      cursor: pointer;
    }
    /* Dashboard Cuenta Corriente */
    .cc-dashboard {
      max-width: 1300px;
      margin: 0 auto;
      padding: 1.75rem 1.25rem 3rem;
    }
    .cc-header-card {
      background: #ffffff;
      border-radius: 14px;
      padding: 1.5rem 2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.06);
      border-left: 6px solid #15803d;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .cc-tag {
      font-size: 0.75rem;
      font-weight: 800;
      color: #15803d;
    }
    .cc-header-card h1 {
      margin: 0.3rem 0;
      font-size: 1.5rem;
    }
    .cc-header-card p {
      margin: 0;
      color: #4b5563;
    }
    .btn-logout {
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      padding: 0.55rem 1rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    }
    .cc-kpis {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1rem;
      margin-bottom: 1.75rem;
    }
    .kpi-box {
      background: #ffffff;
      padding: 1.25rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .kpi-box span { font-size: 0.8rem; color: #6b7280; font-weight: 600; }
    .kpi-box strong { font-size: 1.65rem; color: #111827; }
    .kpi-box small { font-size: 0.8rem; color: #15803d; font-weight: 600; }
    .section-title {
      font-size: 1.25rem;
      color: #1f2937;
      margin-bottom: 1rem;
    }
    .historial-cards {
      display: flex;
      flex-direction: column;
      gap: 1.15rem;
    }
    .compra-card {
      background: #ffffff;
      border-radius: 14px;
      padding: 1.4rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.06);
      border: 1px solid #e5e7eb;
    }
    .compra-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #f3f4f6;
      padding-bottom: 0.85rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .campana-pill, .cultivo-pill {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 99px;
      font-size: 0.75rem;
      font-weight: 700;
      margin-right: 0.4rem;
    }
    .campana-pill { background: #dcfce7; color: #166534; }
    .cultivo-pill { background: #fef3c7; color: #92400e; }
    .compra-top h3 { margin: 0.4rem 0 0; font-size: 1.15rem; }
    .compra-top h3 small { color: #6b7280; font-weight: 500; }
    .resultado-badge {
      padding: 5px 12px;
      border-radius: 99px;
      font-size: 0.8rem;
      font-weight: 700;
      background: #dcfce7;
      color: #15803d;
    }
    .compra-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1rem;
    }
    .info-block {
      background: #f9fafb;
      padding: 1rem;
      border-radius: 10px;
    }
    .info-block.assistance-block {
      background: #f0fdf4;
      border-left: 4px solid #16a34a;
    }
    .info-block h4 {
      margin: 0 0 0.5rem;
      font-size: 0.85rem;
      text-transform: uppercase;
      color: #374151;
    }
    .info-block p {
      margin: 0.25rem 0;
      font-size: 0.9rem;
      color: #1f2937;
      line-height: 1.45;
    }
    @media (max-width: 860px) {
      .login-split-wrapper { grid-template-columns: 1fr; }
    }
  `]
})
export class CuentaCorrienteComponent {
  logueado = signal(false);
  email = 'familia.boschetto@establecimiento.com.ar';
  password = '••••••••';

  historial: HistorialCompraCosecha[] = [
    {
      campana: '2024/25',
      semilla: 'LG 30849 VIP3',
      cultivo: 'Maíz',
      elaborador: 'Limagrain (LG Semillas)',
      bolsasCompradas: 140,
      lote: 'Lote Norte #3 (125 ha)',
      rindeLogrado: '12.4 t/ha (124 qq/ha)',
      humedadCosecha: '14.2%',
      resultadoEvaluacion: 'Excelente',
      vendedorAsignado: 'Ing. Agr. Martín Pereyra',
      asistenciaRecibida: 'Calibración de sembradora neumática (76.000 pl/ha), monitoreo en V6 y seguimiento de refugio VIP3. Sin requerir aplicación para cogollero.'
    },
    {
      campana: '2024/25',
      semilla: 'Girasol LG 5710 CL',
      cultivo: 'Girasol',
      elaborador: 'Limagrain · Tecnología Clearfield (BASF)',
      bolsasCompradas: 90,
      lote: 'Lote Bajo Este (95 ha)',
      rindeLogrado: '3.6 t/ha (Materia grasa: 51%)',
      humedadCosecha: '10.8%',
      resultadoEvaluacion: 'Muy Bueno',
      vendedorAsignado: 'Ing. Agr. Martín Pereyra',
      asistenciaRecibida: 'Recomendación de herbicida post-emergente Imazamox + visita post-tormenta de marzo para verificar anclaje de raíz.'
    },
    {
      campana: '2023/24',
      semilla: 'Maíz DK 72-10 VT3P',
      cultivo: 'Maíz',
      elaborador: 'Dekalb (Bayer CropScience)',
      bolsasCompradas: 180,
      lote: 'Lote Ruta 6 (150 ha)',
      rindeLogrado: '11.2 t/ha tras resiembra parcial',
      humedadCosecha: '14.8%',
      resultadoEvaluacion: 'Con Resiembra',
      vendedorAsignado: 'Ing. Agr. Sofía Galván',
      asistenciaRecibida: 'Activación del Seguro de Resiembra 100% por evento de granizo del 18/10. Entrega sin cargo de 65 bolsas desde cámara fría en 24 hs.'
    }
  ];

  ingresar(): void {
    this.logueado.set(true);
  }

  ingresarDemo(): void {
    this.logueado.set(true);
  }
}
