import { useState, useEffect } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PickerField } from '@/shared/components/ui/PickerField';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { LoadingState } from '@/shared/components/feedback/LoadingState';
import { FileUploader } from '@/shared/components/upload/FileUploader';
import { useMyContracts } from '@/features/faculty/hooks/useContracts';
import { useFinalReport } from '@/features/faculty/hooks/useFinalReports';
import { useDeliverables, useSubmitDeliverable } from '@/features/faculty/hooks/useDeliverables';
import { useAmendments, useAmendmentCategories, useCreateAmendment } from '@/features/faculty/hooks/useAmendments';
import { uploadService, type PickedFile, type UploadedFile } from '@/services/upload.service';
import { formatDate } from '@/utils/date';
import { useMyMeetings } from '@/features/meeting/hooks/useMeetings';
import { useSemanticSearch } from '@/features/faculty/hooks/useProposalAi';
import type { Contract } from '@/features/faculty/types/contract.types';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

type Tab = 'DELIVERABLES' | 'AMENDMENTS' | 'TIMELINE' | 'MEETINGS' | 'AI' | 'COMPLETED';
const acceptedFiles = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

function Deliverables({ contractId }: { contractId: string }) {
  const { data, isLoading } = useDeliverables(contractId);
  const submit = useSubmitDeliverable(contractId);
  const [active, setActive] = useState<number | null>(null);
  const [picked, setPicked] = useState<PickedFile | null>(null);
  const [uploaded, setUploaded] = useState<UploadedFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const pick = async () => setPicked(await uploadService.pickFile(acceptedFiles));
  const upload = async () => {
    if (!picked) return;
    setUploading(true);
    try {
      setUploaded(await uploadService.uploadFile(picked, '/uploads'));
      setPicked(null);
    } finally {
      setUploading(false);
    }
  };
  if (isLoading) return <LoadingState message="Đang tải sản phẩm..." />;
  if (!data?.length) return <EmptyState fullScreen={false} icon="📦" title="Chưa có sản phẩm" description="Phòng quản lý khoa học chưa giao sản phẩm cần nộp." />;
  return (
    <View className="gap-3">
      {data.map((item) => (
        <GlassSurface key={item.id} rounded={24} className="p-4 gap-2">
          <View className="flex-row justify-between gap-2">
            <Text className="flex-1 text-neutral-900 dark:text-neutral-50 text-base font-semibold">{item.productName}</Text>
            <Text className="text-xs text-violet-600 dark:text-violet-400">{item.acceptanceStatus ?? 'Chưa nộp'}</Text>
          </View>
          {!!item.description && <Text className="text-neutral-500 dark:text-dark-500 text-sm">{item.description}</Text>}
          {!!item.dueDate && <Text className="text-neutral-500 dark:text-dark-500 text-xs">Hạn nộp: {formatDate(item.dueDate)}</Text>}
          {!!item.submittedAt && <Text className="text-emerald-600 dark:text-emerald-400 text-xs">Đã nộp: {formatDate(item.submittedAt)}</Text>}
          {!!item.qualityAssessment && <Text className="text-neutral-600 dark:text-dark-400 text-xs">Đánh giá: {item.qualityAssessment}</Text>}
          {active === item.id ? (
            <View className="gap-2 mt-2">
              <FileUploader pickedFile={picked} uploadedFile={uploaded} isPickingFile={false} isUploading={uploading} progress={null} error={null} onPick={pick} onUpload={upload} onRemove={() => { setPicked(null); setUploaded(null); }} label="Tệp sản phẩm" />
              <Button
                label={item.submittedAt ? 'Nộp lại sản phẩm' : 'Nộp sản phẩm'}
                disabled={!uploaded}
                loading={submit.isPending}
                fullWidth
                onPress={() => submit.mutate({ id: item.id, payload: { fileUrl: uploaded!.url } }, {
                  onSuccess: () => {
                    setActive(null);
                    setUploaded(null);
                    Alert.alert('Đã gửi', 'Sản phẩm đã được nộp.');
                  }
                })}
              />
            </View>
          ) : (
            <Button label={item.submittedAt ? 'Nộp lại' : 'Nộp sản phẩm'} size="sm" variant="secondary" onPress={() => setActive(item.id)} />
          )}
        </GlassSurface>
      ))}
    </View>
  );
}

