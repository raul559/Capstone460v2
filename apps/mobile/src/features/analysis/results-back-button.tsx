import { Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { styles } from '@/features/analysis/results-back-button.styles';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  onPress: () => void;
};

export function ResultsBackButton({ onPress }: Props) {
  const colors = useTheme();

  return (
    <Pressable
      style={styles.backButton}
      onPress={onPress}
    >
      <ThemedText
        style={[styles.backText, { color: colors.accent }]}
      >
        ← Back to Image Analysis
      </ThemedText>
    </Pressable>
  );
}
