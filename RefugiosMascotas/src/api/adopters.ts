import { apiClient } from './client';
import { mapAdopter } from './mappers';
import type { AdopterApi } from '../types/api';
import type { AuthAdopter } from '../types';

export const adoptersApi = {
  async me(): Promise<AuthAdopter> {
    const { data } = await apiClient.get<AdopterApi>('/adopters/me');
    return mapAdopter(data);
  },
  async updateMe(payload: Partial<{
    full_name: string;
    city: string;
    phone: string;
    avatar_url: string;
  }>): Promise<AuthAdopter> {
    const { data } = await apiClient.patch<AdopterApi>('/adopters/me', payload);
    return mapAdopter(data);
  },
};
