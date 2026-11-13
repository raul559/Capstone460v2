import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { CameraActions } from '@/features/camera/components/camera-actions';
import { CameraHeader } from '@/features/camera/components/camera-header';
import { CameraPreview } from '@/features/camera/components/camera-preview';
import { styles } from '@/features/camera/screens/camera-screen.styles';
import { useCameraCapture } from '@/features/camera/hooks/use-camera-capture';

export default function CameraScreen() {
  const { imageUri, isOpeningCamera, takePhoto, confirmPhoto } =
    useCameraCapture();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <CameraHeader />
          <CameraPreview imageUri={imageUri} />
          <CameraActions
            imageUri={imageUri}
            isOpeningCamera={isOpeningCamera}
            onTakePhoto={takePhoto}
            onUsePhoto={confirmPhoto}
          />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}
