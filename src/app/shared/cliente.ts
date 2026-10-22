
export interface Cliente {
  id: number;
  nombre: string;
  email: string;
  telefono?: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
}
