import { apiClient } from './client';
import type {
  AdminRegisterPayload,
  AdopterRegisterPayload,
  FoundationRegisterPayload,
  LoginPayload,
  TokenResponse,
} from '../types/api';

export const authApi = {
  registerAdopter(payload: AdopterRegisterPayload) {
    return apiClient
      .post<TokenResponse>('/auth/register/adopter', payload)
      .then((r) => r.data);
  },
  registerFoundation(payload: FoundationRegisterPayload) {
    return apiClient
      .post<TokenResponse>('/auth/register/foundation', payload)
      .then((r) => r.data);
  },
  registerAdmin(payload: AdminRegisterPayload) {
    return apiClient
      .post<TokenResponse>('/auth/register/admin', payload)
      .then((r) => r.data);
  },
  login(payload: LoginPayload) {
    return apiClient.post<TokenResponse>('/auth/login', payload).then((r) => r.data);
  },
  googleLoginUrl(role: 'adopter' | 'foundation', baseUrl: string) {
    return `${baseUrl}/auth/google/login?role=${role}`;
  },
};
