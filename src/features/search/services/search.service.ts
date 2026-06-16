// __MOCK__
import type { SearchResult, SearchResponse } from '../types/search.types';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export interface SearchService {
  search(query: string): Promise<SearchResponse>;
}

const ALL_RESULTS: SearchResult[] = [
  {
    id: 'p-001',
    type: 'PROPOSAL',
    title: 'AI-Powered Student Performance Prediction System',
    subtitle: 'Nguyen Van An',
    metadata: 'Artificial Intelligence',
    status: 'UNDER_REVIEW',
  },
  {
    id: 'p-002',
    type: 'PROPOSAL',
    title: 'Blockchain-Based Academic Certificate Verification',
    subtitle: 'Nguyen Van An',
    metadata: 'Blockchain Technology',
    status: 'APPROVED',
  },
  {
    id: 'p-003',
    type: 'PROPOSAL',
    title: 'IoT Smart Campus Energy Management',
    subtitle: 'Nguyen Van An',
    metadata: 'Internet of Things',
    status: 'REVISION_REQUIRED',
  },
  {
    id: 'u-003',
    type: 'PERSON',
    title: 'Le Van Cuong',
    subtitle: 'Faculty — AI & Data Science',
    metadata: 'cuong@fpt.edu.vn',
  },
  {
    id: 'u-004',
    type: 'PERSON',
    title: 'Pham Thi Dung',
    subtitle: 'Faculty — Software Engineering',
    metadata: 'dung@fpt.edu.vn',
  },
  {
    id: 'm-001',
    type: 'MEETING',
    title: 'Review Panel: AI Performance Prediction Proposal',
    subtitle: 'March 25, 2025',
    metadata: 'UPCOMING',
  },
  {
    id: 'm-002',
    type: 'MEETING',
    title: 'Research Committee Monthly Meeting',
    subtitle: 'March 28, 2025',
    metadata: 'UPCOMING',
  },
];

const mockSearchService: SearchService = {
  async search(query) {
    await delay(300);

    if (!query.trim()) {
      return { results: [], total: 0, query };
    }

    const q = query.toLowerCase();
    const results = ALL_RESULTS.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.subtitle?.toLowerCase().includes(q) ||
        r.metadata?.toLowerCase().includes(q),
    );

    return { results, total: results.length, query };
  },
};

export const searchService: SearchService = mockSearchService;
