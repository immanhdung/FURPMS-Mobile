import { httpClient } from '@/services/http.client';
import type { ApiResponse } from '@/types/common';
import type { AcceptanceDossier } from '../types/acceptance-dossier.types';
export const acceptanceDossierService = { async get(councilId: string, proposalId: string) { const { data } = await httpClient.get<ApiResponse<AcceptanceDossier>>(`/councils/${councilId}/proposals/${proposalId}/dossier`); return data.data; } };
