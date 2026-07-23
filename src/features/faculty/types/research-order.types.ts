/** An imported "Applied research" topic a PI can attach their proposal to. */
export interface ResearchOrder {
  id: number;
  cycleId: number;
  title: string;
  description?: string | null;
  status?: string | null;
}

export interface ResearchOrderListParams {
  cycleId?: number;
  status?: string;
}
