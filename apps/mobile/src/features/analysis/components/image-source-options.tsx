import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { createStyles } from '@/features/analysis/components/image-source-options.styles';
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
