export interface VehicleImage {
  id: string;
  vehicle_id: string;
  image_url: string;
  created_at?: string;
}

export interface Optional {
  id: number;
  name: string;
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
  optionals?: Optional[]; 
  seller_details?: SellerDetails;
  vehicle_optionals?: VehicleOptional[]; 
}

export interface SellerDetails {
  id: string;
  vehicle_id: string;
  seller_type: string;    
  seller_name: string;
  phone: string;
  company: string;
  social_media: string;
  address: string;
  created_at?: string;
}
