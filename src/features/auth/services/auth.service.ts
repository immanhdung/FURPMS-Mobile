// __MOCK__
import type {
  LoginCredentials,
  AuthResponse,
  User,
  TokenPair,
} from '../types/auth.types';

export const SECURE_KEYS = {
  ACCESS_TOKEN: 'furpms_access_token',
  REFRESH_TOKEN: 'furpms_refresh_token',
  USER: 'furpms_user',
} as const;

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export interface AuthService {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  logout(): Promise<void>;
  getProfile(): Promise<User>;
  refreshToken(refreshToken: string): Promise<TokenPair>;
}

const MOCK_USERS: Record<string, AuthResponse> = {
  'faculty@fpt.edu.vn': {
    accessToken: 'mock_access_token_faculty',
    refreshToken: 'mock_refresh_token_faculty',
    user: {
      id: 'u-001',
      email: 'faculty@fpt.edu.vn',
      name: 'Nguyen Van An',
      role: 'FACULTY',
      department: 'Software Engineering',
      faculty: 'Information Technology',
      staffId: 'GV001',
    },
  },
  'reviewer@fpt.edu.vn': {
    accessToken: 'mock_access_token_reviewer',
    refreshToken: 'mock_refresh_token_reviewer',
    user: {
      id: 'u-002',
      email: 'reviewer@fpt.edu.vn',
      name: 'Tran Thi Bich',
      role: 'REVIEW_COMMITTEE',
      department: 'Information Technology',
      faculty: 'Information Technology',
      staffId: 'RC001',
    },
  },
};

const mockAuthService: AuthService = {
  async login(credentials) {
    await delay(600);

    const match = MOCK_USERS[credentials.email];
    if (match && credentials.password === 'password') {
      return match;
    }
    throw new Error('Invalid email or password');
  },

  async logout() {
    await delay(200);
  },

  async getProfile() {
    await delay(300);
    return MOCK_USERS['faculty@fpt.edu.vn'].user;
  },

  async refreshToken(_token) {
    await delay(300);
    return {
      accessToken: 'mock_new_access_token',
      refreshToken: 'mock_new_refresh_token',
    };
  },
};

export const authService: AuthService = mockAuthService;
