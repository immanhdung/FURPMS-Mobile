import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import {
  useReviewSubmission,
  useReviewCriteria,
  useAISummary,
  useReviewResult,
  useSubmitReview,
} from '@/features/reviewCommittee/hooks/useReviews';
import { Badge } from '@/shared/components/ui/Badge';
import { Avatar } from '@/shared/components/ui/Avatar';
import { LoadingState } from '@/shared/components/feedback/LoadingState';
import { ErrorState } from '@/shared/components/feedback/ErrorState';
import { formatDate } from '@/utils/date';
import { formatBudget } from '@/utils/currency';
import type { BadgeVariant } from '@/shared/components/ui/Badge';
import type { ReviewDecision, ReviewStatus } from '@/features/reviewCommittee/types/review.types';
import type { ProposalStatus } from '@/features/faculty/types/proposal.types';

type ActiveTab = 'proposal' | 'ai' | 'score';

const submitSchema = z.object({
  criteriaScores: z.array(
    z.object({
      criteriaId: z.string(),
      criteriaName: z.string(),
      score: z.number().min(0),
      maxScore: z.number(),
      comment: z.string().optional(),
    }),
  ),
  feedback: z.string().min(10, 'Feedback must be at least 10 characters'),
  revisionInstructions: z.string().optional(),
  decision: z.enum(['APPROVE', 'REJECT', 'REVISION_REQUIRED']),
});

type SubmitForm = z.infer<typeof submitSchema>;

const proposalStatusVariant: Record<ProposalStatus, BadgeVariant> = {
  DRAFT: 'default',
  SUBMITTED: 'info',
  UNDER_REVIEW: 'warning',
  REVISION_REQUIRED: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
};

const reviewStatusConfig: Record<ReviewStatus, { label: string; variant: BadgeVariant }> = {
  PENDING: { label: 'Pending', variant: 'warning' },
  IN_PROGRESS: { label: 'In Progress', variant: 'info' },
  COMPLETED: { label: 'Completed', variant: 'success' },
};

const decisionConfig: Record<ReviewDecision, { label: string; variant: BadgeVariant; icon: React.ComponentProps<typeof Ionicons>['name'] }> = {
  APPROVE: { label: 'Approve', variant: 'success', icon: 'checkmark-circle' },
  REJECT: { label: 'Reject', variant: 'danger', icon: 'close-circle' },
  REVISION_REQUIRED: { label: 'Revision Required', variant: 'warning', icon: 'refresh-circle' },
};

function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="text-neutral-900 dark:text-neutral-50 text-base font-semibold mb-3">
      {title}
    </Text>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="gap-0.5">
      <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">{label}</Text>
      <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-medium">{value}</Text>
    </View>
  );
}

