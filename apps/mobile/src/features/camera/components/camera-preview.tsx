import { Image, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

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

const styles = StyleSheet.create({
  preview: {
    height: 300,
    minHeight: 180,
    borderWidth: 1.5,
    borderColor: '#B8CDD6',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F3F7F8',
  },
  emptyPreview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  placeholderText: {
    fontSize: 15,
    color: '#526873',
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
