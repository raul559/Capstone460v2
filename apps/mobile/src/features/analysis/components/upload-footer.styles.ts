import { StyleSheet } from 'react-native';

import type { ThemePalette } from '@/constants/theme';

export function createStyles(colors: ThemePalette) {
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
