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

export interface Vehicle {
  id: string;
  user_id: string;
  category_id: number | null; // 1 para Car, 2 para Motorcycle
  brand: string;            // Código ou nome da marca (FIPE)
  model: string;            // Código ou nome do modelo (FIPE)
  year: number;
  price: number;
  mileage: number;
  color: string;
  fuel: string;
  notes?: string;
  created_at?: string;
  vehicle_images?: VehicleImage[];
  fipe_info?: any;          // Dados FIPE completos (pode ser refinado com uma interface específica)
  optionals?: Optional[];
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
