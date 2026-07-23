import { View, Text } from 'react-native';

const STEP_LABELS = ['Track', 'Content', 'Details', 'Team', 'Preview'];

interface WizardStepperProps {
  currentStep: number; // 1-indexed
}

export function WizardStepper({ currentStep }: WizardStepperProps) {
  return (
    <View className="flex-row items-center px-5 pt-2 pb-4">
      {STEP_LABELS.map((label, i) => {
        const step = i + 1;
        const reached = step <= currentStep;
        const isLast = i === STEP_LABELS.length - 1;
        return (
          <View key={label} className="flex-1 items-center">
            <View className="flex-row items-center w-full">
              <View className="flex-1 h-px bg-neutral-200 dark:bg-dark-200" style={{ opacity: i === 0 ? 0 : 1 }} />
              <View
                className={`w-6 h-6 rounded-full items-center justify-center ${
                  reached ? 'bg-violet-500' : 'bg-neutral-200 dark:bg-dark-300'
                }`}
              >
                <Text className={`text-[10px] font-bold ${reached ? 'text-white' : 'text-neutral-500 dark:text-dark-500'}`}>
                  {step}
                </Text>
              </View>
              <View className="flex-1 h-px bg-neutral-200 dark:bg-dark-200" style={{ opacity: isLast ? 0 : 1 }} />
            </View>
            <Text
              className={`text-[10px] font-sans mt-1 ${
                reached ? 'text-neutral-900 dark:text-neutral-50 font-medium' : 'text-neutral-400 dark:text-dark-500'
              }`}
            >
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
