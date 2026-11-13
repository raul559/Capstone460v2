import { Image, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { ThemePalette } from '@/constants/theme';
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

function createStyles(colors: ThemePalette) {
  return StyleSheet.create({
    imageCard: {
      backgroundColor: colors.backgroundElement,
      borderRadius: 18,
      marginBottom: 20,
      overflow: 'hidden',
      elevation: 4,
    },
    image: {
      width: '100%',
      height: 190,
      backgroundColor: colors.background,
    },
    imageCaption: {
      color: colors.textSecondary,
      fontSize: 11,
      padding: 12,
    },
  });
}
