// __MOCK__
import type {
  UserProfile,
  UserSettings,
  UpdateProfileDTO,
} from '../types/profile.types';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export interface ProfileService {
  getProfile(): Promise<UserProfile>;
  updateProfile(data: UpdateProfileDTO): Promise<UserProfile>;
  getSettings(): Promise<UserSettings>;
  updateSettings(settings: Partial<UserSettings>): Promise<UserSettings>;
}

const MOCK_FACULTY_PROFILE: UserProfile = {
  id: 'u-001',
  email: 'faculty@fpt.edu.vn',
  name: 'Nguyen Van An',
  role: 'FACULTY',
  department: 'Software Engineering',
  faculty: 'Information Technology',
  staffId: 'GV001',
  phone: '0901234567',
  joinedAt: '2018-09-01T00:00:00Z',
  bio: 'Senior lecturer specializing in AI and machine learning applications in education.',
};

const MOCK_REVIEWER_PROFILE: UserProfile = {
  id: 'u-002',
  email: 'reviewer@fpt.edu.vn',
  name: 'Tran Thi Bich',
  role: 'REVIEW_COMMITTEE',
  department: 'Information Technology',
  faculty: 'Information Technology',
  staffId: 'RC001',
  phone: '0907654321',
  joinedAt: '2015-03-15T00:00:00Z',
  bio: 'Associate professor and member of the university research review committee.',
};

const MOCK_SETTINGS: UserSettings = {
  theme: 'system',
  notifications: {
    proposalStatusUpdates: true,
    reviewAssignments: true,
    meetingReminders: true,
    generalAnnouncements: false,
  },
};

const mockProfileService: ProfileService = {
  async getProfile() {
    await delay(300);
    return MOCK_FACULTY_PROFILE;
  },

  async updateProfile(data) {
    await delay(500);
    return { ...MOCK_FACULTY_PROFILE, ...data };
  },

  async getSettings() {
    await delay(200);
    return MOCK_SETTINGS;
  },

  async updateSettings(settings) {
    await delay(300);
    return { ...MOCK_SETTINGS, ...settings };
  },
};

export const profileService: ProfileService = mockProfileService;
