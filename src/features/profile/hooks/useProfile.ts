import { useMutation, useQuery } from '@tanstack/react-query';
import { profileService } from '../services/profile.service';
import { QUERY_KEYS } from '@/constants/queryKeys';
import type { ChangePasswordRequest } from '@/features/auth/types/auth.types';
import type { ApiError } from '@/types/common';

export function useProfile() {
  return useQuery({
    queryKey: QUERY_KEYS.auth.me,
    queryFn: () => profileService.getProfile(),
  });
}

export function useChangePassword() {
  return useMutation<void, ApiError, ChangePasswordRequest>({
    mutationFn: (payload: ChangePasswordRequest) => profileService.changePassword(payload),
  });
}
