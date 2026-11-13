import { Pressable, StyleSheet, Text, View } from 'react-native';

import { showUnavailable } from '@/features/account/utils/show-unavailable';
import { useTheme } from '@/hooks/use-theme';

export function AccountHeader() {
  const colors = useTheme();

  return (
    <View style={styles.header}>
      <View>
        <Text style={[styles.headerLabel, { color: colors.accent }]}>
          SKINAI
        </Text>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Your account
        </Text>
      </View>
      <Pressable
        style={[
          styles.settingsButton,
          { backgroundColor: colors.backgroundElement },
        ]}
        onPress={() => showUnavailable('Settings')}
        accessibilityLabel="Settings"
      >
        {/* eslint-disable-next-line no-restricted-syntax -- TODO: replace emoji with an icon */}
        <Text style={[styles.settingsIcon, { color: colors.textSecondary }]}>⚙</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 5,
  },
  headerTitle: { fontSize: 28, fontWeight: '700' },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: { fontSize: 22 },
});
