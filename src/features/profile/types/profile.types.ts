import type { UserRole } from '@/features/auth/types/auth.types';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  faculty?: string;
  avatar?: string;
  staffId?: string;
  phone?: string;
  joinedAt: string;
  bio?: string;
}

export interface NotificationPreferences {
  proposalStatusUpdates: boolean;
  reviewAssignments: boolean;
  meetingReminders: boolean;
  generalAnnouncements: boolean;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationPreferences;
}

export interface UpdateProfileDTO {
  name?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
}
