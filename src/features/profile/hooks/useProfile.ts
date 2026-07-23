import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../services/profile.service';
import { QUERY_KEYS } from '@/constants/queryKeys';
import type { UpdateProfileDTO } from '../types/profile.types';

export function useProfile() {
  return useQuery({
    queryKey: QUERY_KEYS.profile.me,
    queryFn: () => profileService.getProfile(),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfileDTO) => profileService.updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile.me });
    },
  });
}
