import { Pressable, Text, View } from 'react-native';

import { styles } from '@/features/account/components/account-sign-out-card.styles';
import { showUnavailable } from '@/features/account/utils/show-unavailable';
import { useTheme } from '@/hooks/use-theme';

export function AccountSignOutCard() {
  const colors = useTheme();

  return (
    <View
      style={[
        styles.signOutCard,
        { backgroundColor: colors.backgroundElement },
      ]}
    >
      <Text style={[styles.signOutTitle, { color: colors.text }]}>
        Sign out
      </Text>
      <Text style={[styles.signOutSubtitle, { color: colors.textSecondary }]}>
        Account sign-out is not connected yet.
      </Text>
      <Pressable
        style={[styles.signOutButton, { backgroundColor: colors.accent }]}
        onPress={() => showUnavailable('Sign out')}
      >
        <Text style={styles.signOutButtonText}>Sign out</Text>
      </Pressable>
      <Pressable
        onPress={() => showUnavailable('Delete account')}
        style={styles.deleteButton}
      >
        <Text style={[styles.deleteText, { color: colors.danger }]}>
          Delete account
        </Text>
      </Pressable>
    </View>
  );
}
