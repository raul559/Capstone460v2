import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { ThemePalette } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  isAnalyzing: boolean;
  onChooseImage: () => void;
  onOpenCamera: () => void;
};

export function ImageSourceOptions({
  isAnalyzing,
  onChooseImage,
  onOpenCamera,
}: Props) {
  const styles = createStyles(useTheme());

  return (
    <>
      <View style={styles.uploadIcon}>
        <ThemedText style={styles.uploadIconText}>
          ▧
        </ThemedText>
      </View>

      <ThemedText style={styles.cardTitle}>
        Choose an image
      </ThemedText>

      <ThemedText style={styles.cardDescription}>
        JPG or PNG · Up to 10 MB
      </ThemedText>

      <View style={styles.selectionButtons}>
        <Pressable
          accessibilityRole="button"
          onPress={onChooseImage}
          disabled={isAnalyzing}
          style={styles.selectionOption}
        >
          <ThemedText style={styles.optionText}>
            ▣ Photo library
          </ThemedText>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={onOpenCamera}
          disabled={isAnalyzing}
          style={styles.selectionOption}
        >
          <ThemedText style={styles.optionText}>
            ◉ Take a photo
          </ThemedText>
        </Pressable>
      </View>
    </>
  );
}

function createStyles(colors: ThemePalette) {
  return StyleSheet.create({
    uploadIcon: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor: colors.backgroundSelected,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    uploadIconText: {
      fontSize: 29,
      color: colors.accent,
    },
    cardTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    cardDescription: {
      color: colors.textSecondary,
      fontSize: 12,
      marginBottom: 14,
      textAlign: 'center',
    },
    selectionButtons: {
      flexDirection: 'row',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: 20,
    },
    selectionOption: {
      paddingVertical: 8,
      paddingHorizontal: 4,
    },
    optionText: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: 'bold',
    },
  });
}
