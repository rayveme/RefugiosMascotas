import { apiClient } from './client';
import { mapAdoptionRequest } from './mappers';
import type {
  AdoptionRequestApi,
  AdoptionRequestCreatePayload,
  AdoptionStatusApi,
} from '../types/api';
import type { AdoptionRequest } from '../types';

export const adoptionsApi = {
  /** Adopter — crea solicitud para una mascota concreta. */
  async request(petId: number, payload: AdoptionRequestCreatePayload = {}): Promise<AdoptionRequest> {
    const { data } = await apiClient.post<AdoptionRequestApi>(
      `/pets/${petId}/request-adoption`,
      payload,
    );
    return mapAdoptionRequest(data);
  },
  /** Adopter — sus solicitudes (filtrable por estado). */
  async listMine(status?: AdoptionStatusApi): Promise<AdoptionRequest[]> {
    const { data } = await apiClient.get<AdoptionRequestApi[]>('/adoption-requests/mine', {
      params: status ? { status } : undefined,
    });
    return data.map(mapAdoptionRequest);
  },
  /** Foundation — solicitudes recibidas. */
  async listReceived(status?: AdoptionStatusApi): Promise<AdoptionRequest[]> {
    const { data } = await apiClient.get<AdoptionRequestApi[]>('/adoption-requests', {
      params: status ? { status } : undefined,
    });
    return data.map(mapAdoptionRequest);
  },
  /** Foundation — aprueba (auto-rechaza otras pendientes para esa pet). */
  async approve(requestId: number): Promise<AdoptionRequest> {
    const { data } = await apiClient.post<AdoptionRequestApi>(
      `/adoption-requests/${requestId}/approve`,
    );
    return mapAdoptionRequest(data);
  },
  /** Foundation — rechaza esta solicitud (las otras siguen vivas). */
  async reject(requestId: number): Promise<AdoptionRequest> {
    const { data } = await apiClient.post<AdoptionRequestApi>(
      `/adoption-requests/${requestId}/reject`,
    );
    return mapAdoptionRequest(data);
  },
};
