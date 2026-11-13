import { Pressable, Text, View } from 'react-native';

import { styles } from '@/features/account/components/account-header.styles';
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
