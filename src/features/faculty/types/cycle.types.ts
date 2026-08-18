import type { CycleStatus } from '@/constants/statuses';

export interface Cycle {
  id: number;
  name: string;
  researchTypeId: number;
  status: CycleStatus;
  startDate?: string | null;
  endDate?: string | null;
}
