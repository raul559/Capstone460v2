import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import type { ThemePalette } from '@/constants/theme';
import { AnalyzeButton } from '@/features/analysis/components/upload/analyze-button';
import { ImageSelectionCard } from '@/features/analysis/components/upload/image-selection-card';
import { PhotoTipsCard } from '@/features/analysis/components/upload/photo-tips-card';
import { UploadFooter } from '@/features/analysis/components/upload/upload-footer';
import { UploadHeader } from '@/features/analysis/components/upload/upload-header';
import { UploadNoticeCard } from '@/features/analysis/components/upload/upload-notice-card';
import { useImageUpload } from '@/features/analysis/hooks/use-image-upload';
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

function createStyles(colors: ThemePalette) {
  return StyleSheet.create({
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
  });
}