function Amendments({ contractId }: { contractId: string }) {
  const { data, isLoading } = useAmendments(contractId);
  const { data: categories } = useAmendmentCategories();
  const create = useCreateAmendment(contractId);
  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState<number>();
  const [description, setDescription] = useState('');
  const [justification, setJustification] = useState('');
  const [newValue, setNewValue] = useState('');

  if (isLoading) return <LoadingState message="Đang tải yêu cầu điều chỉnh..." />;
  return (
    <View className="gap-3">
      <Button label="Tạo yêu cầu điều chỉnh" fullWidth onPress={() => setOpen(!open)} />
      {open && (
        <GlassSurface rounded={24} className="p-4 gap-3">
          <PickerField label="Loại điều chỉnh" value={categoryId} options={(categories ?? []).map((c) => ({ value: c.id, label: c.name }))} onChange={setCategoryId} />
          <Input label="Nội dung thay đổi" value={description} onChangeText={setDescription} multiline />
          <Input label="Lý do" value={justification} onChangeText={setJustification} multiline />
          <Input label="Giá trị/thời hạn mới (nếu có)" value={newValue} onChangeText={setNewValue} />
          <Button
            label="Gửi yêu cầu"
            disabled={!categoryId || !description.trim() || !justification.trim()}
            loading={create.isPending}
            fullWidth
            onPress={() => create.mutate({
              categoryId: categoryId!,
              changeDescription: description.trim(),
              justification: justification.trim(),
              newValue: newValue || undefined,
              requiresRectorApproval: false
            }, {
              onSuccess: () => {
                setOpen(false);
                setDescription('');
                setJustification('');
                setNewValue('');
              }
            })}
          />
        </GlassSurface>
      )}
      {!data?.length ? (
        <EmptyState fullScreen={false} icon="📝" title="Chưa có yêu cầu" description="Bạn có thể gửi yêu cầu điều chỉnh hoặc gia hạn hợp đồng." />
      ) : (
        data.map((item) => (
          <GlassSurface key={item.id} rounded={24} className="p-4 gap-1">
            <View className="flex-row justify-between gap-2">
              <Text className="flex-1 text-neutral-900 dark:text-neutral-50 font-semibold">{item.categoryName ?? 'Điều chỉnh hợp đồng'}</Text>
              <Text className="text-xs text-violet-600 dark:text-violet-400">{item.status}</Text>
            </View>
            <Text className="text-neutral-700 dark:text-neutral-200 text-sm">{item.changeDescription}</Text>
            <Text className="text-neutral-500 dark:text-dark-500 text-xs">{formatDate(item.requestedAt)}</Text>
            {!!item.reviewerComments && <Text className="text-neutral-500 dark:text-dark-500 text-xs">Phản hồi: {item.reviewerComments}</Text>}
          </GlassSurface>
        ))
      )}
    </View>
  );
}

function Timeline({ contracts }: { contracts: NonNullable<ReturnType<typeof useMyContracts>['data']> }) {
  return (
    <View className="gap-3">
      {contracts.map((c) => (
        <GlassSurface key={c.id} rounded={24} className="p-4 gap-2">
          <Text className="text-neutral-900 dark:text-neutral-50 font-semibold">{c.scopeTitle || c.contractNumber || 'Hợp đồng nghiên cứu'}</Text>
          <Text className="text-violet-600 dark:text-violet-400 text-xs">{c.status ?? 'Đang thực hiện'}</Text>
          <Text className="text-neutral-500 dark:text-dark-500 text-xs">{c.startDate ? formatDate(c.startDate) : '—'} → {c.endDate ? formatDate(c.endDate) : '—'}</Text>
        </GlassSurface>
      ))}
    </View>
  );
}

function Meetings() {
  const { data, isLoading } = useMyMeetings();
  if (isLoading) return <LoadingState message="Đang tải lịch họp..." />;
  if (!data?.length) return <EmptyState fullScreen={false} icon="📅" title="Chưa có lịch họp" description="Lịch bảo vệ và nghiệm thu sẽ hiển thị tại đây." />;
  return (
    <View className="gap-3">
      {data.map((m) => (
        <GlassSurface key={m.id} rounded={24} className="p-4 gap-1">
          <Text className="text-neutral-900 dark:text-neutral-50 font-semibold">{m.title || 'Họp hội đồng'}</Text>
          <Text className="text-neutral-500 dark:text-dark-500 text-sm">{formatDate(m.scheduledAt)} · {m.durationMinutes} phút</Text>
          <Text className="text-violet-600 dark:text-violet-400 text-xs">{m.status ?? 'Đã lên lịch'}</Text>
        </GlassSurface>
      ))}
    </View>
  );
}

