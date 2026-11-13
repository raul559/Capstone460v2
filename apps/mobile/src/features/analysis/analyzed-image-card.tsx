import { Image, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { createStyles } from '@/features/analysis/analyzed-image-card.styles';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  imageUri: string;
};

export function AnalyzedImageCard({ imageUri }: Props) {
  const styles = createStyles(useTheme());

  return (
    <View style={styles.imageCard}>
      <Image
        source={{ uri: imageUri }}
        style={styles.image}
        resizeMode="cover"
      />
      <ThemedText style={styles.imageCaption}>Analyzed image</ThemedText>
    </View>
  );
}
