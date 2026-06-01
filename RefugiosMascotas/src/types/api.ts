// Tipos espejo de la API (snake_case, tal como llegan del backend FastAPI).
// La capa /api se encarga de traducirlos a los tipos UI cuando hace falta.

export type Role = 'adopter' | 'foundation' | 'admin';

export type FoundationStatusApi = 'pending' | 'approved' | 'rejected';

export interface TokenResponse {
  access_token: string;
  token_type: 'bearer';
  role: Role;
}

export interface AdopterApi {
  id: number;
  email: string;
  full_name: string;
  city: string | null;
  phone: string | null;
  avatar_url: string | null;
  profile_complete: boolean;
  created_at: string;
}

export interface FoundationApi {
  id: number;
  email: string;
  name: string;
  city: string;
  description: string | null;
  phone: string | null;
  years: number;
  adoptions: number;
  animals: number;
  initial: string;
  gradient_from: string;
  gradient_to: string;
  profile_complete: boolean;
  status: FoundationStatusApi;
  created_at: string;
}

export interface AdminApi {
  id: number;
  email: string;
  full_name: string;
  created_at: string;
}

export interface AdminRegisterPayload {
  email: string;
  password: string;
  full_name: string;
}

export type PetTypeApi = 'Perro' | 'Gato';

export interface PetApi {
  id: number;
  name: string;
  type: PetTypeApi;
  breed: string;
  age: string;
  city: string;
  urgent: boolean;
  vaccinated: boolean;
  photo: string | null;
  sterilized: boolean;
  gradient_from: string;
  gradient_to: string;
  is_adopted: boolean;
  foundation_id: number;
  shelter: string;
  image_public_id: string | null;
  image_url: string | null;
  created_at: string;
}

export interface PetCreatePayload {
  name: string;
  type: PetTypeApi;
  breed: string;
  age: string;
  city: string;
  urgent: boolean;
  vaccinated: boolean;
  sterilized: boolean;
  gradient_from: string;
  gradient_to: string;
}

export interface AdopterRegisterPayload {
  email: string;
  password: string;
  full_name: string;
  city?: string;
  phone?: string;
}

export interface FoundationRegisterPayload {
  email: string;
  password: string;
  name: string;
  city: string;
  description?: string;
  phone?: string;
  years?: number;
}

export interface LoginPayload {
  email: string;
  password: string;
  role: Role;
}

export interface ApiError {
  detail: string;
}

export type AdoptionStatusApi = 'pending' | 'approved' | 'rejected';

export interface AdoptionRequestPetSummaryApi {
  id: number;
  name: string;
  breed: string;
  type: PetTypeApi;
  image_public_id: string | null;
  image_url: string | null;
}

export interface AdoptionRequestAdopterSummaryApi {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  city: string | null;
  avatar_url: string | null;
}

export interface AdoptionRequestApi {
  id: number;
  pet_id: number;
  adopter_id: number;
  foundation_id: number;
  status: AdoptionStatusApi;
  message: string | null;
  created_at: string;
  updated_at: string;
  pet: AdoptionRequestPetSummaryApi;
  adopter: AdoptionRequestAdopterSummaryApi;
}

export interface AdoptionRequestCreatePayload {
  message?: string;
}
