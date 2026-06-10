import { apiClient, uploadClient } from './client';
import { mapFoundation, mapFoundationToRefugio } from './mappers';
import type { FoundationApi } from '../types/api';
import type { AuthFoundation, Refugio } from '../types';

export interface FoundationFilters {
  search?: string;
  city?: string;
  limit?: number;
  offset?: number;
}

export const foundationsApi = {
  async list(filters: FoundationFilters = {}): Promise<Refugio[]> {
    const { data } = await apiClient.get<FoundationApi[]>('/foundations', { params: filters });
    return data.map(mapFoundationToRefugio);
  },
  async get(id: number): Promise<Refugio> {
    const { data } = await apiClient.get<FoundationApi>(`/foundations/${id}`);
    return mapFoundationToRefugio(data);
  },
  async me(): Promise<AuthFoundation> {
    const { data } = await apiClient.get<FoundationApi>('/foundations/me');
    return mapFoundation(data);
  },
  async uploadDocuments(params: {
    idFront?:      File | null;
    acta?:         File | null;
    proofAddress?: File | null;
    refugePhotos?: File[];
  }): Promise<AuthFoundation> {
    const form = new FormData();
    if (params.idFront)      form.append('id_front',      params.idFront);
    if (params.acta)         form.append('acta',          params.acta);
    if (params.proofAddress) form.append('proof_address', params.proofAddress);
    (params.refugePhotos ?? []).forEach(f => form.append('refuge_photos', f));
    const { data } = await uploadClient.post<FoundationApi>('/foundations/me/documents', form);
    return mapFoundation(data);
  },
  async updateMe(payload: Partial<{
    name: string;
    city: string;
    description: string | null;
    phone: string | null;
    years: number;
    initial: string;
    gradient_from: string;
    gradient_to: string;
    // Ubicación
    address: string | null;
    state: string | null;
    postal_code: string | null;
    // Contacto
    whatsapp: string | null;
    website: string | null;
    responsible: string | null;
    // Redes sociales
    instagram: string | null;
    facebook: string | null;
    // Operación
    schedule: string | null;
    references: string | null;
    vet_name: string | null;
    vet_phone: string | null;
    // Legal
    legal_id: string | null;
    donation_clabe: string | null;
  }>): Promise<AuthFoundation> {
    const { data } = await apiClient.patch<FoundationApi>('/foundations/me', payload);
    return mapFoundation(data);
  },
};
