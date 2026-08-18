import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { membershipService } from '../services/membership.service';
import { councilMemberService } from '../services/council-member.service';
import { QUERY_KEYS } from '@/constants/queryKeys';
import type { RespondMembershipPayload } from '../types/council-member.types';

export function useMyMemberships() {
  return useQuery({
    queryKey: QUERY_KEYS.memberships.mine,
    queryFn: () => membershipService.mine(),
    staleTime: 0,
    gcTime: 0,
  });
}

export function useRespondToInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, payload }: { memberId: string; payload: RespondMembershipPayload }) =>
      councilMemberService.respond(memberId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.memberships.mine });
    },
  });
}
