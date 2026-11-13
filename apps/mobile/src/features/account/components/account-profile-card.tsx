import { StyleSheet, Text, View } from 'react-native';

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

const styles = StyleSheet.create({
  profileCard: {
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '700',
  },
  profileInfo: { flex: 1 },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 3,
  },
  profileEmail: { fontSize: 12, marginBottom: 8 },
  accountType: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
