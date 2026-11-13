import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { ThemePalette } from '@/constants/theme';
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

function createStyles(colors: ThemePalette) {
  return StyleSheet.create({
    analyzeButton: {
      backgroundColor: colors.accent,
      borderRadius: 100,
      paddingVertical: 15,
      paddingHorizontal: 17,
      marginTop: 2,
      elevation: 3,
    },
    disabledButton: {
      opacity: 0.5,
    },
    analyzeButtonContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    analyzeButtonText: {
      color: colors.white,
      fontSize: 15,
      fontWeight: 'bold',
    },
    analyzeArrow: {
      color: colors.white,
      fontSize: 21,
    },
    loadingContent: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10,
    },
    buttonPressed: {
      opacity: 0.75,
    },
  });
}
