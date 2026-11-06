export type CycleType = 'Corto' | 'Medio' | 'Largo';

export interface HealthItem {
  name: string;
  points: number;
}

export interface Seed {
  id: number | string;
  code?: string;
  name: string;
  /** Crop name (display only, derived from `cropId` on the frontend). */
  crop?: string;
  cropId?: number;
  type?: string;
  category?: 'PRIMERA' | 'SEGUNDA';
  isNew?: boolean;
  description?: string | null;
  characteristics?: string | null;
  cycle?: string;
  crossing?: string | null;
  relativeMaturity?: number | string | null;
  floweringDays?: string | null;
  density?: string;
  technology?: string | null;
  environment?: string;
  grainColor?: string | null;
  plantHeight?: string | null;
  rowCount?: string | null;
  health?: HealthItem[] | null;
  adaptationZones?: string[];
  availableSeasons?: string[];
  price?: number;
  stock?: number;
  stockUnit?: string;
  estimatedYield?: number;
  yieldUnit?: string;
  active?: boolean;
  deleted?: boolean;
}

export interface FilterState {
  search: string;
  crop: string;
  hybridsOnly: boolean;
  season: string;
  zone: string;
}
