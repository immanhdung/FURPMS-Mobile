import { useTranslation } from 'react-i18next';
import { ProfileScreen } from '@/shared/components/profile/ProfileScreen';

export default function FacultyProfileTab() {
  const { t } = useTranslation('profile');
  return (
    <ProfileScreen roleLabel={t('roleFaculty')} badgeVariant="purple" footerLabel={t('footerFaculty')} />
  );
}
