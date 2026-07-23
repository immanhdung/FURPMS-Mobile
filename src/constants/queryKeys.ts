import type { ProposalFilters } from '@/features/faculty/types/proposal.types';

export const QUERY_KEYS = {
  auth: {
    me: ['auth', 'me'] as const,
  },

  proposals: {
    all: ['proposals'] as const,
    list: (filters?: ProposalFilters) => ['proposals', 'list', filters] as const,
    detail: (id: string) => ['proposals', 'detail', id] as const,
    stats: ['proposals', 'stats'] as const,
  },

  reviews: {
    all: ['reviews'] as const,
    queue: ['reviews', 'queue'] as const,
    detail: (id: string) => ['reviews', 'detail', id] as const,
    completed: ['reviews', 'completed'] as const,
    stats: ['reviews', 'stats'] as const,
    criteria: (submissionId: string) => ['reviews', 'criteria', submissionId] as const,
    aiSummary: (submissionId: string) => ['reviews', 'ai-summary', submissionId] as const,
    result: (submissionId: string) => ['reviews', 'result', submissionId] as const,
  },

  meetings: {
    all: ['meetings', 'all'] as const,
    byCouncil: (councilId: string) => ['meetings', 'by-council', councilId] as const,
  },

  notifications: {
    feed: ['notifications', 'feed'] as const,
    count: ['notifications', 'count'] as const,
  },

  search: {
    results: (query: string) => ['search', query] as const,
  },

  analytics: {
    faculty: ['analytics', 'faculty'] as const,
    reviewer: ['analytics', 'reviewer'] as const,
  },

  uploadPolicy: ['system-settings', 'upload-policy'] as const,

} as const;
