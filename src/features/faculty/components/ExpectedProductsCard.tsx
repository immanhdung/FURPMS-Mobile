import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { useExpectedProducts, useCreateExpectedProduct, useDeleteExpectedProduct } from '@/features/faculty/hooks/useExpectedProducts';

interface ExpectedProductsCardProps {
  proposalId: string;
  editable: boolean;
}

export function ExpectedProductsCard({ proposalId, editable }: ExpectedProductsCardProps) {
  const { t } = useTranslation('faculty');
  const { colors } = useTheme();
  const { data: products, isLoading } = useExpectedProducts(proposalId);
  const { mutate: createProduct, isPending: isCreating } = useCreateExpectedProduct(proposalId);
  const { mutate: deleteProduct } = useDeleteExpectedProduct(proposalId);

  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [requirements, setRequirements] = useState('');

  function handleAdd() {
    if (!name.trim()) return;
    createProduct(
      { productName: name.trim(), scientificRequirements: requirements.trim() || undefined },
      {
        onSuccess: () => {
          setName('');
          setRequirements('');
          setModalVisible(false);
        },
      },
    );
  }

  return (
    <GlassSurface rounded={24} className="p-4 gap-3">
      {isLoading ? (
        <Text className="text-neutral-400 dark:text-dark-500 text-sm font-sans">{t('expectedProductsCard.loading')}</Text>
      ) : products && products.length > 0 ? (
        products.map((product, i) => (
          <View key={product.id}>
            {i > 0 && <View className="h-px bg-neutral-100 dark:bg-dark-200 my-1" />}
            <View className="flex-row items-start gap-3">
              <View className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/30 items-center justify-center mt-0.5">
                <Text className="text-violet-700 dark:text-violet-300 text-xs font-bold">{i + 1}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-neutral-900 dark:text-neutral-50 text-sm font-medium">{product.productName}</Text>
                {product.scientificRequirements ? (
                  <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans mt-0.5">
                    {product.scientificRequirements}
                  </Text>
                ) : null}
              </View>
              {editable && (
                <TouchableOpacity onPress={() => deleteProduct(product.id)} hitSlop={8}>
                  <Ionicons name="trash-outline" size={16} color={colors.accent.danger} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))
      ) : (
        <Text className="text-neutral-400 dark:text-dark-500 text-sm font-sans">{t('expectedProductsCard.empty')}</Text>
      )}

      {editable && (
        <>
          {products && products.length > 0 && <View className="h-px bg-neutral-100 dark:bg-dark-200" />}
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            activeOpacity={0.7}
            className="flex-row items-center justify-center gap-2 py-2"
          >
            <Ionicons name="add-circle-outline" size={18} color={colors.accent.primary} />
            <Text className="text-violet-600 dark:text-violet-400 text-sm font-medium">{t('expectedProductsCard.addExpectedProduct')}</Text>
          </TouchableOpacity>
        </>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 justify-end bg-black/40">
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <GlassSurface
              intensity={65}
              rounded={0}
              style={{ borderTopLeftRadius: 28, borderTopRightRadius: 28, borderBottomWidth: 0 }}
              className="px-5 pt-5 pb-8 gap-4"
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">{t('expectedProductsCard.modalTitle')}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)} hitSlop={12}>
                  <Ionicons name="close" size={22} color={colors.icon.muted} />
                </TouchableOpacity>
              </View>
              <Input label={t('expectedProductsCard.productName')} placeholder={t('expectedProductsCard.productNamePlaceholder')} value={name} onChangeText={setName} />
              <Input
                label={t('expectedProductsCard.scientificRequirements')}
                placeholder={t('expectedProductsCard.scientificRequirementsPlaceholder')}
                value={requirements}
                onChangeText={setRequirements}
                multiline
                numberOfLines={3}
              />
              <Button label={t('expectedProductsCard.add')} onPress={handleAdd} loading={isCreating} disabled={!name.trim()} fullWidth />
            </GlassSurface>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </GlassSurface>
  );
}
