import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { createHomeDisclaimerStyles } from '@/features/home/home-disclaimer.styles';
import { useTheme } from '@/hooks/use-theme';

export function HomeDisclaimer() {
  const styles = createHomeDisclaimerStyles(useTheme());

  return (
    <View style={styles.disclaimer}>
      <ThemedText style={styles.disclaimerIcon}>ⓘ</ThemedText>

      <View style={styles.disclaimerContent}>
        <ThemedText style={styles.disclaimerTitle}>
          Learning, not diagnosis
        </ThemedText>

        <ThemedText style={styles.disclaimerText}>
          Not a medical diagnosis tool. Do not use results for
          diagnosis or treatment decisions.
        </ThemedText>
      </View>
    </View>
  );
}
