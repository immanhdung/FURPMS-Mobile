/** An imported "Applied research" topic a PI can attach their proposal to.
 *  Confirmed live: the backend has no `title`/`description` fields — the topic name is
 *  `researchArea` and the longer text is `problemDescription`. */
export interface ResearchOrder {
  id: number;
  cycleId: number;
  orderingUnitId?: number | null;
  orderingUnitName?: string | null;
  researchArea: string;
  problemDescription?: string | null;
  expectedProducts?: string | null;
  status?: string | null;
  registeredCount?: number;
}

export interface ResearchOrderListParams {
  cycleId?: number;
  status?: string;
}
