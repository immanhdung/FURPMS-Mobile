import { httpClient } from '@/services/http.client';
import type { ApiResponse } from '@/types/common';
import type { Contract } from '../types/contract.types';

export const contractService = {
  async list(): Promise<Contract[]> {
    const { data } = await httpClient.get<ApiResponse<Contract[]>>('/contracts');
    return data.data;
  },
};
