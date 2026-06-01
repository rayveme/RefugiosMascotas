import { apiClient } from './client';
import { mapAdmin, mapAdopter, mapFoundation, mapPet } from './mappers';
import type { AdminApi, AdopterApi, FoundationApi, FoundationStatusApi, PetApi } from '../types/api';
import type { AuthAdmin, AuthAdopter, AuthFoundation, Pet } from '../types';

export const adminApi = {
  async me(): Promise<AuthAdmin> {
    const { data } = await apiClient.get<AdminApi>('/admin/me');
    return mapAdmin(data);
  },
  // ----- Fundaciones -----
  async listFoundations(status?: FoundationStatusApi): Promise<AuthFoundation[]> {
    const { data } = await apiClient.get<FoundationApi[]>('/admin/foundations', {
      params: status ? { status } : undefined,
    });
    return data.map(mapFoundation);
  },
  async approveFoundation(id: number): Promise<AuthFoundation> {
    const { data } = await apiClient.post<FoundationApi>(`/admin/foundations/${id}/approve`);
    return mapFoundation(data);
  },
  async rejectFoundation(id: number): Promise<AuthFoundation> {
    const { data } = await apiClient.post<FoundationApi>(`/admin/foundations/${id}/reject`);
    return mapFoundation(data);
  },
  async deleteFoundation(id: number): Promise<void> {
    await apiClient.delete(`/admin/foundations/${id}`);
  },

  // ----- Adoptantes -----
  async listAdopters(): Promise<AuthAdopter[]> {
    const { data } = await apiClient.get<AdopterApi[]>('/admin/adopters');
    return data.map(mapAdopter);
  },
  async deleteAdopter(id: number): Promise<void> {
    await apiClient.delete(`/admin/adopters/${id}`);
  },

  // ----- Mascotas -----
  async listPets(): Promise<Pet[]> {
    const { data } = await apiClient.get<PetApi[]>('/admin/pets');
    return data.map(mapPet);
  },
  async deletePet(id: number): Promise<void> {
    await apiClient.delete(`/admin/pets/${id}`);
  },
};
