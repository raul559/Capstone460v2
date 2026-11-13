import { Text, View } from 'react-native';

import { styles } from '@/features/account/account-profile-card.styles';
import { useTheme } from '@/hooks/use-theme';

export function AccountProfileCard() {
  const colors = useTheme();

  return (
    <View
      style={[
        styles.profileCard,
        { backgroundColor: colors.backgroundElement },
      ]}
    >
      <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
        <Text style={styles.avatarText}>U</Text>
      </View>
      <View style={styles.profileInfo}>
        <Text style={[styles.profileName, { color: colors.text }]}>
          Your profile
        </Text>
        <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
          Account information not connected
        </Text>
        <Text style={[styles.accountType, { color: colors.accent }]}>
          PATIENT USER ACCOUNT
        </Text>
      </View>
    </View>
  );
}
