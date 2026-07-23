import { useQuery } from '@tanstack/react-query';
import { systemSettingService } from '../services/system-setting.service';
import { QUERY_KEYS } from '@/constants/queryKeys';

export function useUploadPolicy() {
  return useQuery({
    queryKey: QUERY_KEYS.uploadPolicy,
    queryFn: () => systemSettingService.getUploadPolicy(),
    staleTime: 1000 * 60 * 60, // upload policy rarely changes
  });
}
