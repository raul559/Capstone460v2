import { View } from 'react-native';

import { createStyles } from '@/features/analysis/components/image-selection-card.styles';
import { ImageSourceOptions } from '@/features/analysis/components/image-source-options';
import { SelectedImagePreview } from '@/features/analysis/components/selected-image-preview';
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
