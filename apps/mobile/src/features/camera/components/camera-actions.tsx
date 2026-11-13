import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { getCameraButtonLabel } from '@/features/camera/utils/camera-button-label';

type Props = {
  imageUri: string | null;
  isOpeningCamera: boolean;
  onTakePhoto: () => void;
  onUsePhoto: () => void;
};

export function CameraActions({
  imageUri,
  isOpeningCamera,
  onTakePhoto,
  onUsePhoto,
}: Props) {
  return (
    <>
      <Pressable
        accessibilityRole="button"
        disabled={isOpeningCamera}
        onPress={onTakePhoto}
        style={({ pressed }) => [
          styles.cameraButton,
          pressed && styles.buttonPressed,
          isOpeningCamera && styles.buttonDisabled,
        ]}
      >
        <ThemedText style={styles.cameraButtonText}>
          {getCameraButtonLabel(isOpeningCamera, Boolean(imageUri))}
        </ThemedText>
      </Pressable>

      {imageUri && (
        <Pressable
          accessibilityRole="button"
          onPress={onUsePhoto}
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
    </>
  );
}

const styles = StyleSheet.create({
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
