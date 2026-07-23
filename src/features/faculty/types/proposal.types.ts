import type { ProposalMember } from './proposal-member.types';

/** Matches the real /proposals/my list item shape. */
export interface ProposalSummary {
  id: string;
  titleVI?: string | null;
  titleEN?: string | null;
  cycleId?: number | null;
  cycleName?: string | null;
  trackId?: string | null;
  trackName?: string | null;
  status?: string | null;
  researchType?: number | null;
  createdAt?: string | null;
}

/** researchType is a numeric FK to ResearchType (see research-type.types.ts), not a string enum —
 *  the wizard branches on ResearchType.requireOrderingUnit, not on this value directly. */
export interface ProposalDetail {
  id: string;
  cycleId?: number | null;
  orderId?: number | null;
  trackId?: string | null;
  titleVI?: string | null;
  titleEN?: string | null;
  researchType: number;
  durationMonths: number;
  objectives?: string | null;
  methodology?: string | null;
  expectedOutput?: string | null;
  abstractEN?: string | null;
  urgency?: string | null;
  novelty?: string | null;
  applicationPotential?: string | null;
  transferPotential?: string | null;
  facilities?: string | null;
  fundingMethod?: string | null;
  members?: ProposalMember[] | null;
  status?: string | null;
  createdAt?: string | null;
}

export interface ProposalPayload {
  cycleId?: number;
  orderId?: number;
  trackId?: string;
  titleVI?: string;
  titleEN?: string;
  researchType: number;
  durationMonths: number;
  objectives?: string;
  methodology?: string;
  expectedOutput?: string;
  abstractEN?: string;
  urgency?: string;
  novelty?: string;
  applicationPotential?: string;
  transferPotential?: string;
  facilities?: string;
  fundingMethod?: string;
  members?: ProposalMember[];
}
