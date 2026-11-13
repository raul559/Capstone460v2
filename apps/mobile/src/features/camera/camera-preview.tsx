import { Image, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { styles } from '@/features/camera/camera-preview.styles';

type Props = {
  imageUri: string | null;
};

export function CameraPreview({ imageUri }: Props) {
  return (
    <View style={styles.preview}>
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="contain"
          accessibilityLabel="Captured photo preview"
        />
      ) : (
        <View style={styles.emptyPreview}>
          <ThemedText style={styles.placeholderIcon}>
            {/* eslint-disable-next-line no-restricted-syntax -- TODO: replace emoji with an icon */}
            {'\u{1F4F7}'}
          </ThemedText>

          <ThemedText style={styles.placeholderText}>
            No photo taken yet
          </ThemedText>
        </View>
      )}
    </View>
  );
}
