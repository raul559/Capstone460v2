import { ActivityIndicator, Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { createStyles } from '@/features/analysis/components/analyze-button.styles';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  hasImage: boolean;
  isAnalyzing: boolean;
  onPress: () => void;
};

export function AnalyzeButton({ hasImage, isAnalyzing, onPress }: Props) {
  const colors = useTheme();
  const styles = createStyles(colors);
  const isDisabled = !hasImage || isAnalyzing;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Analyze selected image"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.analyzeButton,
        isDisabled && styles.disabledButton,
        pressed && styles.buttonPressed,
      ]}
    >
      {isAnalyzing ? (
        <View style={styles.loadingContent}>
          <ActivityIndicator color={colors.white} />

          <ThemedText style={styles.analyzeButtonText}>
            Analyzing image...
          </ThemedText>
        </View>
      ) : (
        <View style={styles.analyzeButtonContent}>
          <ThemedText style={styles.analyzeButtonText}>
            Analyze image
          </ThemedText>

          <ThemedText style={styles.analyzeArrow}>
            →
          </ThemedText>
        </View>
      )}
    </Pressable>
  );
}
