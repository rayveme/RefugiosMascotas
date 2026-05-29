import { apiClient } from './client';
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
  async updateMe(payload: Partial<{
    name: string;
    city: string;
    description: string;
    phone: string;
    years: number;
    initial: string;
    gradient_from: string;
    gradient_to: string;
  }>): Promise<AuthFoundation> {
    const { data } = await apiClient.patch<FoundationApi>('/foundations/me', payload);
    return mapFoundation(data);
  },
};
