import { Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { styles } from '@/features/camera/camera-actions.styles';
import { getCameraButtonLabel } from '@/features/camera/camera-button-label';

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
