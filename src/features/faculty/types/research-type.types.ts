/** requireOrderingUnit is what actually drives the wizard's Basic-vs-Applied branch — not a
 *  hardcoded BASIC/APPLIED string. */
export interface ResearchType {
  id: number;
  code: string;
  name: string;
  maxBudgetCap?: number | null;
  requireOrderingUnit: boolean;
  isActive?: boolean;
}
