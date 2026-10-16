import { Seed } from './seed.model';

export interface CartItem {
  semillaId: number;
  semilla: Seed;
  hectareas: number;
  temporada: string;
}

export interface CotizacionPayload {
  nombre_cliente: string;
  email_cliente: string;
  telefono: string;
  observaciones: string;
  semillas: {
    semilla_id: number;
    cantidad: number;
  }[];
}

export interface ProducerFormData {
  nombreApellido: string;
  establecimiento: string;
  localidadZona: string;
  telefono: string;
  correo: string;
  comentarios: string;
}
