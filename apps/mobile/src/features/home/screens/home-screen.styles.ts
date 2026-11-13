import { StyleSheet } from 'react-native';

import type { ThemePalette } from '@/constants/theme';

export function createHomeScreenStyles(colors: ThemePalette) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 28,
    },
    footer: {
      color: colors.textSecondary,
      fontSize: 11,
      textAlign: 'center',
      marginTop: 18,
    },
  });
}
