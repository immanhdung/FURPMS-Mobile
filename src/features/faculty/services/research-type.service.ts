import { httpClient } from '@/services/http.client';
import type { ApiResponse } from '@/types/common';
import type { ResearchType } from '../types/research-type.types';

export const researchTypeService = {
  async list(): Promise<ResearchType[]> {
    const { data } = await httpClient.get<ApiResponse<ResearchType[]>>('/cycles/research-types');
    return data.data;
  },
};
