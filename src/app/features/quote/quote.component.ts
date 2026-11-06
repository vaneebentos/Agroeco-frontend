import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { QuoteService } from '../../core/services/quote.service';
import { ProducerFormData } from '../../shared/models/quote.model';

@Component({
  selector: 'app-quote',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './quote.component.html',
  styleUrls: ['./quote.component.css']
})
export class QuoteComponent {
  quoteService = inject(QuoteService);

  // Producer form
  formData: ProducerFormData = {
    fullName: '',
    cuit: '',
    farm: '',
    locality: '',
    phone: '',
    email: '',
    comments: ''
  };

  // Validation errors per field
  errors = {
    fullName: '',
    email: '',
    cuit: '',
    phone: '',
    products: ''
  };

  isSubmitting = signal<boolean>(false);
  submitSuccess = signal<string | null>(null);
  submitError = signal<string | null>(null);

  // Real-time generated message
  previewMessage = computed(() => {
    const items = this.quoteService.items();
    const totalHa = this.quoteService.totalHectares();
    const f = this.formData;

    let text = `Hola equipo AgroEco,\n\nSolicito cotización por los siguientes productos:\n\n`;

    if (items.length === 0) {
      text += `(No has cargado productos al pedido aún)\n\n`;
    } else {
      items.forEach(item => {
        text += `• ${item.seed.name} (${(item.seed.crop || '').toLowerCase()}) - ${item.hectares} ha - Temporada ${item.season}\n`;
      });
      text += `\nTotal de hectáreas: ${totalHa} ha\n\n`;
    }

    text += `Datos del productor:\n`;
    text += `Nombre: ${f.fullName || '-'}\n`;
    text += `CUIT: ${f.cuit || "-"}\n`;
    text += `Establecimiento: ${f.farm || '-'}\n`;
    text += `Localidad / Zona: ${f.locality || '-'}\n`;
    text += `Teléfono: ${f.phone || '-'}\n`;
    text += `Correo: ${f.email || '-'}\n`;
    if (f.comments) {
      text += `Comentarios: ${f.comments}\n`;
    }

    return text;
  });

  updateItem(seedId: number, hectares: number, season: string) {
    this.quoteService.updateItem(seedId, hectares, season);
  }

  removeItem(seedId: number) {
    this.quoteService.removeItem(seedId);
  }

  clearAll() {
    if (confirm('¿Deseas vaciar tu lista de productos a cotizar?')) {
      this.quoteService.clearCart();
    }
  }

  addSampleSeed() {
    this.quoteService.addItem({
      id: 1,
      name: 'LG 30646',
      crop: 'Maíz',
      type: 'Híbrido',
      description: 'Estabilidad y potencial en todos los ambientes.',
      availableSeasons: ['2025/26 Temprana', '2025/26 Tardía']
    }, 50, '2025/26 Temprana');
  }

  validateForm(): boolean {
    this.errors = {
      fullName: '',
      email: '',
      cuit: '',
      phone: '',
      products: ''
    };
    let isValid = true;

    // 1. Products in cart
    if (this.quoteService.items().length === 0) {
      this.errors.products = 'Tu lista de productos a cotizar está vacía. Añade semillas desde el catálogo.';
      isValid = false;
    } else {
      const hasInvalidQuantity = this.quoteService.items().some(i => !i.hectares || i.hectares <= 0);
      if (hasInvalidQuantity) {
        this.errors.products = 'Todas las semillas deben tener al menos 1 hectárea especificada.';
        isValid = false;
      }
    }

    // 2. Full name
    const fullName = this.formData.fullName.trim();
    if (!fullName) {
      this.errors.fullName = 'El nombre y apellido es obligatorio.';
      isValid = false;
    } else if (fullName.length < 3) {
      this.errors.fullName = 'Debe contener al menos 3 caracteres.';
      isValid = false;
    } else if (/^\d+$/.test(fullName)) {
      this.errors.fullName = 'El nombre no puede consistir únicamente en números.';
      isValid = false;
    }

    // 3. Email
    const email = this.formData.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      this.errors.email = 'El correo electrónico es obligatorio.';
      isValid = false;
    } else if (!emailRegex.test(email)) {
      this.errors.email = 'Ingresa un correo electrónico válido (ej: nombre@dominio.com).';
      isValid = false;
    }

    // 4. CUIT (required)
    const cuit = this.formData.cuit.trim();
    if (!cuit) {
      this.errors.cuit = 'El número de CUIT es obligatorio.';
      isValid = false;
    } else {
      const cuitDigits = cuit.replace(/[-\s]/g, '');
      if (!/^\d{11}$/.test(cuitDigits)) {
        this.errors.cuit = 'El CUIT debe contener exactamente 11 dígitos numéricos (ej: 20-12345678-9).';
        isValid = false;
      }
    }

    // 5. Phone (optional, but if provided it must have at least 6 digits)
    const phone = this.formData.phone.trim();
    if (phone) {
      const phoneDigits = phone.replace(/[^\d]/g, '');
      if (phoneDigits.length < 6) {
        this.errors.phone = 'El teléfono debe contener al menos 6 dígitos numéricos.';
        isValid = false;
      } else if (!/^[\d\s\+\-\(\)]+$/.test(phone)) {
        this.errors.phone = 'El teléfono contiene caracteres no permitidos.';
        isValid = false;
      }
    }

    return isValid;
  }

  submitRequest() {
    this.submitSuccess.set(null);
    this.submitError.set(null);

    if (!this.validateForm()) {
      if (this.errors.products) {
        this.submitError.set(this.errors.products);
      } else {
        this.submitError.set('Por favor corrige los datos señalados en el formulario antes de enviar.');
      }
      return;
    }

    this.isSubmitting.set(true);

    this.quoteService.submitQuote(this.formData).subscribe({
      next: () => {
        const customerEmail = this.formData.email;
        this.isSubmitting.set(false);
        this.submitSuccess.set(`¡Tu solicitud de cotización fue registrada con éxito! Se ha enviado la notificación por correo electrónico a ${customerEmail} y al equipo comercial.`);
        this.quoteService.clearCart();
        this.formData = {
          fullName: '',
          cuit: '',
          farm: '',
          locality: '',
          phone: '',
          email: '',
          comments: ''
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
