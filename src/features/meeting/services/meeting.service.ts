import { httpClient } from '@/services/http.client';
import type { ApiResponse } from '@/types/common';
import type { Meeting, AttendanceEntry } from '../types/meeting.types';

export interface MeetingService {
  list(): Promise<Meeting[]>;
  mine(): Promise<Meeting[]>;
  listByCouncil(councilId: string): Promise<Meeting[]>;
  getAttendance(meetingId: string): Promise<AttendanceEntry[]>;
  saveAttendance(meetingId: string, entries: AttendanceEntry[]): Promise<void>;
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

  async getAttendance(meetingId) {
    const { data } = await httpClient.get<ApiResponse<AttendanceEntry[]>>(`/meetings/${meetingId}/attendance`);
    return data.data;
  },

  async saveAttendance(meetingId, entries) {
    await httpClient.put<ApiResponse<null>>(`/meetings/${meetingId}/attendance`, { entries });
  },
};

export const meetingService: MeetingService = realMeetingService;
