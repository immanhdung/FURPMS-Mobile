import { View, Text, Image } from 'react-native';

interface AvatarProps {
  name: string;
  uri?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const sizeConfig = {
  xs: { container: 'w-6 h-6', text: 'text-xs' },
  sm: { container: 'w-8 h-8', text: 'text-xs' },
  md: { container: 'w-10 h-10', text: 'text-sm' },
  lg: { container: 'w-14 h-14', text: 'text-lg' },
  xl: { container: 'w-20 h-20', text: 'text-2xl' },
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function Avatar({ name, uri, size = 'md' }: AvatarProps) {
  const { container, text } = sizeConfig[size];

  if (uri) {
    return (
      <Image
        source={{ uri }}
        className={`${container} rounded-full`}
      />
    );
  }

  return (
    <View
      className={`${container} rounded-full bg-violet-100 dark:bg-dark-200 items-center justify-center`}
    >
      <Text className={`${text} font-semibold text-violet-600 dark:text-violet-400`}>
        {getInitials(name)}
      </Text>
    </View>
  );
}
