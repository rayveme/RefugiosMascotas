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
  // Campos del API
  isAdopted?: boolean;
  foundationId?: number;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  // Campos de detalle / datos locales
  photos?: string[];
  description?: string;
  gender?: string;
  weight?: string;
  diseases?: string;
  vaccines?: Vaccine[];
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

export type AuthRole = 'adopter' | 'foundation' | 'admin';

export type FoundationStatus = 'pending' | 'approved' | 'rejected';

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
  status: FoundationStatus;
  // Ubicación adicional
  address: string | null;
  state: string | null;
  postalCode: string | null;
  // Contacto adicional
  whatsapp: string | null;
  website: string | null;
  responsible: string | null;
  // Redes sociales
  instagram: string | null;
  facebook: string | null;
  // Operación
  schedule: string | null;
  references: string | null;
  vetName: string | null;
  vetPhone: string | null;
  // Legal
  legalId: string | null;
  donationClabe: string | null;
  // Documentos de verificación
  idFrontUrl: string | null;
  actaUrl: string | null;
  proofAddressUrl: string | null;
  refugePhotosUrls: string | null;
}

export interface AuthAdmin {
  id: number;
  email: string;
  fullName: string;
}

export type AuthUser =
  | { role: 'adopter'; profile: AuthAdopter }
  | { role: 'foundation'; profile: AuthFoundation }
  | { role: 'admin'; profile: AuthAdmin };

export type AdoptionStatus = 'pending' | 'approved' | 'rejected';

export interface AdoptionPetSummary {
  id: number;
  name: string;
  breed: string;
  type: 'Perro' | 'Gato';
  imagePublicId: string | null;
  imageUrl: string | null;
}

export interface AdoptionAdopterSummary {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  city: string | null;
  avatarUrl: string | null;
  // Perfil del hogar
  housingType: string | null;
  hasGarden: boolean | null;
  hasChildren: boolean | null;
  hasOtherPets: boolean | null;
  otherPetsDesc: string | null;
  adoptionReason: string | null;
  // Documentos (URLs Cloudinary)
  idFrontUrl: string | null;
  idBackUrl: string | null;
  proofAddressUrl: string | null;
  homePhotoUrls: string[];          // ya parseadas del pipe
  signatureUrl: string | null;
}

export interface AdoptionRequest {
  id: number;
  petId: number;
  adopterId: number;
  foundationId: number;
  status: AdoptionStatus;
  message: string | null;
  createdAt: string;
  updatedAt: string;
  pet: AdoptionPetSummary;
  adopter: AdoptionAdopterSummary;
}
