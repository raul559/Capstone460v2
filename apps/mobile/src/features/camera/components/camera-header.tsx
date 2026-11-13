import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { styles } from '@/features/camera/components/camera-header.styles';

export function CameraHeader() {
  return (
    <>
      <Pressable
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <ThemedText style={styles.backText}>
          {'‹'} Back
        </ThemedText>
      </Pressable>

      <View style={styles.header}>
        <ThemedText style={styles.title}>
          Take a Photo
        </ThemedText>

        <ThemedText style={styles.description}>
          Take a photo of a skin lesion to preview it before analysis.
        </ThemedText>
      </View>
    </>
  );
}
