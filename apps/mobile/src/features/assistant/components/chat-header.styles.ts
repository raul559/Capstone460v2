import { StyleSheet } from 'react-native';

import type { ThemePalette } from '@/constants/theme';

export function createChatHeaderStyles(colors: ThemePalette) {
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 13,
      backgroundColor: colors.backgroundElement,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 11,
    },
    backButton: {
      width: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
    backText: {
      color: colors.textSecondary,
      fontSize: 34,
    },
    logo: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoText: {
      color: colors.white,
      fontSize: 22,
      fontWeight: '700',
    },
    headerInfo: {
      flex: 1,
      gap: 3,
    },
    title: {
      color: colors.text,
      fontSize: 17,
      fontWeight: '700',
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: 11,
    },
    profileCircle: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.backgroundSelected,
      alignItems: 'center',
      justifyContent: 'center',
    },
    profileText: {
      color: colors.text,
      fontWeight: '700',
    },
  });
}
