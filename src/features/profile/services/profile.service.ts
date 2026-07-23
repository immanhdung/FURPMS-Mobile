import { httpClient } from '@/services/http.client';
import type {
  UserProfile,
  UserSettings,
  UpdateProfileDTO,
} from '../types/profile.types';

export interface ProfileService {
  getProfile(): Promise<UserProfile>;
  updateProfile(data: UpdateProfileDTO): Promise<UserProfile>;
  getSettings(): Promise<UserSettings>;
  updateSettings(settings: Partial<UserSettings>): Promise<UserSettings>;
}

const realProfileService: ProfileService = {
  async getProfile() {
    const { data } = await httpClient.get<UserProfile>('/users/me');
    return data;
  },

  async updateProfile(payload) {
    const { data } = await httpClient.put<UserProfile>('/users/me', payload);
    return data;
  },

  async getSettings() {
    const { data } = await httpClient.get<UserSettings>('/users/me/settings');
    return data;
  },

  async updateSettings(settings) {
    const { data } = await httpClient.put<UserSettings>('/users/me/settings', settings);
    return data;
  },
};

export const profileService: ProfileService = realProfileService;
