import { httpClient } from '@/services/http.client';
import type { ApiResponse } from '@/types/common';
import type { Cycle } from '../types/cycle.types';

export const cycleService = {
  async list(): Promise<Cycle[]> {
    const { data } = await httpClient.get<ApiResponse<Cycle[]>>('/cycles');
    return data.data;
  },
};
