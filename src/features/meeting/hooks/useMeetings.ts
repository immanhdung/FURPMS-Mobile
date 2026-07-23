import { useQuery } from '@tanstack/react-query';
import { meetingService } from '../services/meeting.service';
import { QUERY_KEYS } from '@/constants/queryKeys';

export function useMeetings() {
  return useQuery({
    queryKey: QUERY_KEYS.meetings.all,
    queryFn: () => meetingService.list(),
  });
}

/** No GET /meetings/{id} exists on the real backend — select out of the already-fetched list. */
export function useMeeting(id: string) {
  const query = useMeetings();
  const meeting = query.data?.find((m) => m.id === id) ?? null;
  return { ...query, data: meeting };
}

export function useCouncilMeetings(councilId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.meetings.byCouncil(councilId),
    queryFn: () => meetingService.listByCouncil(councilId),
    enabled: !!councilId,
  });
}
