
import { useEffect, useState } from 'react';
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
import { router, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SkinAnalysisResults } from '../components/skin-analysis-results';
import {
  analyzeSkinImage,
  type SkinAnalysisResult,
} from '@/library/skin-analysis';

export default function UploadScreen() {
  const params = useLocalSearchParams<{ imageUri?: string }>();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] =
    useState<SkinAnalysisResult | null>(null);

  // Receive a photo captured by the camera screen.
  useEffect(() => {
    if (params.imageUri) {
      setImageUri(params.imageUri);
      setAnalysisResult(null);
    }
  }, [params.imageUri]);

  // Open the phone's photo library.
  const chooseImage = async () => {
    if (isAnalyzing) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1,
      });

      if (result.canceled) return;

      setImageUri(result.assets[0].uri);
      setAnalysisResult(null);
    } catch {
      Alert.alert(
        'Unable to select image',
        'Something went wrong while opening your photo gallery. Please try again.'
      );
    }
  };

  // Open the camera screen.
  const openCamera = () => {
    if (!isAnalyzing) {
      router.push('/camera');
    }
  };

  // Send the selected image to the existing backend.
  const analyzePhoto = async () => {
    if (!imageUri || isAnalyzing) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const result = await analyzeSkinImage(imageUri);
      router.push({
        pathname: '/results',
        params: {
          imageUri,
          result: JSON.stringify(result),
        },
      });
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
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.logoBox}>
                <ThemedText style={styles.logoText}>S</ThemedText>
              </View>

              <ThemedText style={styles.headerLabel}>
                IMAGE ANALYSIS
              </ThemedText>

              <View style={styles.headerIcon}>
                <ThemedText style={styles.headerIconText}>✦</ThemedText>
              </View>
            </View>

            <ThemedText style={styles.title}>
              Start with an image
            </ThemedText>

            <ThemedText style={styles.description}>
              Upload your image to explore how SkinAI works.
            </ThemedText>
          </View>

          {/* Image selection card */}
          <View style={styles.selectionCard}>
            {imageUri ? (
              <>
                <Image
                  source={{ uri: imageUri }}
                  style={styles.previewImage}
                  resizeMode="contain"
                  accessibilityLabel="Selected skin image preview"
                />

                <ThemedText style={styles.cardTitle}>
                  Image selected
                </ThemedText>

                <ThemedText style={styles.cardDescription}>
                  Your image is ready for analysis.
                </ThemedText>

                <Pressable
                  onPress={chooseImage}
                  disabled={isAnalyzing}
                  style={styles.secondaryButton}
                >
                  <ThemedText style={styles.secondaryButtonText}>
                    Choose another image
                  </ThemedText>
                </Pressable>
              </>
            ) : (
              <>
                <View style={styles.uploadIcon}>
                  <ThemedText style={styles.uploadIconText}>▧</ThemedText>
                </View>

                <ThemedText style={styles.cardTitle}>
                  Choose an image
                </ThemedText>

                <ThemedText style={styles.cardDescription}>
                  JPG or PNG · Up to 10 MB
                </ThemedText>

                <View style={styles.selectionButtons}>
                  <Pressable
                    onPress={chooseImage}
                    disabled={isAnalyzing}
                    style={styles.selectionOption}
                  >
                    <ThemedText style={styles.optionText}>
                      ▣ Photo library
                    </ThemedText>
                  </Pressable>

                  <Pressable
                    onPress={openCamera}
                    disabled={isAnalyzing}
                    style={styles.selectionOption}
                  >
                    <ThemedText style={styles.optionText}>
                      ◉ Take a photo
                    </ThemedText>
                  </Pressable>
                </View>
              </>
            )}
          </View>

          {/* Photo tips */}
          <View style={styles.infoCard}>
            <ThemedText style={styles.infoTitle}>
              Tips for a successful photo
            </ThemedText>

            <View style={styles.tipRow}>
              <ThemedText style={styles.tipIcon}>✓</ThemedText>
              <ThemedText style={styles.tipText}>
                Use even, natural lighting.
              </ThemedText>
            </View>

            <View style={styles.tipRow}>
              <ThemedText style={styles.tipIcon}>✓</ThemedText>
              <ThemedText style={styles.tipText}>
                Keep one area centered and in focus.
              </ThemedText>
            </View>

            <View style={styles.tipRow}>
              <ThemedText style={styles.tipIcon}>✓</ThemedText>
              <ThemedText style={styles.tipText}>
                Avoid faces and identifying details.
              </ThemedText>
            </View>
          </View>

          {/* Upload information */}
          <View style={styles.noticeCard}>
            <ThemedText style={styles.noticeIcon}>ⓘ</ThemedText>

            <View style={styles.noticeContent}>
              <ThemedText style={styles.noticeTitle}>
                Before you upload
              </ThemedText>

              <ThemedText style={styles.noticeText}>
                Images are sent for AI processing. Only upload images
                you have permission to use.
              </ThemedText>
            </View>
          </View>

          {/* Medical disclaimer */}
          <View style={styles.noticeCard}>
            <ThemedText style={styles.noticeIcon}>♡</ThemedText>

            <View style={styles.noticeContent}>
              <ThemedText style={styles.noticeTitle}>
                Learning, not diagnosis
              </ThemedText>

              <ThemedText style={styles.noticeText}>
                Not a medical diagnosis tool. Do not use results for
                diagnosis or treatment decisions.
              </ThemedText>
            </View>
          </View>

          {/* Analyze button */}
          <Pressable
            accessibilityRole="button"
            disabled={!imageUri || isAnalyzing}
            onPress={analyzePhoto}
            style={({ pressed }) => [
              styles.analyzeButton,
              !imageUri && styles.disabledButton,
              pressed && imageUri && styles.buttonPressed,
            ]}
          >
            {isAnalyzing ? (
              <View style={styles.loadingContent}>
                <ActivityIndicator color="#FFFFFF" />
                <ThemedText style={styles.analyzeButtonText}>
                  Analyzing image...
                </ThemedText>
              </View>
            ) : (
              <View style={styles.analyzeButtonContent}>
                <ThemedText style={styles.analyzeButtonText}>
                  Analyze image
                </ThemedText>
                <ThemedText style={styles.analyzeArrow}>→</ThemedText>
              </View>
            )}
          </Pressable>

          <ThemedText style={styles.footerText}>
            {imageUri
              ? 'Ready to analyze · Educational use only'
              : 'Select an image to continue · Educational use only'}
          </ThemedText>

          {/* Existing analysis results */}
          {analysisResult && (
            <SkinAnalysisResults result={analysisResult} imageUri={imageUri!} />
          )}

          <ThemedText style={styles.disclaimer}>
            SkinAI is an educational tool and does not provide a
            medical diagnosis. Consult a healthcare professional
            about concerning or changing lesions.
          </ThemedText>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D0D6E1',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingTop: 13,
    paddingBottom: 30,
  },
  header: {
    marginBottom: 17,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 19,
  },
  logoBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#3E839C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: 'bold',
  },
  headerLabel: {
    color: '#1F242C',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF1F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconText: {
    color: '#3E839C',
    fontSize: 20,
  },
  title: {
    color: '#1F242C',
    fontSize: 27,
    fontWeight: 'bold',
  },
  description: {
    color: '#3B4351',
    fontSize: 14,
    marginTop: 10,
  },
  selectionCard: {
    alignItems: 'center',
    backgroundColor: '#EFF1F4',
    borderColor: '#3E839C',
    borderWidth: 1,
    borderRadius: 18,
    padding: 22,
    marginBottom: 17,
  },
  uploadIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#D0DCE3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  uploadIconText: {
    fontSize: 29,
    color: '#3E839C',
  },
  cardTitle: {
    color: '#1F242C',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardDescription: {
    color: '#3B4351',
    fontSize: 12,
    marginBottom: 14,
    textAlign: 'center',
  },
  selectionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 20,
  },
  selectionOption: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  optionText: {
    color: '#3B4351',
    fontSize: 12,
    fontWeight: 'bold',
  },
  previewImage: {
    width: '100%',
    height: 190,
    marginBottom: 15,
    borderRadius: 12,
  },
  secondaryButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#D0DCE3',
  },
  secondaryButtonText: {
    color: '#245B45',
    fontWeight: 'bold',
    fontSize: 13,
  },
  infoCard: {
    backgroundColor: '#EFF1F4',
    borderRadius: 18,
    padding: 16,
    marginBottom: 17,
    elevation: 3,
  },
  infoTitle: {
    color: '#1F242C',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipIcon: {
    color: '#3E839C',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  tipText: {
    color: '#3B4351',
    fontSize: 12,
    flex: 1,
  },
  noticeCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF1F4',
    borderRadius: 12,
    padding: 14,
    marginBottom: 17,
    elevation: 3,
  },
  noticeIcon: {
    color: '#3E839C',
    fontSize: 19,
    marginRight: 10,
  },
  noticeContent: {
    flex: 1,
  },
  noticeTitle: {
    color: '#3B4351',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  noticeText: {
    color: '#3B4351',
    fontSize: 12,
    lineHeight: 18,
  },
  analyzeButton: {
    backgroundColor: '#3E839C',
    borderRadius: 100,
    paddingVertical: 15,
    paddingHorizontal: 17,
    marginTop: 2,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.5,
  },
  analyzeButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  analyzeArrow: {
    color: '#FFFFFF',
    fontSize: 21,
  },
  loadingContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  buttonPressed: {
    opacity: 0.75,
  },
  footerText: {
    color: '#3B4351',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 10,
  },
  disclaimer: {
    color: '#3B4351',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 17,
  },
});
