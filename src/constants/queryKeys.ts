export const QUERY_KEYS = {
  auth: {
    me: ['auth', 'me'] as const,
  },

  proposals: {
    mine: ['proposals', 'mine'] as const,
    detail: (id: string) => ['proposals', 'detail', id] as const,
    documents: (proposalId: string) => ['proposals', 'documents', proposalId] as const,
    expectedProducts: (proposalId: string) => ['proposals', 'expected-products', proposalId] as const,
  },

  memberships: {
    mine: ['memberships', 'mine'] as const,
  },

  councilMembers: {
    list: (councilId: string) => ['council-members', councilId] as const,
  },

  rubrics: {
    all: ['rubrics'] as const,
  },

  scores: {
    mine: (councilId: string) => ['scores', 'mine', councilId] as const,
    all: (councilId: string) => ['scores', 'all', councilId] as const,
  },

  decisions: {
    byCouncil: (councilId: string) => ['decisions', councilId] as const,
  },

  acceptance: {
    byCouncil: (councilId: string) => ['acceptance', councilId] as const,
  },

  feedback: {
    byCouncil: (councilId: string) => ['feedback', councilId] as const,
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
