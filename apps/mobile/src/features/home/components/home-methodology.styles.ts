import { StyleSheet } from 'react-native';

import type { ThemePalette } from '@/constants/theme';

export function createHomeMethodologyStyles(colors: ThemePalette) {
  return StyleSheet.create({
    methodology: {
      marginBottom: 18,
    },
    sectionTitle: {
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    cardDescription: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 21,
    },
    methodologyLink: {
      color: colors.accent,
      fontSize: 14,
      fontWeight: 'bold',
      marginTop: 10,
    },
    linkPressed: {
      opacity: 0.6,
    },
  });
}
