import { Image, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { createStyles } from '@/features/analysis/selected-image-preview.styles';
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
