import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export function ResultsUnavailable() {
  const colors = useTheme();

  return (
    <View
      style={[
        styles.errorContainer,
        { backgroundColor: colors.backgroundElement },
      ]}
    >
      <ThemedText
        style={[styles.errorTitle, { color: colors.text }]}
      >
        Results unavailable
      </ThemedText>
      <ThemedText
        style={[
          styles.errorMessage,
          { color: colors.textSecondary },
        ]}
      >
        We couldn&apos;t load your analysis. Please try again.
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    padding: 20,
    borderRadius: 16,
    gap: 10,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  errorMessage: {
    fontSize: 14,
  },
});
