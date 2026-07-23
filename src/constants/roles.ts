export const ROLES = {
  ADMIN: 'Admin',
  STAFF: 'Staff',
  FACULTY: 'Faculty',
  REVIEW_COMMITTEE: 'ReviewCommittee',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** Priority order used to pick a single mobile route group for users with multiple roles. */
export const ROLE_PRIORITY: Role[] = [ROLES.FACULTY, ROLES.REVIEW_COMMITTEE];

export function getPrimaryMobileRole(roles: Role[] | undefined | null): Role | undefined {
  if (!roles) return undefined;
  return ROLE_PRIORITY.find((role) => roles.includes(role));
}
