import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Airport = {
  id: string;
  code: string;
  name: string;
  city: string;
  country: string;
  timezone: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
};

export type Terminal = {
  id: string;
  airport_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
};

export type Gate = {
  id: string;
  terminal_id: string;
  gate_number: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type Flight = {
  id: string;
  flight_number: string;
  airline: string;
  airport_id: string;
  gate_id: string | null;
  departure_time: string | null;
  arrival_time: string | null;
  status: string;
  origin: string;
  destination: string;
  created_at: string;
  updated_at: string;
};

export type AirportMap = {
  id: string;
  airport_id: string;
  terminal_id: string | null;
  floor_level: string;
  map_url: string;
  map_type: string;
  created_at: string;
  updated_at: string;
};

export type AirportLounge = {
  id: string;
  airport_id: string;
  terminal_id: string | null;
  name: string;
  airline: string | null;
  location: string;
  amenities: string[];
  operating_hours: { open: string; close: string };
  access_requirements: string;
  is_premium: boolean;
  rating: number | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Advertisement = {
  id: string;
  airport_id: string | null;
  title: string;
  description: string;
  image_url: string;
  link_url: string;
  ad_type: string;
  placement: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type SubscriptionTier = {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  stripe_price_id_monthly: string | null;
  stripe_price_id_yearly: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type UserSubscription = {
  id: string;
  user_id: string;
  tier_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: string;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
};
