import { httpClient } from '@/services/http.client';
import type { ApiResponse } from '@/types/common';
import type { CouncilMember, RespondMembershipPayload } from '../types/council-member.types';

export const councilMemberService = {
  async list(councilId: string): Promise<CouncilMember[]> {
    const { data } = await httpClient.get<ApiResponse<CouncilMember[]>>(`/councils/${councilId}/members`);
    return data.data;
  },

  async respond(memberId: string, payload: RespondMembershipPayload): Promise<void> {
    await httpClient.patch<ApiResponse<null>>(`/council-members/${memberId}/respond`, payload);
  },
};
