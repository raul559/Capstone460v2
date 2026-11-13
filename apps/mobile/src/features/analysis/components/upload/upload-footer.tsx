import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { ThemePalette } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  hasImage: boolean;
};

export function UploadFooter({ hasImage }: Props) {
  const styles = createStyles(useTheme());

  return (
    <>
      <ThemedText style={styles.footerText}>
        {hasImage
          ? 'Ready to analyze · Educational use only'
          : 'Select an image to continue · Educational use only'}
      </ThemedText>

      <ThemedText style={styles.disclaimer}>
        SkinAI is an educational tool and does not provide a
        medical diagnosis. Consult a healthcare professional
        about concerning or changing lesions.
      </ThemedText>
    </>
  );
}

function createStyles(colors: ThemePalette) {
  return StyleSheet.create({
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
}
