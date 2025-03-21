export interface VehicleImage {
  id: string;
  vehicle_id: string;
  image_url: string;
  created_at?: string;
}

export interface Optional {
  id: number;
  nome: string; 
}

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
  vehicle_images?: VehicleImage[];
  fipe_info?: any; 
  seller_type?: string;
  seller_name?: string;
  phone?: string;
  company?: string;
  social_media?: string;
  optionals?: Optional[];
}
