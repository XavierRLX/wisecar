// Tipos gerais ou tipos de dados do Supabase podem ser definidos aqui
export interface Vehicle {
    id: string;
    user_id: string;
    category_id: number | null;
    brand: string;
    model: string;
    year: number;
    price: number;
    mileage: number;
    color: string;
    fuel: string;
    notes?: string;
    created_at?: string;
  }
  