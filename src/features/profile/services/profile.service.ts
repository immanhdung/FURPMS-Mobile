// The real backend has no /users/me profile-edit or /users/me/settings endpoints — profile is
// read-only, sourced from the same /auth/me the auth store already uses.
import { authService } from '@/features/auth/services/auth.service';

export const profileService = {
  getProfile: () => authService.getCurrentUser(),
  changePassword: authService.changePassword,
};
