import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { AnalyzeButton } from '@/features/analysis/analyze-button';
import { ImageSelectionCard } from '@/features/analysis/image-selection-card';
import { PhotoTipsCard } from '@/features/analysis/photo-tips-card';
import { UploadFooter } from '@/features/analysis/upload-footer';
import { UploadHeader } from '@/features/analysis/upload-header';
import { UploadNoticeCard } from '@/features/analysis/upload-notice-card';
import { createStyles } from '@/features/analysis/upload-screen.styles';
import { useImageUpload } from '@/features/analysis/use-image-upload';
import { useTheme } from '@/hooks/use-theme';

export default function UploadScreen() {
  const styles = createStyles(useTheme());
  const { imageUri, isAnalyzing, chooseImage, openCamera, analyzePhoto } =
    useImageUpload();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <UploadHeader />

          <ImageSelectionCard
            imageUri={imageUri}
            isAnalyzing={isAnalyzing}
            onChooseImage={chooseImage}
            onOpenCamera={openCamera}
          />

          <PhotoTipsCard />

          <UploadNoticeCard icon="ⓘ" title="Before you upload">
            Images are sent for AI processing. Only upload images
            you have permission to use.
          </UploadNoticeCard>

          <UploadNoticeCard icon="♡" title="Learning, not diagnosis">
            Not a medical diagnosis tool. Do not use results for
            diagnosis or treatment decisions.
          </UploadNoticeCard>

          <AnalyzeButton
            hasImage={Boolean(imageUri)}
            isAnalyzing={isAnalyzing}
            onPress={analyzePhoto}
          />

          <UploadFooter hasImage={Boolean(imageUri)} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}
