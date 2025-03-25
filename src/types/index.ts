export interface VehicleImage {
  id: string;
  vehicle_id: string;
  image_url: string;
  created_at?: string;
}

export interface Optional {
  id: number;
  name: string; // Nome do opcional (ex: "Sunroof", "Electric Windows", etc.)
}

export interface VehicleOptional {
  optional: Optional;
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
  optionals?: Optional[]; // Caso use essa propriedade separadamente
  seller_details?: SellerDetails;
  vehicle_optionals?: VehicleOptional[]; // Relacionamento N:N
}

export interface SellerDetails {
  id: string;
  vehicle_id: string;
  seller_type: string;     // "individual" ou "professional"
  seller_name: string;
  phone: string;
  company: string;
  social_media: string;
  address: string;
  created_at?: string;
}
