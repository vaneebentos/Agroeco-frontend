export interface Cliente {
  id: number;
  cuit: string;
  nombre: string;
  email: string;
  telefono: string | null;
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export type ClienteFormData = Omit<
  Cliente,
  'id' | 'activo' | 'fechaCreacion' | 'fechaActualizacion'
>;