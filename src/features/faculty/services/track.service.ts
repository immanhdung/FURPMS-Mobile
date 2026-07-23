import { httpClient } from '@/services/http.client';
import type { ApiResponse } from '@/types/common';
import type { Track } from '../types/track.types';

export const trackService = {
  async listByCycle(cycleId: number): Promise<Track[]> {
    const { data } = await httpClient.get<ApiResponse<Track[]>>(`/cycles/${cycleId}/tracks`);
    return data.data;
  },
};
