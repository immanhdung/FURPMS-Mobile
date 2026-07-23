import { httpClient } from '@/services/http.client';
import type { ApiResponse } from '@/types/common';
import type { ResearchOrder, ResearchOrderListParams } from '../types/research-order.types';

export const researchOrderService = {
  async list(params?: ResearchOrderListParams): Promise<ResearchOrder[]> {
    const { data } = await httpClient.get<ApiResponse<ResearchOrder[]>>('/research-orders', { params });
    return data.data;
  },
};
