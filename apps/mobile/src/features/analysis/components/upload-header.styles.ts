import { StyleSheet } from 'react-native';

import type { ThemePalette } from '@/constants/theme';

export function createStyles(colors: ThemePalette) {
  return StyleSheet.create({
    backButton: {
      alignSelf: 'flex-start',
      paddingVertical: 12,
      paddingHorizontal: 4,
      marginBottom: 12,
    },
    backText: {
      color: colors.accent,
      fontSize: 16,
      fontWeight: '600',
    },
    buttonPressed: {
      opacity: 0.75,
    },
    header: {
      marginBottom: 17,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 19,
    },
    logoBox: {
      width: 36,
      height: 36,
      borderRadius: 11,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoText: {
      color: colors.white,
      fontSize: 21,
      fontWeight: 'bold',
    },
    headerLabel: {
      color: colors.text,
      fontSize: 11,
      fontWeight: 'bold',
      letterSpacing: 1,
    },
    headerIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.backgroundElement,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerIconText: {
      color: colors.accent,
      fontSize: 20,
    },
    title: {
      color: colors.text,
      fontSize: 27,
      fontWeight: 'bold',
    },
    description: {
      color: colors.textSecondary,
      fontSize: 14,
      marginTop: 10,
    },
  });
}
