import { useEffect, useState, useMemo } from 'react';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { PickerField } from '@/shared/components/ui/PickerField';
import { LoadingState } from '@/shared/components/feedback/LoadingState';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { useDecision, useSaveMinutes, useApproveMinutes } from '@/features/reviewCommittee/hooks/useDecision';
import { useAllScores, useBallotTally } from '@/features/reviewCommittee/hooks/useReviewScoring';
import { useFeedback } from '@/features/reviewCommittee/hooks/useFeedback';
import { useCouncilMembers } from '@/features/reviewCommittee/hooks/useCouncilMembers';
import { useCouncilMeetings, useMeetingAttendance, useSaveAttendance } from '@/features/meeting/hooks/useMeetings';
import { isChairmanRole, isSecretaryRole, MEMBER_ROLE_LABELS, localizeLabel } from '@/constants/statuses';
import { useTheme } from '@/hooks/useTheme';
import type { MemberOpinion, QaEntry } from '../types/decision.types';

interface MinutesPanelProps {
  councilId: string;
  projectId?: string | null;
  memberRole?: string | null;
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={{ width: '50%' }} className="items-center gap-1 p-2">
      <Text className="text-neutral-900 dark:text-neutral-50 text-base font-bold">{value}</Text>
      <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans text-center">{label}</Text>
    </View>
  );
}

