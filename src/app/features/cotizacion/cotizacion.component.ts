import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CotizacionService } from '../../core/services/cotizacion.service';
import { ProducerFormData } from '../../shared/models/cotizacion.model';

@Component({
  selector: 'app-cotizacion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cotizacion.component.html',
  styleUrls: ['./cotizacion.component.css']
})
export class CotizacionComponent {
  cotizacionService = inject(CotizacionService);

  // Formulario del productor
  formData: ProducerFormData = {
    nombreApellido: '',
    cuit: '',
    establecimiento: '',
    localidadZona: '',
    telefono: '',
    correo: '',
    comentarios: ''
  };

  // Errores de validación por campo
  errores = {
    nombreApellido: '',
    correo: '',
    cuit: '',
    telefono: '',
    productos: ''
  };

  isSubmitting = signal<boolean>(false);
  submitSuccess = signal<string | null>(null);
  submitError = signal<string | null>(null);

  // Mensaje en tiempo real generado
  previewMessage = computed(() => {
    const items = this.cotizacionService.items();
    const totalHa = this.cotizacionService.totalHectareas();
    const f = this.formData;

    let text = `Hola equipo AgroEco,\n\nSolicito cotización por los siguientes productos:\n\n`;

    if (items.length === 0) {
      text += `(No has cargado productos al pedido aún)\n\n`;
    } else {
      items.forEach(item => {
        text += `• ${item.semilla.nombre} (${(item.semilla.cultivo || '').toLowerCase()}) - ${item.hectareas} ha - Temporada ${item.temporada}\n`;
      });
      text += `\nTotal de hectáreas: ${totalHa} ha\n\n`;
    }

    text += `Datos del productor:\n`;
    text += `Nombre: ${f.nombreApellido || '-'}\n`;
    text += `CUIT: ${f.cuit || "-"}\n`;
    text += `Establecimiento: ${f.establecimiento || '-'}\n`;
    text += `Localidad / Zona: ${f.localidadZona || '-'}\n`;
    text += `Teléfono: ${f.telefono || '-'}\n`;
    text += `Correo: ${f.correo || '-'}\n`;
    if (f.comentarios) {
      text += `Comentarios: ${f.comentarios}\n`;
    }

    return text;
  });

  updateItem(semillaId: number, hectareas: number, temporada: string) {
    this.cotizacionService.updateItem(semillaId, hectareas, temporada);
  }

  removeItem(semillaId: number) {
    this.cotizacionService.removeItem(semillaId);
  }

  clearAll() {
    if (confirm('¿Deseas vaciar tu lista de productos a cotizar?')) {
      this.cotizacionService.clearCart();
    }
  }

  agregarSemillaEjemplo() {
    this.cotizacionService.addItem({
      id: 1,
      nombre: 'LG 30646',
      cultivo: 'Maíz',
      tipo: 'Híbrido',
      descripcion: 'Estabilidad y potencial en todos los ambientes.',
      temporadasDisponibles: ['2025/26 Temprana', '2025/26 Tardía']
    }, 50, '2025/26 Temprana');
  }

  validarFormulario(): boolean {
    this.errores = {
      nombreApellido: '',
      correo: '',
      cuit: '',
      telefono: '',
      productos: ''
    };
    let esValido = true;

    // 1. Productos en carrito
    if (this.cotizacionService.items().length === 0) {
      this.errores.productos = 'Tu lista de productos a cotizar está vacía. Añade semillas desde el catálogo.';
      esValido = false;
    } else {
      const tieneCantidadInvalida = this.cotizacionService.items().some(i => !i.hectareas || i.hectareas <= 0);
      if (tieneCantidadInvalida) {
        this.errores.productos = 'Todas las semillas deben tener al menos 1 hectárea especificada.';
        esValido = false;
      }
    }

    // 2. Nombre y apellido
    const nombre = this.formData.nombreApellido.trim();
    if (!nombre) {
      this.errores.nombreApellido = 'El nombre y apellido es obligatorio.';
      esValido = false;
    } else if (nombre.length < 3) {
      this.errores.nombreApellido = 'Debe contener al menos 3 caracteres.';
      esValido = false;
    } else if (/^\d+$/.test(nombre)) {
      this.errores.nombreApellido = 'El nombre no puede consistir únicamente en números.';
      esValido = false;
    }

    // 3. Correo electrónico
    const correo = this.formData.correo.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!correo) {
      this.errores.correo = 'El correo electrónico es obligatorio.';
      esValido = false;
    } else if (!emailRegex.test(correo)) {
      this.errores.correo = 'Ingresa un correo electrónico válido (ej: nombre@dominio.com).';
      esValido = false;
    }

    // 4. CUIT (Obligatorio)
    const cuit = this.formData.cuit.trim();
    if (!cuit) {
      this.errores.cuit = 'El número de CUIT es obligatorio.';
      esValido = false;
    } else {
      const cuitDigitos = cuit.replace(/[-\s]/g, '');
      if (!/^\d{11}$/.test(cuitDigitos)) {
        this.errores.cuit = 'El CUIT debe contener exactamente 11 dígitos numéricos (ej: 20-12345678-9).';
        esValido = false;
      }
    }

    // 5. Teléfono (opcional, pero si se ingresa debe tener al menos 6 dígitos)
    const tel = this.formData.telefono.trim();
    if (tel) {
      const telDigitos = tel.replace(/[^\d]/g, '');
      if (telDigitos.length < 6) {
        this.errores.telefono = 'El teléfono debe contener al menos 6 dígitos numéricos.';
        esValido = false;
      } else if (!/^[\d\s\+\-\(\)]+$/.test(tel)) {
        this.errores.telefono = 'El teléfono contiene caracteres no permitidos.';
        esValido = false;
      }
    }

    return esValido;
  }

  enviarSolicitud() {
    this.submitSuccess.set(null);
    this.submitError.set(null);

    if (!this.validarFormulario()) {
      if (this.errores.productos) {
        this.submitError.set(this.errores.productos);
      } else {
        this.submitError.set('Por favor corrige los datos señalados en el formulario antes de enviar.');
      }
      return;
    }

    this.isSubmitting.set(true);

    this.cotizacionService.enviarCotizacion(this.formData).subscribe({
      next: (res) => {
        const clienteMail = this.formData.correo;
        this.isSubmitting.set(false);
        this.submitSuccess.set(`¡Tu solicitud de cotización fue registrada con éxito! Se ha enviado la notificación por correo electrónico a ${clienteMail} y al equipo comercial.`);
        this.cotizacionService.clearCart();
        this.formData = {
          nombreApellido: '',
          cuit: '',
          establecimiento: '',
          localidadZona: '',
          telefono: '',
          correo: '',
          comentarios: ''
        };
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const backendError = err?.error?.error || err?.error?.message;
        if (backendError) {
          this.submitError.set(backendError);
        } else {
          this.submitError.set('No se pudo conectar con el servidor (http://localhost:3000). Asegúrate de que la API esté en ejecución.');
        }
      }
    });
  }
}

