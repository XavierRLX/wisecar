// src/types/index.ts
export type VehicleStatus = 'WISHLIST' | 'GARAGE' | 'FOR_SALE';

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

export interface SellerDetails {
  vehicle_id: string;
  seller_type: 'particular' | 'profissional';
  seller_name: string;
  phone: string;
  company?: string;
  social_media?: string;
  address?: string;
}

export interface Vehicle {
  id: string;
  user_id: string;
  owner_id: string | null;
  category_id: number | null;
  status: VehicleStatus;
  fipe_info?: any;
  fipe_price: number;
  sale_price?: number | null;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  color: string;
  fuel: string;
  notes?: string;
  vehicle_images?: VehicleImage[];
  vehicle_optionals?: VehicleOptional[];
  optionals?: Optional[];
  seller_details?: SellerDetails;
  created_at?: string;
}

export type ConversationWithDetails = {
  id: string;
  created_at: string;
  vehicles: {
    brand: string;
    model: string;
    vehicle_images: { image_url: string }[];
  };
  buyer_id: string;
  seller_id: string;
  buyer?: { username: string };
  seller?: { username: string };
  messages?: { id: string }[];
};

export type MessageWithSender = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: { username: string };
};

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

export interface MaintenanceRecord {
  id: string;
  vehicle_id: string;
  maintenance_name: string;
  status: 'A fazer' | 'Feito' | 'Cancelado';
  maintenance_type: string;
  scheduled_date: string | null;
  scheduled_km: number | null;
  completed_date: string | null;
  completed_km: number | null;
  provider: string | null;
  cost: number | null;
  notes: string | null;
  created_at?: string;
  maintenance_parts?: MaintenancePart[];
}

export interface MaintenanceDoc {
  id: string;
  maintenance_record_id: string;
  title: string;
  file_url: string;
  uploaded_at?: string;
}

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  username?: string;
  avatar_url?: string;
  is_admin?: boolean;
  is_seller?: boolean;
  is_provider?: boolean;
  plan_id: string;
  subscription_plans: {
    key: string;
    name: string;
  };
  created_at?: string;
}




export interface SubscriptionPlan {
  id: string;
  key: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  interval: string;
  interval_count: number;
}

export interface ProviderImage {
  id: string;
  provider_id: string;
  image_url: string;
  created_at?: string;
}

export interface ServiceCategory {
  id: number;
  name: string;
}

export interface ServiceItemImage {
  id: string;
  service_item_id: string;
  image_url: string;
  created_at?: string;
}

export interface ServiceItem {
  id: string;
  service_id: string;
  name: string;
  details?: string;
  price?: number;
  created_at?: string;
  item_images?: ServiceItemImage[];
}

export interface Service {
  id: string;
  provider_id: string;
  category_id?: number;
  name: string;
  price?: number;
  created_at?: string;
  service_items?: ServiceItem[];
  category?: ServiceCategory;
}

export interface Provider {
  id: string;
  user_id: string;
  name: string;
  address?: string;
  description?: string;
  phone?: string;
  social_media?: Record<string, string>;
  state?: string;
  city?: string;
  neighborhood?: string;
  logo_url?: string;
  created_at?: string;
  provider_images?: ProviderImage[];
  services?: Service[];
}
