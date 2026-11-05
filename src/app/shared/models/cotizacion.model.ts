import { Semilla } from './semilla.model';

export interface CartItem {
  semillaId: number;
  semilla: Semilla;
  hectareas: number;
  temporada: string;
}

export interface CotizacionPayload {
  nombre_cliente: string;
  cuit?: string;
  email_cliente: string;
  telefono: string;
  observaciones: string;
  semillas: {
    semilla_id: number;
    cantidad: number;
    nombre?: string;
    cultivo?: string;
    temporada?: string;
  }[];
}

export interface ProducerFormData {
  nombreApellido: string;
  cuit: string;
  establecimiento: string;
  localidadZona: string;
  telefono: string;
  correo: string;
  comentarios: string;
}
