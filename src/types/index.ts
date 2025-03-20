export interface VehicleImage {
  id: string;
  vehicle_id: string;
  image_url: string;
  created_at?: string;
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
  fipe_info?:JSON;
}
