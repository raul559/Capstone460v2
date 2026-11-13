import { useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';

export function useCameraCapture() {
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

  const confirmPhoto = () => {
    if (!imageUri) {
      return;
    }

    // Return to the existing Upload screen with the captured photo.
    router.dismissTo({
      pathname: '/upload',
      params: { imageUri },
    });
  };

  return { imageUri, isOpeningCamera, takePhoto, confirmPhoto };
}
