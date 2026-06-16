export type UserRole = 'FACULTY' | 'REVIEW_COMMITTEE';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  faculty?: string;
  avatar?: string;
  staffId?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends TokenPair {
  user: User;
}
