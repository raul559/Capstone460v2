import { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export function AccountNotificationRow() {
  const colors = useTheme();
  // Local only until an account service stores notification preferences.
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <View style={styles.notificationRow}>
      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, { color: colors.text }]}>
          Notifications
        </Text>
        <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>
          Product updates
        </Text>
      </View>
      <Switch
        value={notificationsEnabled}
        onValueChange={setNotificationsEnabled}
        trackColor={{
          false: colors.border,
          true: colors.accent,
        }}
        thumbColor={colors.white}
        accessibilityLabel="Product update notifications"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  notificationRow: {
    minHeight: 75,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  rowText: { flex: 1, paddingRight: 12 },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 5,
  },
  rowSubtitle: { fontSize: 12 },
});
