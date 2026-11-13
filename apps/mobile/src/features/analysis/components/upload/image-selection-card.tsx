import { StyleSheet, View } from 'react-native';

import type { ThemePalette } from '@/constants/theme';
import { ImageSourceOptions } from '@/features/analysis/components/upload/image-source-options';
import { SelectedImagePreview } from '@/features/analysis/components/upload/selected-image-preview';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  imageUri: string | null;
  isAnalyzing: boolean;
  onChooseImage: () => void;
  onOpenCamera: () => void;
};

export function ImageSelectionCard({
  imageUri,
  isAnalyzing,
  onChooseImage,
  onOpenCamera,
}: Props) {
  const styles = createStyles(useTheme());

  return (
    <View style={styles.selectionCard}>
      {imageUri ? (
        <SelectedImagePreview
          imageUri={imageUri}
          isAnalyzing={isAnalyzing}
          onChooseImage={onChooseImage}
        />
      ) : (
        <ImageSourceOptions
          isAnalyzing={isAnalyzing}
          onChooseImage={onChooseImage}
          onOpenCamera={onOpenCamera}
        />
      )}
    </View>
  );
}

function createStyles(colors: ThemePalette) {
  return StyleSheet.create({
    selectionCard: {
      alignItems: 'center',
      backgroundColor: colors.backgroundElement,
      borderColor: colors.accent,
      borderWidth: 1,
      borderRadius: 18,
      padding: 22,
      marginBottom: 17,
    },
  });
}
