import { useCallback, useRef, useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';

import { analyzeSkinImage } from '@/api/skin-analysis';
import { saveAnalysisResult } from '@/features/analysis/analysis-result-store';

export function useImageUpload() {
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

  return { imageUri, isAnalyzing, chooseImage, openCamera, analyzePhoto };
}
