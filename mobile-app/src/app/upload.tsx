
import { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function UploadScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);

  const chooseImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1,
      });

      // If the user closes the gallery, do nothing.
      if (result.canceled) {
        return;
      }

      // Save the selected image so it can be displayed.
      setImageUri(result.assets[0].uri);
    } catch {
      Alert.alert(
        'Unable to select image',
        'Something went wrong while opening your photo gallery. Please try again.'
      );
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/');
            }
          }}
          style={styles.backButton}
        >
          <ThemedText style={styles.backText}>
            {'\u2039'} Back
          </ThemedText>
        </Pressable>

        <View style={styles.header}>
          <ThemedText style={styles.title}>
            Upload Image
          </ThemedText>

          <ThemedText style={styles.description}>
            Choose a skin image from your phone to preview it.
          </ThemedText>
        </View>

        <View style={styles.preview}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              resizeMode="contain"
              accessibilityLabel="Selected skin image preview"
            />
          ) : (
            <View style={styles.emptyPreview}>
              <ThemedText style={styles.placeholderIcon}>
                {'\u{1F5BC}\u{FE0F}'}
              </ThemedText>

              <ThemedText style={styles.placeholderText}>
                No image selected yet
              </ThemedText>
            </View>
          )}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={chooseImage}
          style={({ pressed }) => [
            styles.chooseButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <ThemedText style={styles.chooseButtonText}>
            {imageUri ? 'Choose Another Image' : 'Choose Image'}
          </ThemedText>
        </Pressable>

        <ThemedText style={styles.disclaimer}>
          SkinAI is an educational tool and does not provide a medical diagnosis.
        </ThemedText>
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
    flex: 1,
    minHeight: 180,
    maxHeight: 420,
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
  chooseButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#167D9A',
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 22,
  },
  chooseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.75,
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.65,
    marginTop: 20,
    marginBottom: 18,
  },
});
