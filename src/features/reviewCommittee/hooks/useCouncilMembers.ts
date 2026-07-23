import { useQuery } from '@tanstack/react-query';
import { councilMemberService } from '../services/council-member.service';
import { QUERY_KEYS } from '@/constants/queryKeys';

export function useCouncilMembers(councilId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.councilMembers.list(councilId),
    queryFn: () => councilMemberService.list(councilId),
    enabled: !!councilId,
  });
}
