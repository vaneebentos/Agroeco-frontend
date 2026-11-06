export interface Customer {
  id: number;
  cuit: string;
  name: string;
  email: string;
  phone: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CustomerFormData = Omit<
  Customer,
  'id' | 'active' | 'createdAt' | 'updatedAt'
>;
