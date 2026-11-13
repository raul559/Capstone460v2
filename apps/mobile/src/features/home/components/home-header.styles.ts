import { StyleSheet } from 'react-native';

import type { ThemePalette } from '@/constants/theme';

export function createHomeHeaderStyles(colors: ThemePalette) {
  return StyleSheet.create({
    header: {
      marginBottom: 20,
    },
    brand: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    logoIcon: {
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor: colors.accent,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    logoIconText: {
      color: colors.white,
      fontSize: 23,
      fontWeight: 'bold',
    },
    logo: {
      color: colors.textSecondary,
      fontSize: 20,
      fontWeight: 'bold',
    },
    brandSubtitle: {
      color: colors.text,
      fontSize: 9,
      letterSpacing: 1,
    },
    title: {
      color: colors.text,
      fontSize: 32,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    description: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 21,
    },
  });
}
