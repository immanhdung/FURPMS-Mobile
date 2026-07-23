import { httpClient } from '@/services/http.client';
import type { ApiResponse } from '@/types/common';
import type { UploadPolicy } from '../types/system-setting.types';

export const systemSettingService = {
  async getUploadPolicy(): Promise<UploadPolicy> {
    const { data } = await httpClient.get<ApiResponse<UploadPolicy>>('/system-settings/upload-policy');
    return data.data;
  },
};
