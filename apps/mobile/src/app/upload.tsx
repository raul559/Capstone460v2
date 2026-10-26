
import { useState } from 'react';
import {
  ActivityIndicator,
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
import { SkinAnalysisResults } from '../components/skin-analysis-results';
import {
  analyzeSkinImage,
  type SkinAnalysisResult,
} from '@/library/skin-analysis';

export default function UploadScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] =
    useState<SkinAnalysisResult | null>(null);

  const chooseImage = async () => {
    if (isAnalyzing) {
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1,
      });

      if (result.canceled) {
        return;
      }

      setImageUri(result.assets[0].uri);
      setAnalysisResult(null);
    } catch {
      Alert.alert(
        'Unable to select image',
        'Something went wrong while opening your photo gallery. Please try again.'
      );
    }
  };

  const analyzePhoto = async () => {
    if (!imageUri || isAnalyzing) {
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const result = await analyzeSkinImage(imageUri);
      setAnalysisResult(result);
    } catch (error) {
      Alert.alert(
        'Analysis failed',
        error instanceof Error
          ? error.message
          : 'Unable to analyze this photo. Please try again.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
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
              Choose a skin image from your phone to preview and analyze it.
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
            disabled={isAnalyzing}
            onPress={chooseImage}
            style={({ pressed }) => [
              styles.chooseButton,
              pressed && styles.buttonPressed,
              isAnalyzing && styles.buttonDisabled,
            ]}
          >
            <ThemedText style={styles.chooseButtonText}>
              {imageUri ? 'Choose Another Image' : 'Choose Image'}
            </ThemedText>
          </Pressable>

          {imageUri && (
            <Pressable
              accessibilityRole="button"
              disabled={isAnalyzing}
              onPress={analyzePhoto}
              style={({ pressed }) => [
                styles.analyzeButton,
                pressed && styles.buttonPressed,
                isAnalyzing && styles.buttonDisabled,
              ]}
            >
              {isAnalyzing ? (
                <View style={styles.loadingContent}>
                  <ActivityIndicator color="#FFFFFF" />
                  <ThemedText style={styles.analyzeButtonText}>
                    Analyzing Photo...
                  </ThemedText>
                </View>
              ) : (
                <ThemedText style={styles.analyzeButtonText}>
                  Analyze Photo
                </ThemedText>
              )}
            </Pressable>
          )}

          {analysisResult && (
            <SkinAnalysisResults result={analysisResult} />
          )}

          <ThemedText style={styles.disclaimer}>
            SkinAI is an educational tool and does not provide a medical
            diagnosis. Consult a healthcare professional about concerning
            or changing lesions.
          </ThemedText>
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
    paddingBottom: 12,
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
  analyzeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#245B45',
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 12,
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  buttonPressed: {
    opacity: 0.75,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.65,
    marginTop: 20,
    marginBottom: 18,
  },
});
