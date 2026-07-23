import { View, Text } from 'react-native';
import { PROPOSAL_STATUS } from '@/constants/statuses';

const HAPPY_PATH = [PROPOSAL_STATUS.DRAFT, PROPOSAL_STATUS.SUBMITTED, PROPOSAL_STATUS.UNDER_REVIEW] as const;

const TERMINAL_LABEL: Record<string, string> = {
  [PROPOSAL_STATUS.APPROVED]: 'Approved',
  [PROPOSAL_STATUS.REJECTED]: 'Rejected',
  [PROPOSAL_STATUS.WITHDRAWN]: 'Withdrawn',
};

const STEP_LABEL: Record<string, string> = {
  [PROPOSAL_STATUS.DRAFT]: 'Draft',
  [PROPOSAL_STATUS.SUBMITTED]: 'Submitted',
  [PROPOSAL_STATUS.UNDER_REVIEW]: 'Under Review',
};

interface ProposalStatusTimelineProps {
  status?: string | null;
}

export function ProposalStatusTimeline({ status }: ProposalStatusTimelineProps) {
  const isTerminal = status && status in TERMINAL_LABEL;
  const currentIndex = isTerminal
    ? HAPPY_PATH.length - 1
    : HAPPY_PATH.findIndex((s) => s === status);
  const steps = isTerminal ? [...HAPPY_PATH, status as string] : HAPPY_PATH;

  return (
    <View className="flex-row">
      {steps.map((step, i) => {
        const label = STEP_LABEL[step] ?? TERMINAL_LABEL[step] ?? step;
        const reached = i <= (isTerminal ? steps.length - 1 : currentIndex);
        const isLast = i === steps.length - 1;
        const isFailure = isTerminal && isLast && (status === PROPOSAL_STATUS.REJECTED || status === PROPOSAL_STATUS.WITHDRAWN);
        return (
          <View key={step} className="items-center flex-1">
            <View className="flex-row items-center w-full">
              <View className="flex-1 h-px bg-neutral-200 dark:bg-dark-200" style={{ opacity: i === 0 ? 0 : 1 }} />
              <View
                className={`w-3 h-3 rounded-full ${
                  reached ? (isFailure ? 'bg-red-500' : 'bg-violet-500') : 'bg-neutral-200 dark:bg-dark-300'
                }`}
              />
              <View className="flex-1 h-px bg-neutral-200 dark:bg-dark-200" style={{ opacity: isLast ? 0 : 1 }} />
            </View>
            <Text
              className={`text-[10px] font-sans mt-1.5 text-center ${
                reached ? 'text-neutral-900 dark:text-neutral-50 font-medium' : 'text-neutral-400 dark:text-dark-500'
              }`}
              numberOfLines={1}
            >
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
