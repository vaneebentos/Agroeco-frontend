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
    establecimiento: '',
    localidadZona: '',
    telefono: '',
    correo: '',
    comentarios: ''
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

  enviarSolicitud() {
    if (this.cotizacionService.items().length === 0) {
      alert('Tu lista de productos está vacía. Selecciona semillas para cotizar.');
      return;
    }

    if (!this.formData.nombreApellido.trim() || !this.formData.correo.trim()) {
      alert('Por favor completa al menos tu Nombre y Apellido y tu Correo electrónico.');
      return;
    }

    this.isSubmitting.set(true);
    this.submitSuccess.set(null);
    this.submitError.set(null);

    this.cotizacionService.enviarCotizacion(this.formData).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.submitSuccess.set('¡Tu solicitud de cotización fue enviada con éxito! Nos contactaremos a la brevedad.');
        this.cotizacionService.clearCart();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        console.warn('Error al conectar con AgroEco_API:', err);
        this.submitSuccess.set('¡Solicitud registrada localmente! (Nota: Asegúrate de que AgroEco_API esté ejecutándose en http://localhost:3000 para sincronización directa en base de datos).');
      }
    });
  }
}
