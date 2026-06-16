import type { ProposalStatus } from '@/features/faculty/types/proposal.types';

export interface StatusConfig {
  label: string;
  bg: string;
  text: string;
  border: string;
}

const lightStatusMap: Record<ProposalStatus, StatusConfig> = {
  DRAFT: {
    label: 'Draft',
    bg: '#F5F5F7',
    text: '#6E6E80',
    border: '#E5E5EA',
  },
  SUBMITTED: {
    label: 'Submitted',
    bg: '#EFF6FF',
    text: '#1D4ED8',
    border: '#BFDBFE',
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    bg: '#FFFBEB',
    text: '#92400E',
    border: '#FDE68A',
  },
  REVISION_REQUIRED: {
    label: 'Needs Revision',
    bg: '#FFFBEB',
    text: '#92400E',
    border: '#FDE68A',
  },
  APPROVED: {
    label: 'Approved',
    bg: '#F0FDF4',
    text: '#166534',
    border: '#BBF7D0',
  },
  REJECTED: {
    label: 'Rejected',
    bg: '#FEF2F2',
    text: '#991B1B',
    border: '#FECACA',
  },
};

const darkStatusMap: Record<ProposalStatus, StatusConfig> = {
  DRAFT: {
    label: 'Draft',
    bg: '#242429',
    text: '#8C8C9E',
    border: '#2E2E36',
  },
  SUBMITTED: {
    label: 'Submitted',
    bg: '#0F1F35',
    text: '#60A5FA',
    border: '#1E3A5F',
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    bg: '#2A1F0A',
    text: '#FBBF24',
    border: '#4A3510',
  },
  REVISION_REQUIRED: {
    label: 'Needs Revision',
    bg: '#2A1F0A',
    text: '#FBBF24',
    border: '#4A3510',
  },
  APPROVED: {
    label: 'Approved',
    bg: '#0F2A1A',
    text: '#4ADE80',
    border: '#1A4A2A',
  },
  REJECTED: {
    label: 'Rejected',
    bg: '#2A0F0F',
    text: '#F87171',
    border: '#4A1A1A',
  },
};

export function getStatusConfig(
  status: ProposalStatus,
  colorScheme: 'light' | 'dark' = 'light',
): StatusConfig {
  return colorScheme === 'dark'
    ? darkStatusMap[status]
    : lightStatusMap[status];
}

export function getStatusLabel(status: ProposalStatus): string {
  return lightStatusMap[status].label;
}
