import { useTranslation } from 'react-i18next';
import { ProfileScreen } from '@/shared/components/profile/ProfileScreen';

export default function ReviewProfileScreen() {
  const { t } = useTranslation('profile');
  return (
    <ProfileScreen
      roleLabel={t('roleReviewCommittee')}
      badgeVariant="info"
      footerLabel={t('footerReviewCommittee')}
    />
  );
}
