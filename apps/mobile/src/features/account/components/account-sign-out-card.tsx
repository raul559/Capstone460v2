import { Pressable, StyleSheet, Text, View } from 'react-native';

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

const styles = StyleSheet.create({
  signOutCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 28,
  },
  signOutTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 5,
  },
  signOutSubtitle: { fontSize: 12, marginBottom: 16 },
  signOutButton: {
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  deleteButton: { alignItems: 'center', paddingTop: 16 },
  deleteText: { fontSize: 13, fontWeight: '600' },
});
