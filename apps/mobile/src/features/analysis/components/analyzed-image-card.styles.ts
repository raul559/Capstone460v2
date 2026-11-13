import { StyleSheet } from 'react-native';

import type { ThemePalette } from '@/constants/theme';

export function createStyles(colors: ThemePalette) {
  return StyleSheet.create({
    imageCard: {
      backgroundColor: colors.backgroundElement,
      borderRadius: 18,
      marginBottom: 20,
      overflow: 'hidden',
      elevation: 4,
    },
    image: {
      width: '100%',
      height: 190,
      backgroundColor: colors.background,
    },
    imageCaption: {
      color: colors.textSecondary,
      fontSize: 11,
      padding: 12,
    },
  });
}
