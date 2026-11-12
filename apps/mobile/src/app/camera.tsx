
import { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function CameraScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isOpeningCamera, setIsOpeningCamera] = useState(false);

  const takePhoto = async () => {
    if (isOpeningCamera) {
      return;
    }

    setIsOpeningCamera(true);

    try {
      const permission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Camera permission needed',
          'Allow SkinAI to access your camera to take a photo.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1,
      });

      if (result.canceled) {
        return;
      }

      setImageUri(result.assets[0].uri);
    } catch {
      Alert.alert(
        'Unable to open camera',
        'Something went wrong while opening the camera. Please try again.'
      );
    } finally {
      setIsOpeningCamera(false);
    }
  };

  const usePhoto = () => {
    if (!imageUri) {
      return;
    }

    // Return to the existing Upload screen with the captured photo.
    router.dismissTo({
      pathname: '/upload',
      params: { imageUri },
    });
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ThemedText style={styles.backText}>
              {'\u2039'} Back
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
                  {'\u{1F4F7}'}
                </ThemedText>

                <ThemedText style={styles.placeholderText}>
                  No photo taken yet
                </ThemedText>
              </View>
            )}
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={isOpeningCamera}
            onPress={takePhoto}
            style={({ pressed }) => [
              styles.cameraButton,
              pressed && styles.buttonPressed,
              isOpeningCamera && styles.buttonDisabled,
            ]}
          >
            <ThemedText style={styles.cameraButtonText}>
              {isOpeningCamera
                ? 'Opening Camera...'
                : imageUri
                  ? 'Retake Photo'
                  : 'Open Camera'}
            </ThemedText>
          </Pressable>

          {imageUri && (
            <Pressable
              accessibilityRole="button"
              onPress={usePhoto}
              style={({ pressed }) => [
                styles.useButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <ThemedText style={styles.useButtonText}>
                Use This Photo
              </ThemedText>
            </Pressable>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 22,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
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
  cameraButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#167D9A',
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 22,
  },
  cameraButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  useButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#245B45',
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 12,
  },
  useButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.75,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
