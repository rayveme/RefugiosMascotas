import { apiClient, uploadClient } from './client';
import { mapPet } from './mappers';
import type { PetApi, PetCreatePayload } from '../types/api';
import type { Pet } from '../types';

export interface PetFilters {
  type?: 'Perro' | 'Gato';
  city?: string;
  urgent?: boolean;
  foundation_id?: number;
  include_adopted?: boolean;
  limit?: number;
  offset?: number;
}

export const petsApi = {
  async list(filters: PetFilters = {}): Promise<Pet[]> {
    const { data } = await apiClient.get<PetApi[]>('/pets', { params: filters });
    return data.map(mapPet);
  },
  async get(id: number): Promise<Pet> {
    const { data } = await apiClient.get<PetApi>(`/pets/${id}`);
    return mapPet(data);
  },
  async create(payload: PetCreatePayload): Promise<Pet> {
    const { data } = await apiClient.post<PetApi>('/pets', payload);
    return mapPet(data);
  },
  async update(id: number, payload: Partial<PetCreatePayload>): Promise<Pet> {
    const { data } = await apiClient.patch<PetApi>(`/pets/${id}`, payload);
    return mapPet(data);
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/pets/${id}`);
  },
  async uploadImage(id: number, file: File): Promise<Pet> {
    const form = new FormData();
    form.append('file', file);
    // No seteamos Content-Type — axios genera "multipart/form-data; boundary=..." solo.
    const { data } = await uploadClient.post<PetApi>(`/pets/${id}/image`, form);
    return mapPet(data);
  },
  async deleteImage(id: number): Promise<Pet> {
    const { data } = await apiClient.delete<PetApi>(`/pets/${id}/image`);
    return mapPet(data);
  },
};
