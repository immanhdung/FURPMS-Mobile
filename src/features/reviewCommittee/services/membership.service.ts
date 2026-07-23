import { httpClient } from '@/services/http.client';
import type { ApiResponse } from '@/types/common';
import type { MyMembership } from '../types/membership.types';

export const membershipService = {
  async mine(): Promise<MyMembership[]> {
    const { data } = await httpClient.get<ApiResponse<MyMembership[]>>('/councils/my-memberships');
    return data.data;
  },
};