export function MinutesPanel({ councilId, projectId, memberRole }: MinutesPanelProps) {
  const { t } = useTranslation(['reviewer', 'common']);
  const { colors } = useTheme();

  // Queries
  const { data: decision, isLoading: decisionLoading } = useDecision(councilId);
  const { data: allScores, isLoading: scoresLoading } = useAllScores(councilId);
  const { data: feedback, isLoading: feedbackLoading } = useFeedback(councilId);
  const { data: councilMembers } = useCouncilMembers(councilId);
  
  // Attendance & Meetings
  const { data: meetings } = useCouncilMeetings(councilId);
  const meetingId = useMemo(() => meetings?.[0]?.id ?? null, [meetings]);
  const { data: attendanceData, isLoading: attendanceLoading } = useMeetingAttendance(meetingId);
  const { data: tally } = useBallotTally(councilId, projectId);

  // Mutations
  const { mutate: saveMinutes, isPending: isSaving } = useSaveMinutes(councilId);
  const { mutate: approveMinutes, isPending: isApproving } = useApproveMinutes(councilId);
  const { mutate: saveAttendance, isPending: isSavingAttendance } = useSaveAttendance(meetingId ?? '');

  const secretary = isSecretaryRole(memberRole);
  const chairman = isChairmanRole(memberRole);
  const locked = !!decision?.finalizedAt;

  // Local States
  const [result, setResult] = useState('APPROVED');
  const [councilComments, setCouncilComments] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [qaEntries, setQaEntries] = useState<QaEntry[]>([]);
  const [opinions, setOpinions] = useState<MemberOpinion[]>([]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});

  // Dropdown options
  const resultOptions = useMemo(() => [
    { value: 'APPROVED', label: 'Đạt — đề tài qua vòng này', description: 'Đề tài đáp ứng yêu cầu và qua vòng này' },
    { value: 'REVISION_REQUIRED', label: 'Cần chỉnh sửa — PI sửa và nộp lại', description: 'PI cần chỉnh sửa nội dung theo góp ý và nộp lại' },
    { value: 'REJECTED', label: 'Không đạt — đề tài dừng lại', description: 'Đề tài dừng lại và không được đi tiếp' },
  ], []);

  useEffect(() => {
    if (!decision) return;
    if (decision.result) setResult(decision.result);
    setCouncilComments(decision.councilComments ?? '');
    setRecommendations(decision.recommendations ?? '');
    setQaEntries(decision.qaEntries ?? []);
    setOpinions(decision.memberOpinions ?? []);
  }, [decision]);

  useEffect(() => {
    if (!attendanceData) return;
    const initial: Record<string, boolean> = {};
    attendanceData.forEach((entry) => {
      initial[entry.memberId] = !!entry.attended;
    });
    setAttendance(initial);
  }, [attendanceData]);

  function nameFor(userId?: string | null, fallback?: string | null) {
    return councilMembers?.find((m) => m.userId === userId)?.reviewerName ?? fallback ?? t('minutesPanel.defaultReviewer');
  }

  function toggleAttended(memberId: string) {
    setAttendance((prev) => ({ ...prev, [memberId]: !prev[memberId] }));
  }

  function handleSaveAttendance() {
    if (!meetingId || !attendanceData) return;
    const entries = attendanceData.map((entry) => ({
      memberId: entry.memberId,
      attended: !!attendance[entry.memberId],
      absenceReason: entry.absenceReason,
    }));
    saveAttendance(entries, {
      onSuccess: () => Alert.alert('Thành công', 'Đã lưu điểm danh hội đồng'),
      onError: (err: any) => Alert.alert('Lỗi', err.message || 'Không thể lưu điểm danh'),
    });
  }

  function handleSaveDraft() {
    saveMinutes(
      {
        projectId: projectId ?? undefined,
        result,
        councilComments: councilComments || undefined,
        recommendations: recommendations || undefined,
        qaEntries: qaEntries.filter((q) => q.question.trim()).map((q, order) => ({ ...q, order })),
        memberOpinions: opinions.filter((o) => o.memberName.trim()).map((o, order) => ({ ...o, order })),
      },
      {
        onSuccess: () => Alert.alert(t('minutesPanel.savedTitle'), t('minutesPanel.savedMessage')),
        onError: () => Alert.alert(t('minutesPanel.errorTitle'), t('minutesPanel.errorMessage')),
      },
    );
  }

  function handleApprove() {
    Alert.alert(
      t('minutesPanel.approveDialogTitle'),
      t('minutesPanel.approveDialogMessage'),
      [
        { text: t('common:buttons.cancel'), style: 'cancel' },
        {
          text: t('minutesPanel.approveAndLock'),
          style: 'destructive',
          onPress: () =>
            approveMinutes(undefined, {
              onError: () => Alert.alert(t('minutesPanel.errorTitle'), t('minutesPanel.approveErrorMessage')),
            }),
        },
      ],
    );
  }

  if (decisionLoading || attendanceLoading) return <LoadingState message={t('minutesPanel.loading')} />;

  const resultLabel = resultOptions.find((o) => o.value === result)?.label ?? result;

  return (
    <View className="gap-4">
      {/* Attendance Panel */}
      <GlassSurface rounded={24} className="p-4 gap-3">
        <View>
          <Text className="text-neutral-900 dark:text-neutral-50 text-base font-bold">Thông tin chung — Danh sách hội đồng</Text>
          <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans mt-0.5">Tự động lấy từ hội đồng — Thư ký không cần nhập lại.</Text>
        </View>

        {attendanceData && attendanceData.length > 0 ? (
          <View className="gap-3 mt-1">
            {attendanceData.map((member) => {
              const isAttended = attendance[member.memberId] ?? !!member.attended;
              return (
                <View key={member.memberId} className="flex-row items-center justify-between py-2 border-b border-neutral-100 dark:border-dark-200">
                  <View className="flex-1 pr-2">
                    <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-semibold">{member.memberName}</Text>
                    <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">{localizeLabel(MEMBER_ROLE_LABELS, member.memberRole)}</Text>
                  </View>
                  {secretary && !locked ? (
                    <TouchableOpacity
                      onPress={() => toggleAttended(member.memberId)}
                      activeOpacity={0.7}
                      className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-50 dark:bg-dark-100 border border-neutral-200 dark:border-dark-200"
                    >
                      <Ionicons
                        name={isAttended ? 'checkbox' : 'square-outline'}
                        size={20}
                        color={isAttended ? colors.accent.primary : colors.icon.muted}
                      />
                      <Text className="text-neutral-800 dark:text-neutral-200 text-xs font-medium">Có mặt</Text>
                    </TouchableOpacity>
                  ) : (
                    <Badge
                      label={isAttended ? 'Có mặt' : 'Vắng mặt'}
                      variant={isAttended ? 'success' : 'danger'}
                      size="sm"
                    />
                  )}
                </View>
              );
            })}

            <View className="flex-row items-center justify-between mt-1">
              <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans">
                Tổng số: {attendanceData.length} · Có mặt: {Object.values(attendance).filter(Boolean).length} · Vắng: {attendanceData.length - Object.values(attendance).filter(Boolean).length}
              </Text>
              {secretary && !locked && (
                <Button
                  label="Lưu điểm danh"
                  size="sm"
                  onPress={handleSaveAttendance}
                  loading={isSavingAttendance}
                />
              )}
            </View>
          </View>
        ) : (
          <Text className="text-neutral-400 dark:text-dark-500 text-sm font-sans italic">Chưa tìm thấy danh sách thành viên.</Text>
        )}
      </GlassSurface>

      {/* Meeting Tally Panel */}
      <GlassSurface rounded={24} className="p-4 gap-3">
        <Text className="text-neutral-900 dark:text-neutral-50 text-base font-bold">Số liệu cuộc họp</Text>
        <View className="flex-row flex-wrap">
          <StatBox label="Phiếu phát ra" value={tally?.totalMembers ?? decision?.totalMembers ?? '—'} />
          <StatBox label="Phiếu thu về" value={tally?.ballotsReturned ?? decision?.attendingMembers ?? '—'} />
          <StatBox label="Phiếu hợp lệ" value={tally?.validBallots ?? decision?.validBallots ?? '—'} />
          <StatBox label="Phiếu không hợp lệ" value={tally?.invalidBallots ?? decision?.invalidBallots ?? '—'} />
        </View>
        <View className="h-px bg-neutral-100 dark:bg-dark-200 my-1" />
        <View className="items-center p-2">
          <Text className="text-violet-600 dark:text-violet-400 text-2xl font-bold">
            {tally?.averageScore?.toFixed(2) ?? decision?.averageScore?.toFixed(2) ?? '—'}
          </Text>
          <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans mt-1">Điểm trung bình</Text>
        </View>
      </GlassSurface>

      {/* Reviewer scores */}
      <View>
        <Text className="text-neutral-700 dark:text-neutral-200 text-sm font-semibold mb-2">{t('minutesPanel.reviewerScores')}</Text>
        {scoresLoading ? (
          <LoadingState message={t('minutesPanel.loadingScores')} />
        ) : allScores?.forbidden ? (
          <Text className="text-neutral-400 dark:text-dark-500 text-sm font-sans italic">{t('minutesPanel.notPermitted')}</Text>
        ) : allScores && allScores.scores.length > 0 ? (
          <GlassSurface rounded={24}>
            {allScores.scores.map((s, i) => (
              <View key={s.id}>
                {i > 0 && <View className="h-px bg-neutral-100 dark:bg-dark-200 mx-4" />}
                <View className="flex-row items-center justify-between px-4 py-3">
                  <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-medium">
                    {s.evaluatorName || nameFor(s.evaluatorMemberId)}
                  </Text>
                  <Text className="text-neutral-700 dark:text-neutral-200 text-sm font-semibold">{s.totalScore?.toFixed(1) ?? '—'}</Text>
                </View>
              </View>
            ))}
          </GlassSurface>
        ) : (
          <Text className="text-neutral-400 dark:text-dark-500 text-sm font-sans">{t('minutesPanel.noScores')}</Text>
        )}
      </View>

      {/* Feedback */}
      <View>
        <Text className="text-neutral-700 dark:text-neutral-200 text-sm font-semibold mb-2">{t('minutesPanel.feedback')}</Text>
        {feedbackLoading ? (
          <LoadingState message={t('minutesPanel.loadingFeedback')} />
        ) : feedback?.forbidden ? (
          <Text className="text-neutral-400 dark:text-dark-500 text-sm font-sans italic">{t('minutesPanel.notPermitted')}</Text>
        ) : feedback && feedback.feedback.length > 0 ? (
          <GlassSurface rounded={24}>
            {feedback.feedback.map((f, i) => (
              <View key={f.id}>
                {i > 0 && <View className="h-px bg-neutral-100 dark:bg-dark-200 mx-4" />}
                <View className="px-4 py-3">
                  <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-medium">
                    {f.reviewerName || nameFor(f.reviewerMemberId)}
                  </Text>
                  {f.comments && <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans mt-0.5">{f.comments}</Text>}
                </View>
              </View>
            ))}
          </GlassSurface>
        ) : (
          <Text className="text-neutral-400 dark:text-dark-500 text-sm font-sans">{t('minutesPanel.noFeedback')}</Text>
        )}
      </View>

      {/* Draft minutes editing */}
      {secretary && !locked ? (
        <View className="gap-3">
          <Text className="text-neutral-700 dark:text-neutral-200 text-sm font-semibold">{t('minutesPanel.draftMinutes')}</Text>
          <PickerField
            label="Kết luận hội đồng"
            value={result}
            options={resultOptions}
            onChange={(val) => setResult(val)}
            required
          />
          <Input label={t('minutesPanel.councilComments')} value={councilComments} onChangeText={setCouncilComments} multiline numberOfLines={4} />
          <Input label={t('minutesPanel.recommendations')} value={recommendations} onChangeText={setRecommendations} multiline numberOfLines={3} />
          <MinutesEntries title="Hỏi đáp tại phiên họp" rows={qaEntries} onChange={setQaEntries} kind="qa" />
          <MinutesEntries title="Ý kiến từng thành viên" rows={opinions} onChange={setOpinions} kind="opinion" />
          <Button label={decision ? t('minutesPanel.updateDraft') : t('minutesPanel.saveDraft')} variant="secondary" onPress={handleSaveDraft} loading={isSaving} fullWidth />
        </View>
      ) : decision ? (
        <GlassSurface rounded={24} className="p-4 gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-neutral-700 dark:text-neutral-200 text-sm font-semibold">{t('minutesPanel.minutes')}</Text>
            <Text className={`text-xs font-semibold ${locked ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {locked ? t('minutesPanel.locked') : t('minutesPanel.draft')}
            </Text>
          </View>
          {decision.result && <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-medium">{t('minutesPanel.resultPrefix', { result: resultLabel })}</Text>}
          {decision.councilComments && <Text className="text-neutral-600 dark:text-dark-400 text-sm font-sans leading-relaxed">{decision.councilComments}</Text>}
          {decision.recommendations && (
            <View className="bg-neutral-50 dark:bg-dark-100 rounded-xl p-3">
              <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans mb-1">{t('minutesPanel.recommendations')}</Text>
              <Text className="text-neutral-700 dark:text-neutral-200 text-sm font-sans leading-relaxed">{decision.recommendations}</Text>
            </View>
          )}
          {!!decision.qaEntries?.length && <View className="gap-2"><Text className="text-neutral-500 dark:text-dark-500 text-xs">Hỏi đáp</Text>{decision.qaEntries.map((q) => <Text key={q.order} className="text-neutral-700 dark:text-neutral-200 text-sm">H: {q.question}{q.answer ? `\nĐ: ${q.answer}` : ''}</Text>)}</View>}
          {!!decision.memberOpinions?.length && <View className="gap-2"><Text className="text-neutral-500 dark:text-dark-500 text-xs">Ý kiến thành viên</Text>{decision.memberOpinions.map((o) => <Text key={o.order} className="text-neutral-700 dark:text-neutral-200 text-sm">{o.memberName}: {o.academicComment || o.budgetComment || '—'}</Text>)}</View>}
        </GlassSurface>
      ) : (
        <EmptyState fullScreen={false} icon="🗒️" title={t('minutesPanel.noMinutesTitle')} description={t('minutesPanel.noMinutesDescription')} />
      )}

      {chairman && decision && !locked && (
        <Button label={isApproving ? t('minutesPanel.approving') : t('minutesPanel.approveAndLock')} variant="danger" onPress={handleApprove} loading={isApproving} fullWidth />
      )}
    </View>
  );
}

function MinutesEntries({ title, rows, onChange, kind }: { title: string; rows: QaEntry[] | MemberOpinion[]; onChange: (v: any) => void; kind: 'qa' | 'opinion' }) {
  const add = () => onChange([...rows, kind === 'qa' ? { question: '', order: rows.length } : { memberName: '', order: rows.length }]);
  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-neutral-700 dark:text-neutral-200 text-sm font-semibold">{title}</Text>
        <TouchableOpacity onPress={add}>
          <Text className="text-violet-600 dark:text-violet-400 text-sm">+ Thêm</Text>
        </TouchableOpacity>
      </View>
      {rows.map((row: any, index) => (
        <GlassSurface key={index} rounded={16} className="p-3 gap-2">
          {kind === 'qa' ? (
            <>
              <Input placeholder="Người hỏi" value={row.askedBy ?? ''} onChangeText={(askedBy) => onChange(rows.map((r: any, i) => i === index ? { ...r, askedBy } : r))} />
              <Input placeholder="Câu hỏi" value={row.question} onChangeText={(question) => onChange(rows.map((r: any, i) => i === index ? { ...r, question } : r))} multiline />
              <Input placeholder="Câu trả lời" value={row.answer ?? ''} onChangeText={(answer) => onChange(rows.map((r: any, i) => i === index ? { ...r, answer } : r))} multiline />
            </>
          ) : (
            <>
              <Input placeholder="Tên thành viên" value={row.memberName} onChangeText={(memberName) => onChange(rows.map((r: any, i) => i === index ? { ...r, memberName } : r))} />
              <Input placeholder="Ý kiến chuyên môn" value={row.academicComment ?? ''} onChangeText={(academicComment) => onChange(rows.map((r: any, i) => i === index ? { ...r, academicComment } : r))} multiline />
              <Input placeholder="Ý kiến kinh phí" value={row.budgetComment ?? ''} onChangeText={(budgetComment) => onChange(rows.map((r: any, i) => i === index ? { ...r, budgetComment } : r))} multiline />
            </>
          )}
          <TouchableOpacity onPress={() => onChange(rows.filter((_, i) => i !== index))}>
            <Text className="text-red-500 text-xs">Xóa</Text>
          </TouchableOpacity>
        </GlassSurface>
      ))}
    </View>
  );
}
