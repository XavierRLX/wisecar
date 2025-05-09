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
  owner_id?: string;      
  is_for_sale?: boolean; 
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

export interface MaintenancePart {
  id: string;
  maintenance_record_id: string;
  name: string;
  brand?: string;
  purchase_place?: string;
  quantity: number;
  price: number;
  created_at?: string;
}

// agora a interface inclui exatamente o campo maintenance_parts
export interface MaintenanceRecord {
  id: string;
  vehicle_id: string;
  maintenance_name: string;
  status: "A fazer" | "Feito" | "Cancelado";
  maintenance_type: string;
  scheduled_date: string | null;
  scheduled_km: number | null;
  completed_date: string | null;
  completed_km: number | null;
  provider: string | null;
  cost: number | null;
  notes: string | null;
  created_at?: string;

  // nome igual ao do select: maintenance_parts
  maintenance_parts?: MaintenancePart[];
}