export default function ReviewDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<ActiveTab>('proposal');

  const { data: submission, isLoading, isError, refetch } = useReviewSubmission(id);
  const { data: criteria } = useReviewCriteria(id);
  const { data: aiSummary } = useAISummary(id);
  const { data: existingResult } = useReviewResult(id);
  const { mutate: submitReview, isPending: submitting } = useSubmitReview(id);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SubmitForm>({
    resolver: zodResolver(submitSchema),
    defaultValues: {
      criteriaScores:
        criteria?.map((c) => ({
          criteriaId: c.id,
          criteriaName: c.name,
          score: 0,
          maxScore: c.maxScore,
          comment: '',
        })) ?? [],
      feedback: '',
      revisionInstructions: '',
      decision: 'APPROVE',
    },
  });

  const { fields } = useFieldArray({ control, name: 'criteriaScores' });
  const selectedDecision = watch('decision');

  const onRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const onSubmit = (data: SubmitForm) => {
    Alert.alert(
      'Submit Review',
      `Submit decision: ${decisionConfig[data.decision].label}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: () => {
            submitReview(data, {
              onSuccess: () => {
                Alert.alert('Review Submitted', 'Your review has been recorded.', [
                  { text: 'OK', onPress: () => router.back() },
                ]);
              },
            });
          },
        },
      ],
    );
  };

  if (isLoading) return <LoadingState message="Loading submission…" />;
  if (isError || !submission)
    return (
      <ErrorState
        title="Could not load submission"
        message="Check your connection and try again."
        onRetry={refetch}
      />
    );

  const { proposal } = submission;

  const tabLabels: { key: ActiveTab; label: string }[] = [
    { key: 'proposal', label: 'Proposal' },
    { key: 'ai', label: 'AI Summary' },
    { key: 'score', label: 'Score' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-dark-0" edges={['bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={onRefresh}
            tintColor={colors.accent.primary}
            colors={[colors.accent.primary]}
          />
        }
      >
        {/* Hero */}
        <View className="px-5 pt-4 pb-5 gap-3">
          <View className="flex-row items-center gap-2 flex-wrap">
            <Badge
              label={reviewStatusConfig[submission.status].label}
              variant={reviewStatusConfig[submission.status].variant}
              size="md"
            />
            {proposal.status && (
              <Badge
                label={proposal.status}
                variant={proposalStatusVariant[proposal.status]}
                size="md"
              />
            )}
          </View>
          <Text className="text-neutral-900 dark:text-neutral-50 text-xl font-bold leading-snug">
            {proposal.title}
          </Text>
          <View className="flex-row items-center gap-4">
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="flask-outline" size={13} color={colors.icon.muted} />
              <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">
                {proposal.researchField}
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="calendar-outline" size={13} color={colors.icon.muted} />
              <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">
                Due {formatDate(submission.dueDate)}
              </Text>
            </View>
          </View>
        </View>

        {/* Segmented tab control */}
        <View className="px-5 mb-5">
          <View className="flex-row bg-neutral-100 dark:bg-dark-100 rounded-xl p-1 gap-1">
            {tabLabels.map(({ key, label }) => (
              <TouchableOpacity
                key={key}
                onPress={() => setActiveTab(key)}
                activeOpacity={0.7}
                className={`flex-1 py-2 rounded-lg items-center ${
                  activeTab === key ? 'bg-white dark:bg-dark-50' : ''
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    activeTab === key
                      ? 'text-neutral-900 dark:text-neutral-50'
                      : 'text-neutral-500 dark:text-dark-500'
                  }`}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Tab: Proposal ── */}
        {activeTab === 'proposal' && (
          <View className="px-5 gap-5">
            <View>
              <SectionHeader title="Overview" />
              <View className="bg-white dark:bg-dark-50 rounded-2xl border border-neutral-100 dark:border-dark-200 p-4 gap-3">
                <InfoRow label="Research Field" value={proposal.researchField} />
                {proposal.startDate && proposal.endDate && (
                  <>
                    <View className="h-px bg-neutral-100 dark:bg-dark-200" />
                    <InfoRow
                      label="Duration"
                      value={`${formatDate(proposal.startDate)} → ${formatDate(proposal.endDate)}`}
                    />
                  </>
                )}
                {proposal.budget !== undefined && (
                  <>
                    <View className="h-px bg-neutral-100 dark:bg-dark-200" />
                    <InfoRow label="Total Budget" value={formatBudget(proposal.budget)} />
                  </>
                )}
              </View>
            </View>

            {proposal.abstract ? (
              <View>
                <SectionHeader title="Abstract" />
                <View className="bg-white dark:bg-dark-50 rounded-2xl border border-neutral-100 dark:border-dark-200 p-4">
                  <Text className="text-neutral-700 dark:text-dark-400 text-sm font-sans leading-relaxed">
                    {proposal.abstract}
                  </Text>
                </View>
              </View>
            ) : null}

            {proposal.objectives ? (
              <View>
                <SectionHeader title="Objectives" />
                <View className="bg-white dark:bg-dark-50 rounded-2xl border border-neutral-100 dark:border-dark-200 p-4">
                  <Text className="text-neutral-700 dark:text-dark-400 text-sm font-sans leading-relaxed">
                    {proposal.objectives}
                  </Text>
                </View>
              </View>
            ) : null}

            {proposal.methodology ? (
              <View>
                <SectionHeader title="Methodology" />
                <View className="bg-white dark:bg-dark-50 rounded-2xl border border-neutral-100 dark:border-dark-200 p-4">
                  <Text className="text-neutral-700 dark:text-dark-400 text-sm font-sans leading-relaxed">
                    {proposal.methodology}
                  </Text>
                </View>
              </View>
            ) : null}

            {proposal.expectedOutcomes ? (
              <View>
                <SectionHeader title="Expected Outcomes" />
                <View className="bg-white dark:bg-dark-50 rounded-2xl border border-neutral-100 dark:border-dark-200 p-4">
                  <Text className="text-neutral-700 dark:text-dark-400 text-sm font-sans leading-relaxed">
                    {proposal.expectedOutcomes}
                  </Text>
                </View>
              </View>
            ) : null}

            {proposal.team && proposal.team.length > 0 && (
              <View>
                <SectionHeader title={`Team (${proposal.team.length})`} />
                <View className="bg-white dark:bg-dark-50 rounded-2xl border border-neutral-100 dark:border-dark-200 overflow-hidden">
                  {proposal.team.map((member, i) => (
                    <View key={member.id}>
                      {i > 0 && <View className="h-px bg-neutral-100 dark:bg-dark-200 mx-4" />}
                      <View className="flex-row items-center gap-3 px-4 py-3">
                        <Avatar name={member.name} size="sm" />
                        <View className="flex-1">
                          <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-semibold">
                            {member.name}
                          </Text>
                          <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">
                            {member.role}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* ── Tab: AI Summary ── */}
        {activeTab === 'ai' && (
          <View className="px-5 gap-5">
            {!aiSummary ? (
              <View className="items-center justify-center py-16 gap-3">
                <Ionicons name="sparkles-outline" size={40} color={colors.icon.muted} />
                <Text className="text-neutral-500 dark:text-dark-500 text-sm font-sans text-center">
                  AI summary not yet available
                </Text>
              </View>
            ) : (
              <>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="sparkles" size={18} color={colors.accent.primary} />
                    <Text className="text-neutral-700 dark:text-neutral-200 text-base font-semibold">
                      AI Analysis
                    </Text>
                  </View>
                  <Badge
                    label={`${aiSummary.confidence} confidence`}
                    variant={
                      aiSummary.confidence === 'HIGH'
                        ? 'success'
                        : aiSummary.confidence === 'MEDIUM'
                        ? 'warning'
                        : 'default'
                    }
                    size="sm"
                  />
                </View>

                <View>
                  <SectionHeader title="Summary" />
                  <View className="bg-white dark:bg-dark-50 rounded-2xl border border-neutral-100 dark:border-dark-200 p-4">
                    <Text className="text-neutral-700 dark:text-dark-400 text-sm font-sans leading-relaxed">
                      {aiSummary.summary}
                    </Text>
                  </View>
                </View>

                <View className="bg-violet-50 dark:bg-violet-900/20 rounded-2xl border border-violet-100 dark:border-violet-800 p-4 flex-row items-center justify-between">
                  <Text className="text-violet-800 dark:text-violet-200 text-sm font-semibold">
                    Suggested Score
                  </Text>
                  <Text className="text-violet-700 dark:text-violet-300 text-2xl font-bold">
                    {aiSummary.suggestedScore}
                  </Text>
                </View>

                {aiSummary.keyStrengths.length > 0 && (
                  <View>
                    <SectionHeader title="Key Strengths" />
                    <View className="gap-2">
                      {aiSummary.keyStrengths.map((s, i) => (
                        <View
                          key={i}
                          className="flex-row items-start gap-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl px-3 py-2.5"
                        >
                          <Ionicons
                            name="checkmark-circle"
                            size={16}
                            color={colors.accent.success}
                            style={{ marginTop: 1 }}
                          />
                          <Text className="flex-1 text-emerald-800 dark:text-emerald-200 text-sm font-sans leading-snug">
                            {s}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {aiSummary.keyWeaknesses.length > 0 && (
                  <View>
                    <SectionHeader title="Key Weaknesses" />
                    <View className="gap-2">
                      {aiSummary.keyWeaknesses.map((w, i) => (
                        <View
                          key={i}
                          className="flex-row items-start gap-2.5 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2.5"
                        >
                          <Ionicons
                            name="close-circle"
                            size={16}
                            color={colors.accent.danger}
                            style={{ marginTop: 1 }}
                          />
                          <Text className="flex-1 text-red-800 dark:text-red-200 text-sm font-sans leading-snug">
                            {w}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {aiSummary.concernAreas.length > 0 && (
                  <View>
                    <SectionHeader title="Concern Areas" />
                    <View className="gap-2">
                      {aiSummary.concernAreas.map((c, i) => (
                        <View
                          key={i}
                          className="flex-row items-start gap-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-xl px-3 py-2.5"
                        >
                          <Ionicons
                            name="warning"
                            size={16}
                            color={colors.accent.warning}
                            style={{ marginTop: 1 }}
                          />
                          <Text className="flex-1 text-amber-800 dark:text-amber-200 text-sm font-sans leading-snug">
                            {c}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </>
            )}
          </View>
        )}

        {/* ── Tab: Score & Submit ── */}
        {activeTab === 'score' && (
          <View className="px-5 gap-5">
            {submission.status === 'COMPLETED' && existingResult ? (
              /* Completed — read-only result */
              <>
                <View className="bg-white dark:bg-dark-50 rounded-2xl border border-neutral-100 dark:border-dark-200 p-4 gap-3">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-neutral-900 dark:text-neutral-50 text-base font-semibold">
                      Final Decision
                    </Text>
                    <Badge
                      label={decisionConfig[existingResult.decision].label}
                      variant={decisionConfig[existingResult.decision].variant}
                      size="md"
                    />
                  </View>
                  <View className="h-px bg-neutral-100 dark:bg-dark-200" />
                  <View className="flex-row items-center justify-between">
                    <Text className="text-neutral-500 dark:text-dark-500 text-sm font-sans">
                      Overall Score
                    </Text>
                    <Text className="text-neutral-900 dark:text-neutral-50 text-xl font-bold">
                      {existingResult.overallScore.toFixed(1)}
                    </Text>
                  </View>
                  {existingResult.feedback ? (
                    <>
                      <View className="h-px bg-neutral-100 dark:bg-dark-200" />
                      <Text className="text-neutral-700 dark:text-dark-400 text-sm font-sans leading-relaxed">
                        {existingResult.feedback}
                      </Text>
                    </>
                  ) : null}
                </View>

                {existingResult.criteriaScores.map((cs) => (
                  <View
                    key={cs.criteriaId}
                    className="bg-white dark:bg-dark-50 rounded-2xl border border-neutral-100 dark:border-dark-200 p-4 gap-2"
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-semibold flex-1 mr-2">
                        {cs.criteriaName}
                      </Text>
                      <Text className="text-neutral-900 dark:text-neutral-50 text-base font-bold">
                        {cs.score}/{cs.maxScore}
                      </Text>
                    </View>
                    <View className="h-2 bg-neutral-100 dark:bg-dark-200 rounded-full overflow-hidden">
                      <View
                        className="h-full bg-violet-500 rounded-full"
                        style={{ width: `${cs.maxScore > 0 ? (cs.score / cs.maxScore) * 100 : 0}%` }}
                      />
                    </View>
                    {cs.comment ? (
                      <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">
                        {cs.comment}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </>
            ) : (
              /* Active — scoring form */
              <>
                {fields.length > 0 && (
                  <View>
                    <SectionHeader title="Scoring Criteria" />
                    <View className="gap-3">
                      {fields.map((field, index) => (
                        <Controller
                          key={field.id}
                          control={control}
                          name={`criteriaScores.${index}.score`}
                          render={({ field: { value, onChange } }) => (
                            <View className="bg-white dark:bg-dark-50 rounded-2xl border border-neutral-100 dark:border-dark-200 p-4 gap-3">
                              <View className="flex-row items-start justify-between gap-2">
                                <View className="flex-1">
                                  <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-semibold">
                                    {field.criteriaName}
                                  </Text>
                                  <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans mt-0.5">
                                    Max: {field.maxScore}
                                  </Text>
                                </View>
                                <View className="flex-row items-center gap-2">
                                  <TouchableOpacity
                                    onPress={() => onChange(Math.max(0, value - 1))}
                                    activeOpacity={0.7}
                                    className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-dark-100 items-center justify-center"
                                  >
                                    <Ionicons name="remove" size={18} color={colors.icon.default} />
                                  </TouchableOpacity>
                                  <Text className="text-neutral-900 dark:text-neutral-50 text-base font-bold w-8 text-center">
                                    {value}
                                  </Text>
                                  <TouchableOpacity
                                    onPress={() =>
                                      onChange(Math.min(field.maxScore, value + 1))
                                    }
                                    activeOpacity={0.7}
                                    className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 items-center justify-center"
                                  >
                                    <Ionicons name="add" size={18} color={colors.accent.primary} />
                                  </TouchableOpacity>
                                </View>
                              </View>
                              <View className="h-2 bg-neutral-100 dark:bg-dark-200 rounded-full overflow-hidden">
                                <View
                                  className="h-full bg-violet-500 rounded-full"
                                  style={{
                                    width: `${field.maxScore > 0 ? (value / field.maxScore) * 100 : 0}%`,
                                  }}
                                />
                              </View>
                            </View>
                          )}
                        />
                      ))}
                    </View>
                  </View>
                )}

                {/* Feedback */}
                <View>
                  <SectionHeader title="Feedback" />
                  <Controller
                    control={control}
                    name="feedback"
                    render={({ field: { value, onChange } }) => (
                      <View className="bg-white dark:bg-dark-50 rounded-2xl border border-neutral-100 dark:border-dark-200 p-4">
                        <TextInput
                          value={value}
                          onChangeText={onChange}
                          placeholder="Provide detailed feedback on this proposal…"
                          placeholderTextColor={colors.text.tertiary}
                          multiline
                          textAlignVertical="top"
                          style={{
                            color: colors.text.primary,
                            fontSize: 14,
                            lineHeight: 20,
                            minHeight: 100,
                          }}
                        />
                      </View>
                    )}
                  />
                  {errors.feedback && (
                    <Text className="text-red-500 text-xs font-sans mt-1">
                      {errors.feedback.message}
                    </Text>
                  )}
                </View>

                {/* Decision */}
                <View>
                  <SectionHeader title="Decision" />
                  <View className="gap-2">
                    {(['APPROVE', 'REVISION_REQUIRED', 'REJECT'] as ReviewDecision[]).map((d) => (
                      <TouchableOpacity
                        key={d}
                        onPress={() => setValue('decision', d)}
                        activeOpacity={0.7}
                        className={`flex-row items-center gap-3 p-4 rounded-2xl border ${
                          selectedDecision === d
                            ? d === 'APPROVE'
                              ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700'
                              : d === 'REJECT'
                              ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                              : 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700'
                            : 'bg-white dark:bg-dark-50 border-neutral-200 dark:border-dark-200'
                        }`}
                      >
                        <Ionicons
                          name={decisionConfig[d].icon}
                          size={22}
                          color={
                            selectedDecision === d
                              ? d === 'APPROVE'
                                ? colors.accent.success
                                : d === 'REJECT'
                                ? colors.accent.danger
                                : colors.accent.warning
                              : colors.icon.muted
                          }
                        />
                        <Text
                          className={`flex-1 text-base font-semibold ${
                            selectedDecision === d
                              ? d === 'APPROVE'
                                ? 'text-emerald-700 dark:text-emerald-300'
                                : d === 'REJECT'
                                ? 'text-red-700 dark:text-red-300'
                                : 'text-amber-700 dark:text-amber-300'
                              : 'text-neutral-700 dark:text-dark-400'
                          }`}
                        >
                          {decisionConfig[d].label}
                        </Text>
                        {selectedDecision === d && (
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color={
                              d === 'APPROVE'
                                ? colors.accent.success
                                : d === 'REJECT'
                                ? colors.accent.danger
                                : colors.accent.warning
                            }
                          />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Revision instructions */}
                {selectedDecision === 'REVISION_REQUIRED' && (
                  <View>
                    <SectionHeader title="Revision Instructions" />
                    <Controller
                      control={control}
                      name="revisionInstructions"
                      render={({ field: { value, onChange } }) => (
                        <View className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-800 p-4">
                          <TextInput
                            value={value}
                            onChangeText={onChange}
                            placeholder="Describe what changes are required…"
                            placeholderTextColor={colors.text.tertiary}
                            multiline
                            textAlignVertical="top"
                            style={{
                              color: colors.text.primary,
                              fontSize: 14,
                              lineHeight: 20,
                              minHeight: 80,
                            }}
                          />
                        </View>
                      )}
                    />
                  </View>
                )}

                {/* Submit */}
                <TouchableOpacity
                  onPress={handleSubmit(onSubmit)}
                  disabled={submitting}
                  activeOpacity={0.8}
                  className={`mt-2 py-4 rounded-2xl items-center ${
                    submitting
                      ? 'bg-neutral-200 dark:bg-dark-200'
                      : 'bg-violet-500 dark:bg-violet-600'
                  }`}
                >
                  <Text
                    className={`text-base font-semibold ${
                      submitting ? 'text-neutral-400' : 'text-white'
                    }`}
                  >
                    {submitting ? 'Submitting…' : 'Submit Review'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
