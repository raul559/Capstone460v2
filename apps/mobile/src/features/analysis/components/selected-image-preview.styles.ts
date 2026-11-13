import { StyleSheet } from 'react-native';

import type { ThemePalette } from '@/constants/theme';

export function createStyles(colors: ThemePalette) {
  return StyleSheet.create({
    previewImage: {
      width: '100%',
      height: 190,
      marginBottom: 15,
      borderRadius: 12,
    },
    cardTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    cardDescription: {
      color: colors.textSecondary,
      fontSize: 12,
      marginBottom: 14,
      textAlign: 'center',
    },
    secondaryButton: {
      padding: 10,
      borderRadius: 10,
      backgroundColor: colors.backgroundSelected,
    },
    secondaryButtonText: {
      color: colors.accent,
      fontWeight: 'bold',
      fontSize: 13,
    },
    buttonPressed: {
      opacity: 0.75,
    },
  });
}
