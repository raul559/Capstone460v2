import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { styles } from '@/features/analysis/results-unavailable.styles';
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
