// Traduce los DTOs de la API (snake_case) a los tipos UI (camelCase) que ya
// usaban los componentes existentes. Mantiene el front desacoplado del wire-format.

import type { AdopterApi, FoundationApi, PetApi } from '../types/api';
import type { AuthAdopter, AuthFoundation, Pet, Refugio } from '../types';

export function mapAdopter(a: AdopterApi): AuthAdopter {
  return {
    id: a.id,
    email: a.email,
    fullName: a.full_name,
    city: a.city,
    phone: a.phone,
    avatarUrl: a.avatar_url,
    profileComplete: a.profile_complete,
  };
}

export function mapFoundation(f: FoundationApi): AuthFoundation {
  return {
    id: f.id,
    email: f.email,
    name: f.name,
    city: f.city,
    description: f.description,
    phone: f.phone,
    years: f.years,
    adoptions: f.adoptions,
    animals: f.animals,
    initial: f.initial,
    gradientFrom: f.gradient_from,
    gradientTo: f.gradient_to,
    profileComplete: f.profile_complete,
  };
}

export function mapFoundationToRefugio(f: FoundationApi): Refugio {
  return {
    id: f.id,
    name: f.name,
    city: f.city,
    animals: f.animals,
    adoptions: f.adoptions,
    years: f.years,
    gradientFrom: f.gradient_from,
    gradientTo: f.gradient_to,
    initial: f.initial || f.name.charAt(0).toUpperCase(),
  };
}

export function mapPet(p: PetApi): Pet {
  return {
    id: p.id,
    name: p.name,
    type: p.type,
    breed: p.breed,
    age: p.age,
    shelter: p.shelter,
    city: p.city,
    urgent: p.urgent,
    vaccinated: p.vaccinated,
    sterilized: p.sterilized,
    gradientFrom: p.gradient_from,
    gradientTo: p.gradient_to,
    isAdopted: p.is_adopted,
    foundationId: p.foundation_id,
    imageUrl: p.image_url,
    imagePublicId: p.image_public_id,
  };
}
