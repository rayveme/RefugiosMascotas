export interface Vaccine {
  name: string;
  done: boolean;
}

export interface Pet {
  id: number;
  name: string;
  type: string;
  breed: string;
  age: string;
  shelter: string;
  city: string;
  urgent?: boolean;
  vaccinated?: boolean;
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

export type DonationFrequency = "once" | "monthly";
