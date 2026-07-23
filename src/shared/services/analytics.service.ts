import { httpClient } from '@/services/http.client';
import type { ApiResponse } from '@/types/common';
import type { PiDashboardData, ReviewerDashboardData } from '../types/dashboard.types';

export const analyticsService = {
  async getFacultyDashboard(): Promise<PiDashboardData> {
    const { data } = await httpClient.get<ApiResponse<PiDashboardData>>('/analytics/dashboard/faculty');
    return data.data;
  },

  async getReviewerDashboard(): Promise<ReviewerDashboardData> {
    const { data } = await httpClient.get<ApiResponse<ReviewerDashboardData>>('/analytics/dashboard/reviewer');
    return data.data;
  },
};
