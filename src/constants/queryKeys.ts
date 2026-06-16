import type { ProposalFilters } from '@/features/faculty/types/proposal.types';

export const QUERY_KEYS = {
  auth: {
    profile: ['auth', 'profile'] as const,
  },

  proposals: {
    all: ['proposals'] as const,
    list: (filters?: ProposalFilters) => ['proposals', 'list', filters] as const,
    detail: (id: string) => ['proposals', 'detail', id] as const,
    stats: ['proposals', 'stats'] as const,
  },

  reviews: {
    queue: ['reviews', 'queue'] as const,
    detail: (id: string) => ['reviews', 'detail', id] as const,
    completed: ['reviews', 'completed'] as const,
    stats: ['reviews', 'stats'] as const,
  },

  meetings: {
    list: (role?: string) => ['meetings', 'list', role] as const,
    detail: (id: string) => ['meetings', 'detail', id] as const,
  },

  notifications: {
    feed: ['notifications', 'feed'] as const,
    unreadCount: ['notifications', 'unread-count'] as const,
    detail: (id: string) => ['notifications', 'detail', id] as const,
  },

  search: {
    results: (query: string) => ['search', query] as const,
  },

  profile: {
    me: ['profile', 'me'] as const,
  },
} as const;
