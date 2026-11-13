import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
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

const styles = StyleSheet.create({
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
