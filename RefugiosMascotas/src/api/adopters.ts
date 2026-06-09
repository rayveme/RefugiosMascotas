import { apiClient, uploadClient } from './client';
import { mapAdopter } from './mappers';
import type { AdopterApi } from '../types/api';
import type { AuthAdopter } from '../types';

export interface DocumentsUploadParams {
  id_front?: File;
  id_back?: File;
  proof_address?: File;
  home_photos?: File[];
  signature?: Blob;           // PNG blob de la firma digital
  housing_type?: string;
  has_garden?: boolean | null;
  has_children?: boolean | null;
  has_other_pets?: boolean | null;
  other_pets_desc?: string;
  adoption_reason?: string;
}

/** Convierte una dataURL base64 (canvas) en un Blob binario. */
export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/png';
  const bytes = atob(data);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

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

  /**
   * Sube documentos y datos del perfil del hogar al backend.
   * Se llama después del registro. Si falla, el registro igual fue exitoso.
   */
  async uploadDocuments(params: DocumentsUploadParams): Promise<void> {
    const form = new FormData();

    if (params.id_front)      form.append('id_front',      params.id_front);
    if (params.id_back)       form.append('id_back',        params.id_back);
    if (params.proof_address) form.append('proof_address',  params.proof_address);
    if (params.home_photos) {
      for (const photo of params.home_photos) {
        form.append('home_photos', photo);
      }
    }
    if (params.signature) {
      form.append('signature', params.signature, 'firma.png');
    }

    // Campos de texto del perfil
    if (params.housing_type != null)  form.append('housing_type',    params.housing_type);
    if (params.has_garden != null)    form.append('has_garden',      String(params.has_garden));
    if (params.has_children != null)  form.append('has_children',    String(params.has_children));
    if (params.has_other_pets != null) form.append('has_other_pets', String(params.has_other_pets));
    if (params.other_pets_desc)       form.append('other_pets_desc', params.other_pets_desc);
    if (params.adoption_reason)       form.append('adoption_reason', params.adoption_reason);

    // axios pone el Content-Type correcto (multipart/form-data) automáticamente
    await uploadClient.post('/adopters/me/documents', form);
  },
};
