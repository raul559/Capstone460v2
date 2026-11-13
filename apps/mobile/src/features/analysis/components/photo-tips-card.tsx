import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { createStyles } from '@/features/analysis/components/photo-tips-card.styles';
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
