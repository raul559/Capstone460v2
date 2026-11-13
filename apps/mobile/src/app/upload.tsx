/* eslint-disable max-lines -- TODO: split into smaller files. */

import { useCallback, useRef, useState } from 'react';
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
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { analyzeSkinImage } from '@/api/skin-analysis';
import { saveAnalysisResult } from '@/features/analysis/analysis-result-store';

export default function UploadScreen() {
  const params = useLocalSearchParams<{ imageUri?: string }>();

  // Receive an image passed from the camera screen.
  const cameraImageUri =
    typeof params.imageUri === 'string' && params.imageUri.length > 0
      ? params.imageUri
      : null;

  // Store images selected from the photo library separately.
  const [selectedImageUri, setSelectedImageUri] =
    useState<string | null>(null);

  // Prefer the camera image when one is available.
  const imageUri = cameraImageUri ?? selectedImageUri;

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Track analysis requests so abandoned requests cannot navigate.
  const requestIdRef = useRef(0);

  // Get the currently selected app theme.
  const colors = useTheme();

  // Invalidate an analysis request when leaving this screen.
  useFocusEffect(
    useCallback(() => {
      setIsAnalyzing(false);

      return () => {
        requestIdRef.current += 1;
      };
    }, [])
  );

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

      const selectedImage = result.assets[0]?.uri;

      if (!selectedImage) {
        Alert.alert(
          'No image selected',
          'Please select a valid image and try again.'
        );
        return;
      }

      // Clear an older camera image before using the gallery image.
      router.setParams({ imageUri: undefined });
      setSelectedImageUri(selectedImage);
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

    const requestId = ++requestIdRef.current;

    setIsAnalyzing(true);

    try {
      const result = await analyzeSkinImage(imageUri);

      // Ignore results from requests that are no longer active.
      if (requestId !== requestIdRef.current) return;

      // Store the analysis outside the route parameters.
      const analysisId = saveAnalysisResult(imageUri, result);

      router.push({
        pathname: '/results',
        params: {
          analysisId,
        },
      });
    } catch (error) {
      if (requestId !== requestIdRef.current) return;

      Alert.alert(
        'Analysis failed',
        error instanceof Error
          ? error.message
          : 'Unable to analyze this photo. Please try again.'
      );
    } finally {
      if (requestId === requestIdRef.current) {
        setIsAnalyzing(false);
      }
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    safeArea: {
      flex: 1,
      paddingHorizontal: 24,
    },
    scrollContent: {
      paddingTop: 13,
      paddingBottom: 30,
    },
    backButton: {
      alignSelf: 'flex-start',
      paddingVertical: 12,
      paddingHorizontal: 4,
      marginBottom: 12,
    },
    backText: {
      color: colors.accent,
      fontSize: 16,
      fontWeight: '600',
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
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoText: {
      color: colors.white,
      fontSize: 21,
      fontWeight: 'bold',
    },
    headerLabel: {
      color: colors.text,
      fontSize: 11,
      fontWeight: 'bold',
      letterSpacing: 1,
    },
    headerIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.backgroundElement,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerIconText: {
      color: colors.accent,
      fontSize: 20,
    },
    title: {
      color: colors.text,
      fontSize: 27,
      fontWeight: 'bold',
    },
    description: {
      color: colors.textSecondary,
      fontSize: 14,
      marginTop: 10,
    },
    selectionCard: {
      alignItems: 'center',
      backgroundColor: colors.backgroundElement,
      borderColor: colors.accent,
      borderWidth: 1,
      borderRadius: 18,
      padding: 22,
      marginBottom: 17,
    },
    uploadIcon: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor: colors.backgroundSelected,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    uploadIconText: {
      fontSize: 29,
      color: colors.accent,
    },
    cardTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    cardDescription: {
      color: colors.textSecondary,
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
      color: colors.textSecondary,
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
      backgroundColor: colors.backgroundSelected,
    },
    secondaryButtonText: {
      color: colors.accent,
      fontWeight: 'bold',
      fontSize: 13,
    },
    infoCard: {
      backgroundColor: colors.backgroundElement,
      borderRadius: 18,
      padding: 16,
      marginBottom: 17,
      elevation: 3,
    },
    infoTitle: {
      color: colors.text,
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
      color: colors.accent,
      fontSize: 16,
      fontWeight: 'bold',
      marginRight: 10,
    },
    tipText: {
      color: colors.textSecondary,
      fontSize: 12,
      flex: 1,
    },
    noticeCard: {
      flexDirection: 'row',
      backgroundColor: colors.backgroundElement,
      borderRadius: 12,
      padding: 14,
      marginBottom: 17,
      elevation: 3,
    },
    noticeIcon: {
      color: colors.accent,
      fontSize: 19,
      marginRight: 10,
    },
    noticeContent: {
      flex: 1,
    },
    noticeTitle: {
      color: colors.text,
      fontSize: 13,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    noticeText: {
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 18,
    },
    analyzeButton: {
      backgroundColor: colors.accent,
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
      color: colors.white,
      fontSize: 15,
      fontWeight: 'bold',
    },
    analyzeArrow: {
      color: colors.white,
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
      color: colors.textSecondary,
      fontSize: 11,
      textAlign: 'center',
      marginTop: 10,
    },
    disclaimer: {
      color: colors.textSecondary,
      fontSize: 11,
      textAlign: 'center',
      marginTop: 20,
      lineHeight: 17,
    },
  });

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <ThemedText style={styles.backText}>
              ‹ Back
            </ThemedText>
          </Pressable>

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

          {/* Image Selection Card */}
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
                  accessibilityRole="button"
                  onPress={chooseImage}
                  disabled={isAnalyzing}
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <ThemedText style={styles.secondaryButtonText}>
                    Choose another image
                  </ThemedText>
                </Pressable>
              </>
            ) : (
              <>
                <View style={styles.uploadIcon}>
                  <ThemedText style={styles.uploadIconText}>
                    ▧
                  </ThemedText>
                </View>

                <ThemedText style={styles.cardTitle}>
                  Choose an image
                </ThemedText>

                <ThemedText style={styles.cardDescription}>
                  JPG or PNG · Up to 10 MB
                </ThemedText>

                <View style={styles.selectionButtons}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={chooseImage}
                    disabled={isAnalyzing}
                    style={styles.selectionOption}
                  >
                    <ThemedText style={styles.optionText}>
                      ▣ Photo library
                    </ThemedText>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
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

          {/* Photo Tips */}
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

          {/* Upload Information */}
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

          {/* Medical Disclaimer */}
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

          {/* Analyze Button */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Analyze selected image"
            disabled={!imageUri || isAnalyzing}
            onPress={analyzePhoto}
            style={({ pressed }) => [
              styles.analyzeButton,
              (!imageUri || isAnalyzing) && styles.disabledButton,
              pressed && styles.buttonPressed,
            ]}
          >
            {isAnalyzing ? (
              <View style={styles.loadingContent}>
                <ActivityIndicator color={colors.white} />

                <ThemedText style={styles.analyzeButtonText}>
                  Analyzing image...
                </ThemedText>
              </View>
            ) : (
              <View style={styles.analyzeButtonContent}>
                <ThemedText style={styles.analyzeButtonText}>
                  Analyze image
                </ThemedText>

                <ThemedText style={styles.analyzeArrow}>
                  →
                </ThemedText>
              </View>
            )}
          </Pressable>

          <ThemedText style={styles.footerText}>
            {imageUri
              ? 'Ready to analyze · Educational use only'
              : 'Select an image to continue · Educational use only'}
          </ThemedText>

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
