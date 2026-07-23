import { httpClient } from '@/services/http.client';
import type {
  Meeting,
  MeetingSummary,
  MeetingFilters,
} from '../types/meeting.types';

export interface MeetingService {
  getMeetings(filters?: MeetingFilters): Promise<MeetingSummary[]>;
  getMeetingById(id: string): Promise<Meeting>;
}

const realMeetingService: MeetingService = {
  async getMeetings(filters) {
    const { data } = await httpClient.get<MeetingSummary[]>('/meetings', {
      params: filters,
    });
    return data;
  },

  async getMeetingById(id) {
    const { data } = await httpClient.get<Meeting>(`/meetings/${id}`);
    return data;
  },
};

export const meetingService: MeetingService = realMeetingService;
