import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { ThemePalette } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const PHOTO_TIPS = [
  'Use even, natural lighting.',
  'Keep one area centered and in focus.',
  'Avoid faces and identifying details.',
];

export function PhotoTipsCard() {
  const styles = createStyles(useTheme());

  return (
    <View style={styles.infoCard}>
      <ThemedText style={styles.infoTitle}>
        Tips for a successful photo
      </ThemedText>

      {PHOTO_TIPS.map((tip) => (
        <View key={tip} style={styles.tipRow}>
          <ThemedText style={styles.tipIcon}>✓</ThemedText>
          <ThemedText style={styles.tipText}>
            {tip}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

function createStyles(colors: ThemePalette) {
  return StyleSheet.create({
    infoCard: {
      backgroundColor: colors.backgroundElement,
      borderRadius: 18,
      padding: 16,
      marginBottom: 17,
      elevation: 3,
    },
    infoTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 12,
    },
    tipRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    tipIcon: {
      color: colors.accent,
      fontSize: 16,
      fontWeight: 'bold',
      marginRight: 10,
    },
    tipText: {
      color: colors.textSecondary,
      fontSize: 12,
      flex: 1,
    },
  });
}
