export type TipoCiclo = 'Corto' | 'Medio' | 'Largo';

export interface Semilla {
  id: string;
  nombre: string;
  cultivo_id: number;
  ciclo: TipoCiclo;
  caracteristicas: string | null;
  activo: boolean;
}