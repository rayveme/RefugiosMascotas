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
