import { httpClient } from '@/services/http.client';
import type { ApiResponse } from '@/types/common';
import type { Cycle } from '../types/cycle.types';

export const cycleService = {
  async list(): Promise<Cycle[]> {
    const { data } = await httpClient.get<ApiResponse<Cycle[]>>('/cycles');
    // Confirmed live: /cycles serializes `id` as a JSON string ("1") even though every other
    // endpoint that references a cycle (e.g. /research-orders' cycleId) uses a number — normalize
    // here so the rest of the app can rely on Cycle.id actually being the number type it declares.
    return data.data.map((c) => ({ ...c, id: Number(c.id) }));
  },
};
