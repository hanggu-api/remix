// Ambient Cloudflare Workers types for compilation
export interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run<T = unknown>(): Promise<{ success: boolean; results?: T[]; meta?: any }>;
  all<T = unknown>(): Promise<{ success: boolean; results: T[]; meta?: any }>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  dump(): Promise<ArrayBuffer>;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<{ success: boolean; results?: T[] }[]>;
  exec(query: string): Promise<{ count: number; duration: number }>;
}

export interface KVNamespace {
  get(key: string, type?: string): Promise<any>;
  put(key: string, value: string | ReadableStream | ArrayBuffer, options?: any): Promise<void>;
  delete(key: string): Promise<void>;
}

export interface ExecutionContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
}

export interface Env {
  DB?: D1Database;
  KV_CACHE?: KVNamespace;
  ENVIRONMENT?: string;
  APP_NAME?: string;
  CORS_ALLOW_ORIGIN?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'client' | 'provider' | 'admin';
  category?: string;
  avatar_url?: string;
  rating?: number;
  jobs_count?: number;
  facial_verified?: number;
  document_verified?: number;
  created_at?: string;
}

export interface ServiceRequest {
  id: string;
  client_id: string;
  client_name: string;
  client_phone?: string;
  title: string;
  description?: string;
  category: string;
  status: 'open' | 'quotes_received' | 'in_progress' | 'completed' | 'cancelled';
  client_address?: string;
  lat?: number;
  lng?: number;
  selected_quote_id?: string;
  selected_provider_id?: string;
  selected_provider_name?: string;
  agreed_price?: number;
  escrow_status?: 'none' | 'held_pix' | 'released' | 'refunded';
  created_at?: string;
}

export interface Quote {
  id: string;
  request_id: string;
  provider_id: string;
  provider_name: string;
  provider_avatar?: string;
  provider_phone?: string;
  provider_rating?: number;
  provider_jobs_count?: number;
  facial_verified?: number;
  doc_verified?: number;
  price_labor: number;
  price_materials?: number;
  eta_minutes?: number;
  message?: string;
  status?: 'pending' | 'accepted' | 'rejected';
  created_at?: string;
}

export interface ChatMessage {
  id: string;
  request_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: 'client' | 'provider';
  text: string;
  created_at?: string;
}

export interface EscrowTransaction {
  id: string;
  request_id: string;
  client_id: string;
  provider_id: string;
  amount_labor: number;
  amount_materials: number;
  total_amount: number;
  pix_end_to_end_id?: string;
  status: 'held_in_custody' | 'released_to_provider' | 'refunded_to_client';
  created_at?: string;
  released_at?: string;
}
