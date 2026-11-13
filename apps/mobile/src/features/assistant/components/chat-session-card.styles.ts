import { StyleSheet } from 'react-native';

import type { ThemePalette } from '@/constants/theme';

export function createChatSessionCardStyles(colors: ThemePalette) {
  return StyleSheet.create({
    sessionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.backgroundElement,
      borderRadius: 14,
      padding: 13,
      gap: 11,
    },
    sessionIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: colors.backgroundSelected,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sessionIconText: {
      color: colors.accent,
      fontSize: 21,
    },
    sessionInfo: {
      flex: 1,
      gap: 4,
    },
    sessionTitle: {
      color: colors.text,
      fontWeight: '700',
      fontSize: 13,
    },
    sessionSubtitle: {
      color: colors.textSecondary,
      fontSize: 11,
    },
    sessionMenu: {
      color: colors.textSecondary,
      fontWeight: '700',
    },
  });
}
