import { useQuery } from '@tanstack/react-query';
import { meetingService } from '../services/meeting.service';
import { QUERY_KEYS } from '@/constants/queryKeys';
import type { MeetingFilters } from '../types/meeting.types';

export function useMeetings(filters?: MeetingFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.meetings.list(),
    queryFn: () => meetingService.getMeetings(filters),
  });
}

export function useMeeting(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.meetings.detail(id),
    queryFn: () => meetingService.getMeetingById(id),
    enabled: !!id,
  });
}