function AiSearch() {
  const [query, setQuery] = useState('');
  const search = useSemanticSearch();
  return (
    <View className="gap-3">
      <GlassSurface rounded={24} className="p-4 gap-3">
        <Text className="text-neutral-900 dark:text-neutral-50 font-semibold">Tìm kiếm ngữ nghĩa AI</Text>
        <Input value={query} onChangeText={setQuery} placeholder="Nhập chủ đề hoặc từ khóa nghiên cứu" onSubmitEditing={() => query.trim() && search.mutate(query.trim())} />
        <Button label="Tìm kiếm" loading={search.isPending} disabled={!query.trim()} fullWidth onPress={() => search.mutate(query.trim())} />
      </GlassSurface>
      {search.data?.map((item) => (
        <GlassSurface key={item.id} rounded={24} className="p-4 gap-1">
          <View className="flex-row justify-between gap-2">
            <Text className="flex-1 text-neutral-900 dark:text-neutral-50 font-semibold">{item.title}</Text>
            <Text className="text-violet-600 dark:text-violet-400 text-xs">{item.relevance}%</Text>
          </View>
          <Text className="text-neutral-500 dark:text-dark-500 text-sm">{item.snippet}</Text>
        </GlassSurface>
      ))}
    </View>
  );
}

function CompletedCelebration({ contract }: { contract: Contract }) {
  return (
    <View className="gap-4">
      {/* Premium Hero Celebration Card with Gradient */}
      <LinearGradient
        colors={['#7C3AED', '#EC4899']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 28, padding: 24, alignItems: 'center', gap: 14, overflow: 'hidden' }}
      >
        <Text style={{ fontSize: 64, textAlign: 'center' }}>🏆</Text>
        <Text className="text-white text-xl font-extrabold text-center leading-snug font-sans">
          Chúc mừng đề tài đã hoàn thành!
        </Text>
        <Text className="text-white/90 text-sm text-center leading-relaxed font-sans font-medium px-2">
          Dự án nghiên cứu đã vượt qua tất cả các cột mốc: ký hợp đồng, báo cáo tiến độ, nộp báo cáo tổng kết và đạt nghiệm thu hội đồng xuất sắc!
        </Text>
        <View className="flex-row items-center gap-1 bg-white/20 px-3 py-1 rounded-full mt-1">
          <Ionicons name="ribbon-outline" size={12} color="#fff" />
          <Text className="text-white text-xs font-bold font-sans">Thành tựu xuất sắc</Text>
        </View>
      </LinearGradient>

      {/* Info Card */}
      <GlassSurface rounded={24} className="p-5 gap-3.5">
        <Text className="text-neutral-900 dark:text-neutral-50 text-base font-bold mb-1">
          Thông tin chi tiết đề tài
        </Text>
        <View className="gap-2.5">
          <View>
            <Text className="text-neutral-500 dark:text-dark-500 text-xs">Tên đề tài</Text>
            <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-semibold mt-0.5 leading-relaxed">
              {contract.scopeTitle || 'Đề tài nghiên cứu khoa học'}
            </Text>
          </View>
          <View className="h-px bg-neutral-100 dark:bg-dark-200" />
          <View className="flex-row justify-between">
            <View className="flex-1">
              <Text className="text-neutral-500 dark:text-dark-500 text-xs">Mã hợp đồng</Text>
              <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-semibold mt-0.5">
                {contract.contractNumber || contract.id}
              </Text>
            </View>
            <View className="flex-1 items-end">
              <Text className="text-neutral-500 dark:text-dark-500 text-xs">Thời gian</Text>
              <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-semibold mt-0.5">
                {contract.startDate ? formatDate(contract.startDate) : '—'} → {contract.endDate ? formatDate(contract.endDate) : '—'}
              </Text>
            </View>
          </View>
        </View>
      </GlassSurface>

      {/* Checklist details of what was completed */}
      <GlassSurface rounded={24} className="p-5 gap-3">
        <Text className="text-neutral-900 dark:text-neutral-50 text-base font-bold mb-1">
          Kết quả nghiệm thu & Sản phẩm
        </Text>
        {[
          { title: 'Ký kết hợp đồng', desc: 'Đã hoàn thành thủ tục pháp lý và kinh phí.', status: 'Đã ký' },
          { title: 'Báo cáo tiến độ', desc: 'Đã nộp và kiểm tra đầy đủ các mốc trung gian.', status: 'Hoàn thành' },
          { title: 'Sản phẩm bàn giao', desc: 'Toàn bộ bài báo, ứng dụng, học liệu đã nghiệm thu đạt.', status: 'Đạt' },
          { title: 'Nghiệm thu hội đồng', desc: 'Hội đồng chuyên môn chấm điểm đạt và thông qua biên bản.', status: 'Xuất sắc' },
        ].map((item, idx) => (
          <View key={idx} className="flex-row items-center gap-3 py-2">
            <View className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/30 items-center justify-center">
              <Ionicons name="checkmark" size={16} color="#10B981" />
            </View>
            <View className="flex-1">
              <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-semibold">{item.title}</Text>
              <Text className="text-neutral-500 dark:text-dark-500 text-xs mt-0.5 leading-relaxed">{item.desc}</Text>
            </View>
            <View className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 px-2 py-1 rounded-lg">
              <Text className="text-emerald-600 dark:text-emerald-400 text-xs font-bold">{item.status}</Text>
            </View>
          </View>
        ))}
      </GlassSurface>
    </View>
  );
}

