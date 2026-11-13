import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

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

const styles = StyleSheet.create({
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 12,
    paddingRight: 16,
  },
  backText: {
    fontSize: 17,
    color: '#167D9A',
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    opacity: 0.7,
  },
});
