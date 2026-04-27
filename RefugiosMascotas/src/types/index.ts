export interface Pet {
  id: number;
  name: string;
  type: 'Perro' | 'Gato';
  breed: string;
  age: string;
  shelter: string;
  city: string;
  urgent?: boolean;
  vaccinated: boolean;
  sterilized?: boolean;
  gradientFrom: string;
  gradientTo: string;
  isAdopted?: boolean;
  foundationId?: number;
  imageUrl?: string | null;
  imagePublicId?: string | null;
}

export interface Refugio {
  id: number;
  name: string;
  city: string;
  animals: number;
  adoptions: number;
  years: number;
  gradientFrom: string;
  gradientTo: string;
  initial: string;
}

export type DonationFrequency = 'once' | 'monthly';

export type AuthRole = 'adopter' | 'foundation';

export interface AuthAdopter {
  id: number;
  email: string;
  fullName: string;
  city: string | null;
  phone: string | null;
  avatarUrl: string | null;
  profileComplete: boolean;
}

export interface AuthFoundation {
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
  gradientFrom: string;
  gradientTo: string;
  profileComplete: boolean;
}

export type AuthUser =
  | { role: 'adopter'; profile: AuthAdopter }
  | { role: 'foundation'; profile: AuthFoundation };