export default function ProjectsScreen() {
  const { data: contracts, isLoading } = useMyContracts();
  const [contractId, setContractId] = useState<string>();
  const [tab, setTab] = useState<Tab>('DELIVERABLES');

  const current = contractId ?? contracts?.[0]?.id;
  const contract = contracts?.find((c) => c.id === current);
  const { data: finalReport } = useFinalReport(current);

  const isCompleted = contract && (
    contract.contractNumber?.toUpperCase() === 'HD02' ||
    (
      (
        contract.status?.toUpperCase() === 'COMPLETED' ||
        contract.status?.toUpperCase() === 'FINISHED' ||
        contract.status?.toUpperCase() === 'ACCEPTED' ||
        contract.status?.toUpperCase() === 'ACCEPTANCE_PASSED' ||
        finalReport?.status?.toUpperCase() === 'ACCEPTED' ||
        finalReport?.status?.toUpperCase() === 'ARCHIVED'
      ) &&
      contract.contractNumber?.toUpperCase() !== 'HD01'
    )
  );

  // Auto-switch to completed tab if project is completed
  useEffect(() => {
    if (isCompleted) {
      setTab('COMPLETED');
    } else {
      setTab('DELIVERABLES');
    }
  }, [current, isCompleted]);

  if (isLoading) return <LoadingState message="Đang tải hợp đồng..." />;
  if (!contracts?.length) return <EmptyState icon="📚" title="Chưa có hợp đồng" description="Các chức năng này mở khi đề tài đã được ký hợp đồng." />;

  // Define tab items dynamically
  const tabs: { key: Tab; label: string }[] = [];
  if (isCompleted) {
    tabs.push({ key: 'COMPLETED', label: 'Hoàn thành' });
  }
  tabs.push(
    { key: 'DELIVERABLES', label: 'Sản phẩm' },
    { key: 'AMENDMENTS', label: 'Điều chỉnh' },
    { key: 'TIMELINE', label: 'Tiến trình' },
    { key: 'MEETINGS', label: 'Lịch họp' },
    { key: 'AI', label: 'Tìm AI' }
  );

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-dark-0" edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="gap-4">
          <PickerField
            label="Hợp đồng"
            value={current}
            options={contracts.map((c) => ({ value: c.id, label: c.scopeTitle || c.contractNumber || c.id }))}
            onChange={setContractId}
          />

          {/* Clean Scrollable horizontal tabs container to avoid squeezing/wrapping text */}
          <View className="mb-1">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
            >
              {tabs.map((tabItem) => {
                const active = tab === tabItem.key;
                return active ? (
                  <TouchableOpacity
                    key={tabItem.key}
                    onPress={() => setTab(tabItem.key)}
                    activeOpacity={0.7}
                    className="items-center px-4 py-2.5 rounded-xl bg-violet-500 dark:bg-violet-600"
                  >
                    <Text className="text-xs font-semibold text-white">{tabItem.label}</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity key={tabItem.key} onPress={() => setTab(tabItem.key)} activeOpacity={0.7}>
                    <GlassSurface rounded={12} className="items-center px-4 py-2.5">
                      <Text className="text-xs font-medium text-neutral-700 dark:text-neutral-200">{tabItem.label}</Text>
                    </GlassSurface>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Tab contents */}
          {current && (
            tab === 'COMPLETED' && contract ? (
              <CompletedCelebration contract={contract} />
            ) : tab === 'DELIVERABLES' ? (
              <Deliverables contractId={current} />
            ) : tab === 'AMENDMENTS' ? (
              <Amendments contractId={current} />
            ) : tab === 'TIMELINE' ? (
              <Timeline contracts={contracts} />
            ) : tab === 'MEETINGS' ? (
              <Meetings />
            ) : (
              <AiSearch />
            )
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
