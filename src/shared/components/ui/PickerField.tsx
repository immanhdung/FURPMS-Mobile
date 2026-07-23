import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

export interface PickerOption<T> {
  value: T;
  label: string;
  description?: string;
}

interface PickerFieldProps<T> {
  label: string;
  required?: boolean;
  placeholder?: string;
  value: T | undefined;
  options: PickerOption<T>[];
  onChange: (value: T) => void;
  error?: string;
  disabled?: boolean;
  emptyMessage?: string;
}

export function PickerField<T>({
  label,
  required,
  placeholder = 'Select…',
  value,
  options,
  onChange,
  error,
  disabled,
  emptyMessage = 'No options available',
}: PickerFieldProps<T>) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View className="gap-1.5">
      <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
        {label}
        {required && <Text className="text-red-500"> *</Text>}
      </Text>
      <TouchableOpacity
        onPress={() => !disabled && setOpen(true)}
        activeOpacity={0.7}
        disabled={disabled}
        className={`flex-row items-center justify-between bg-neutral-50 dark:bg-dark-100 rounded-xl px-4 py-3 border ${
          error ? 'border-red-500 dark:border-red-400' : 'border-neutral-200 dark:border-dark-200'
        }`}
        style={{ opacity: disabled ? 0.5 : 1 }}
      >
        <Text
          className={`flex-1 text-base font-sans ${
            selected ? 'text-neutral-900 dark:text-neutral-50' : 'text-neutral-400 dark:text-dark-500'
          }`}
          numberOfLines={1}
        >
          {selected?.label ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.icon.muted} />
      </TouchableOpacity>
      {error && <Text className="text-xs font-sans text-red-500 dark:text-red-400">{error}</Text>}

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <TouchableOpacity className="flex-1 justify-end bg-black/40" activeOpacity={1} onPress={() => setOpen(false)}>
          <View className="bg-white dark:bg-dark-50 rounded-t-3xl max-h-[70%]" onStartShouldSetResponder={() => true}>
            <View className="flex-row items-center justify-between px-5 pt-5 pb-3">
              <Text className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">{label}</Text>
              <TouchableOpacity onPress={() => setOpen(false)} hitSlop={12}>
                <Ionicons name="close" size={22} color={colors.icon.muted} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={(_, i) => String(i)}
              contentContainerStyle={{ paddingBottom: 24 }}
              ListEmptyComponent={
                <Text className="text-neutral-400 dark:text-dark-500 text-sm font-sans text-center py-8">
                  {emptyMessage}
                </Text>
              }
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <TouchableOpacity
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                    activeOpacity={0.7}
                    className="flex-row items-center justify-between px-5 py-3.5"
                  >
                    <View className="flex-1 pr-3">
                      <Text
                        className={`text-sm font-sans ${
                          isSelected ? 'text-violet-600 dark:text-violet-400 font-semibold' : 'text-neutral-900 dark:text-neutral-50'
                        }`}
                      >
                        {item.label}
                      </Text>
                      {item.description && (
                        <Text className="text-neutral-500 dark:text-dark-500 text-xs font-sans mt-0.5">{item.description}</Text>
                      )}
                    </View>
                    {isSelected && <Ionicons name="checkmark" size={18} color={colors.accent.primary} />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
