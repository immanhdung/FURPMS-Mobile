import { PROPOSAL_STATUS, type ProposalStatus } from '@/constants/statuses';

export interface StatusConfig {
  label: string;
  bg: string;
  text: string;
  border: string;
}

const lightStatusMap: Record<ProposalStatus, StatusConfig> = {
  [PROPOSAL_STATUS.DRAFT]:              { label: 'Bản nháp',            bg: '#F5F5F7', text: '#6E6E80', border: '#E5E5EA' },
  [PROPOSAL_STATUS.SUBMITTED]:          { label: 'Đã nộp',              bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
  [PROPOSAL_STATUS.UNDER_REVIEW]:       { label: 'Vòng đánh giá',       bg: '#FFFBEB', text: '#92400E', border: '#FDE68A' },
  [PROPOSAL_STATUS.APPROVED]:           { label: 'Đã duyệt',            bg: '#F0FDF4', text: '#166534', border: '#BBF7D0' },
  [PROPOSAL_STATUS.REJECTED]:           { label: 'Không đạt',           bg: '#FEF2F2', text: '#991B1B', border: '#FECACA' },
  [PROPOSAL_STATUS.WITHDRAWN]:          { label: 'Đã rút',              bg: '#F5F5F7', text: '#6E6E80', border: '#E5E5EA' },
  [PROPOSAL_STATUS.IN_PROGRESS_REPORT]: { label: 'Báo cáo tiến độ',     bg: '#F5F3FF', text: '#6D28D9', border: '#DDD6FE' },
  [PROPOSAL_STATUS.IN_FINAL_REPORT]:    { label: 'Báo cáo tổng kết',    bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
  [PROPOSAL_STATUS.IN_ACCEPTANCE]:      { label: 'Đang nghiệm thu',     bg: '#FFFBEB', text: '#92400E', border: '#FDE68A' },
  [PROPOSAL_STATUS.ACCEPTANCE_PASSED]:  { label: 'Nghiệm thu đạt',      bg: '#F0FDF4', text: '#166534', border: '#BBF7D0' },
  [PROPOSAL_STATUS.ACCEPTANCE_FAILED]:  { label: 'Nghiệm thu không đạt', bg: '#FEF2F2', text: '#991B1B', border: '#FECACA' },
};

const darkStatusMap: Record<ProposalStatus, StatusConfig> = {
  [PROPOSAL_STATUS.DRAFT]:              { label: 'Bản nháp',            bg: '#242429', text: '#8C8C9E', border: '#2E2E36' },
  [PROPOSAL_STATUS.SUBMITTED]:          { label: 'Đã nộp',              bg: '#0F1F35', text: '#60A5FA', border: '#1E3A5F' },
  [PROPOSAL_STATUS.UNDER_REVIEW]:       { label: 'Vòng đánh giá',       bg: '#2A1F0A', text: '#FBBF24', border: '#4A3510' },
  [PROPOSAL_STATUS.APPROVED]:           { label: 'Đã duyệt',            bg: '#0F2A1A', text: '#4ADE80', border: '#1A4A2A' },
  [PROPOSAL_STATUS.REJECTED]:           { label: 'Không đạt',           bg: '#2A0F0F', text: '#F87171', border: '#4A1A1A' },
  [PROPOSAL_STATUS.WITHDRAWN]:          { label: 'Đã rút',              bg: '#242429', text: '#8C8C9E', border: '#2E2E36' },
  [PROPOSAL_STATUS.IN_PROGRESS_REPORT]: { label: 'Báo cáo tiến độ',     bg: '#1E1040', text: '#A78BFA', border: '#2D1B60' },
  [PROPOSAL_STATUS.IN_FINAL_REPORT]:    { label: 'Báo cáo tổng kết',    bg: '#0F1F35', text: '#60A5FA', border: '#1E3A5F' },
  [PROPOSAL_STATUS.IN_ACCEPTANCE]:      { label: 'Đang nghiệm thu',     bg: '#2A1F0A', text: '#FBBF24', border: '#4A3510' },
  [PROPOSAL_STATUS.ACCEPTANCE_PASSED]:  { label: 'Nghiệm thu đạt',      bg: '#0F2A1A', text: '#4ADE80', border: '#1A4A2A' },
  [PROPOSAL_STATUS.ACCEPTANCE_FAILED]:  { label: 'Nghiệm thu không đạt', bg: '#2A0F0F', text: '#F87171', border: '#4A1A1A' },
};

function normalize(status?: string | null): ProposalStatus {
  return (status && status in lightStatusMap ? status : PROPOSAL_STATUS.DRAFT) as ProposalStatus;
}

export function getStatusConfig(status: string | null | undefined, colorScheme: 'light' | 'dark' = 'light'): StatusConfig {
  const key = normalize(status);
  return colorScheme === 'dark' ? darkStatusMap[key] : lightStatusMap[key];
}

export function getStatusLabel(status: string | null | undefined): string {
  return lightStatusMap[normalize(status)].label;
}
