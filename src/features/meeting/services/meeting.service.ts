import { httpClient } from '@/services/http.client';
import type { ApiResponse } from '@/types/common';
import type { Meeting } from '../types/meeting.types';

export interface MeetingService {
  list(): Promise<Meeting[]>;
  mine(): Promise<Meeting[]>;
  listByCouncil(councilId: string): Promise<Meeting[]>;
}

const realMeetingService: MeetingService = {
  async list() {
    const { data } = await httpClient.get<ApiResponse<Meeting[]>>('/meetings');
    return data.data;
  },

  async mine() {
    const { data } = await httpClient.get<ApiResponse<Meeting[]>>('/meetings/my');
    return data.data;
  },

  async listByCouncil(councilId) {
    const { data } = await httpClient.get<ApiResponse<Meeting[]>>(`/councils/${councilId}/meetings`);
    return data.data;
  },
};

export const meetingService: MeetingService = realMeetingService;
