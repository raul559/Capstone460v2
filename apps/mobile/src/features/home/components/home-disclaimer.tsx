import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { ThemePalette } from '@/constants/theme';
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

function createHomeDisclaimerStyles(colors: ThemePalette) {
  return StyleSheet.create({
    disclaimer: {
      flexDirection: 'row',
      backgroundColor: colors.backgroundElement,
      borderRadius: 12,
      padding: 14,
      elevation: 2,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    disclaimerIcon: {
      color: colors.accent,
      fontSize: 20,
      marginRight: 10,
    },
    disclaimerContent: {
      flex: 1,
    },
    disclaimerTitle: {
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    disclaimerText: {
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 18,
    },
  });
}
