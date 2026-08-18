import { View, Text } from 'react-native';
import { PROPOSAL_STATUS } from '@/constants/statuses';

/**
 * Full lifecycle timeline — 6 clearly labelled stages:
 *   Bản nháp → Đã nộp → Vòng đánh giá → Báo cáo tiến độ → Báo cáo tổng kết → Nghiệm thu
 *
 * Terminal (off-happy-path) statuses such as REJECTED, WITHDRAWN, ACCEPTANCE_FAILED
 * are appended as a red dot after the last happy-path step reached.
 */

const HAPPY_PATH = [
  PROPOSAL_STATUS.DRAFT,
  PROPOSAL_STATUS.SUBMITTED,
  PROPOSAL_STATUS.UNDER_REVIEW,
  PROPOSAL_STATUS.APPROVED,
  PROPOSAL_STATUS.IN_PROGRESS_REPORT,
  PROPOSAL_STATUS.IN_FINAL_REPORT,
  PROPOSAL_STATUS.IN_ACCEPTANCE,
  PROPOSAL_STATUS.ACCEPTANCE_PASSED,
] as const;

const STEP_LABEL: Record<string, string> = {
  [PROPOSAL_STATUS.DRAFT]:              'Bản nháp',
  [PROPOSAL_STATUS.SUBMITTED]:          'Đã nộp',
  [PROPOSAL_STATUS.UNDER_REVIEW]:       'Vòng\nđánh giá',
  [PROPOSAL_STATUS.APPROVED]:           'Đã duyệt',
  [PROPOSAL_STATUS.IN_PROGRESS_REPORT]: 'BC\ntiến độ',
  [PROPOSAL_STATUS.IN_FINAL_REPORT]:    'BC\ntổng kết',
  [PROPOSAL_STATUS.IN_ACCEPTANCE]:      'Nghiệm\nthu',
  [PROPOSAL_STATUS.ACCEPTANCE_PASSED]:  'Hoàn\nthành',
};

/** Statuses that cut the happy path short with a negative/neutral outcome */
const FAILURE_STATUSES = new Set([
  PROPOSAL_STATUS.REJECTED,
  PROPOSAL_STATUS.WITHDRAWN,
  PROPOSAL_STATUS.ACCEPTANCE_FAILED,
]);

const FAILURE_LABELS: Record<string, string> = {
  [PROPOSAL_STATUS.REJECTED]:          'Không đạt',
  [PROPOSAL_STATUS.WITHDRAWN]:         'Đã rút',
  [PROPOSAL_STATUS.ACCEPTANCE_FAILED]: 'NT\nkhông đạt',
};

/** Map a failure status to the last happy-path step before it occurred */
const FAILURE_AFTER: Record<string, string> = {
  [PROPOSAL_STATUS.REJECTED]:          PROPOSAL_STATUS.UNDER_REVIEW,
  [PROPOSAL_STATUS.WITHDRAWN]:         PROPOSAL_STATUS.SUBMITTED,
  [PROPOSAL_STATUS.ACCEPTANCE_FAILED]: PROPOSAL_STATUS.IN_ACCEPTANCE,
};

interface ProposalStatusTimelineProps {
  status?: string | null;
}

export function ProposalStatusTimeline({ status }: ProposalStatusTimelineProps) {
  const isFailure = status != null && status in FAILURE_LABELS;

  // Determine how far along the happy path we are
  const failureAfterStep = isFailure ? FAILURE_AFTER[status!] : undefined;
  const happyIndex = isFailure
    ? HAPPY_PATH.indexOf((failureAfterStep ?? '') as (typeof HAPPY_PATH)[number])
    : HAPPY_PATH.indexOf((status ?? '') as (typeof HAPPY_PATH)[number]);

  // Build visible steps: happy path steps up to and including current, then terminal step if failure
  const visibleSteps: string[] = isFailure
    ? [...HAPPY_PATH.slice(0, happyIndex + 1), status!]
    : [...HAPPY_PATH];

  // Index of the "reached" dot (everything <= reachedIndex is filled)
  const reachedIndex = isFailure ? visibleSteps.length - 1 : (happyIndex >= 0 ? happyIndex : 0);

  return (
    <View style={{ flexDirection: 'row', marginVertical: 4 }}>
      {visibleSteps.map((step, i) => {
        const label = STEP_LABEL[step] ?? FAILURE_LABELS[step] ?? step;
        const reached = i <= reachedIndex;
        const isLast = i === visibleSteps.length - 1;
        const isCurrent = i === reachedIndex;
        const isTerminalFailure = isFailure && isLast;
        const isSuccess = step === PROPOSAL_STATUS.ACCEPTANCE_PASSED && reached;

        let dotColor = 'bg-neutral-200 dark:bg-dark-300';
        if (reached) {
          if (isTerminalFailure) dotColor = 'bg-red-500';
          else if (isSuccess) dotColor = 'bg-emerald-500';
          else dotColor = 'bg-violet-500';
        }

        let labelColor = 'text-neutral-400 dark:text-dark-500';
        if (reached) {
          if (isTerminalFailure) labelColor = 'text-red-600 dark:text-red-400';
          else if (isSuccess) labelColor = 'text-emerald-600 dark:text-emerald-400';
          else if (isCurrent) labelColor = 'text-violet-600 dark:text-violet-400';
          else labelColor = 'text-neutral-700 dark:text-neutral-300';
        }

        return (
          <View key={step} style={{ alignItems: 'center', flex: 1 }}>
            {/* Connector line + dot row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
              <View
                style={{ flex: 1, height: 1 }}
                className={i === 0 ? '' : (reached ? 'bg-violet-400 dark:bg-violet-600' : 'bg-neutral-200 dark:bg-dark-300')}
              />
              <View
                className={`${dotColor} ${isCurrent ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5'} rounded-full`}
                style={isCurrent ? { shadowColor: '#7C3AED', shadowRadius: 4, shadowOpacity: 0.4, elevation: 2 } : undefined}
              />
              <View
                style={{ flex: 1, height: 1 }}
                className={isLast ? '' : (reached ? 'bg-violet-400 dark:bg-violet-600' : 'bg-neutral-200 dark:bg-dark-300')}
              />
            </View>

            {/* Label */}
            <Text
              className={`text-[9px] font-sans mt-1.5 text-center ${labelColor} ${isCurrent ? 'font-semibold' : ''}`}
              numberOfLines={2}
            >
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
