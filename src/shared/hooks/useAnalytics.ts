import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analytics.service';
import { QUERY_KEYS } from '@/constants/queryKeys';

export function useFacultyDashboard() {
  return useQuery({
    queryKey: QUERY_KEYS.analytics.faculty,
    queryFn: () => analyticsService.getFacultyDashboard(),
  });
}

export function useReviewerDashboard() {
  return useQuery({
    queryKey: QUERY_KEYS.analytics.reviewer,
    queryFn: () => analyticsService.getReviewerDashboard(),
  });
}
