import { Image, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { ThemePalette } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  imageUri: string;
  isAnalyzing: boolean;
  onChooseImage: () => void;
};

export function SelectedImagePreview({
  imageUri,
  isAnalyzing,
  onChooseImage,
}: Props) {
  const styles = createStyles(useTheme());

  return (
    <>
      <Image
        source={{ uri: imageUri }}
        style={styles.previewImage}
        resizeMode="contain"
        accessibilityLabel="Selected skin image preview"
      />

      <ThemedText style={styles.cardTitle}>
        Image selected
      </ThemedText>

      <ThemedText style={styles.cardDescription}>
        Your image is ready for analysis.
      </ThemedText>

      <Pressable
        accessibilityRole="button"
        onPress={onChooseImage}
        disabled={isAnalyzing}
        style={({ pressed }) => [
          styles.secondaryButton,
          pressed && styles.buttonPressed,
        ]}
      >
        <ThemedText style={styles.secondaryButtonText}>
          Choose another image
        </ThemedText>
      </Pressable>
    </>
  );
}

function createStyles(colors: ThemePalette) {
  return StyleSheet.create({
    previewImage: {
      width: '100%',
      height: 190,
      marginBottom: 15,
      borderRadius: 12,
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
    secondaryButton: {
      padding: 10,
      borderRadius: 10,
      backgroundColor: colors.backgroundSelected,
    },
    secondaryButtonText: {
      color: colors.accent,
      fontWeight: 'bold',
      fontSize: 13,
    },
    buttonPressed: {
      opacity: 0.75,
    },
  });
}
