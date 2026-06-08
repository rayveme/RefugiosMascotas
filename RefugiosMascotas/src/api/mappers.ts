// Traduce los DTOs de la API (snake_case) a los tipos UI (camelCase) que ya
// usaban los componentes existentes. Mantiene el front desacoplado del wire-format.

import type { AdminApi, AdopterApi, AdoptionRequestApi, FoundationApi, PetApi } from '../types/api';
import type { AdoptionRequest, AuthAdmin, AuthAdopter, AuthFoundation, Pet, Refugio } from '../types';

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
    status: f.status,
    // Ubicación adicional
    address:    f.address    ?? null,
    state:      f.state      ?? null,
    postalCode: f.postal_code ?? null,
    // Contacto adicional
    whatsapp:    f.whatsapp    ?? null,
    website:     f.website     ?? null,
    responsible: f.responsible ?? null,
    // Redes sociales
    instagram:    f.instagram     ?? null,
    facebook:     f.facebook      ?? null,
    // Operación
    schedule:     f.schedule      ?? null,
    references:   f.references    ?? null,
    vetName:      f.vet_name      ?? null,
    vetPhone:     f.vet_phone     ?? null,
    // Legal
    legalId:       f.legal_id      ?? null,
    donationClabe: f.donation_clabe ?? null,
    // Documentos de verificación
    idFrontUrl:       f.id_front_url       ?? null,
    actaUrl:          f.acta_url           ?? null,
    proofAddressUrl:  f.proof_address_url  ?? null,
    refugePhotosUrls: f.refuge_photos_urls ?? null,
  };
}

export function mapAdmin(a: AdminApi): AuthAdmin {
  return {
    id: a.id,
    email: a.email,
    fullName: a.full_name,
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

export function mapAdoptionRequest(r: AdoptionRequestApi): AdoptionRequest {
  return {
    id: r.id,
    petId: r.pet_id,
    adopterId: r.adopter_id,
    foundationId: r.foundation_id,
    status: r.status,
    message: r.message,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    pet: {
      id: r.pet.id,
      name: r.pet.name,
      breed: r.pet.breed,
      type: r.pet.type,
      imagePublicId: r.pet.image_public_id,
      imageUrl: r.pet.image_url,
    },
    adopter: {
      id: r.adopter.id,
      fullName: r.adopter.full_name,
      email: r.adopter.email,
      phone: r.adopter.phone,
      city: r.adopter.city,
      avatarUrl: r.adopter.avatar_url,
      // Perfil del hogar
      housingType: r.adopter.housing_type ?? null,
      hasGarden: r.adopter.has_garden ?? null,
      hasChildren: r.adopter.has_children ?? null,
      hasOtherPets: r.adopter.has_other_pets ?? null,
      otherPetsDesc: r.adopter.other_pets_desc ?? null,
      adoptionReason: r.adopter.adoption_reason ?? null,
      // Documentos
      idFrontUrl: r.adopter.id_front_url ?? null,
      idBackUrl: r.adopter.id_back_url ?? null,
      proofAddressUrl: r.adopter.proof_address_url ?? null,
      homePhotoUrls: r.adopter.home_photo_urls
        ? r.adopter.home_photo_urls.split('|').filter(Boolean)
        : [],
      signatureUrl: r.adopter.signature_url ?? null,
    },
  };
}
