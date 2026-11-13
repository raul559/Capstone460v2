import { StyleSheet } from 'react-native';

import type { ThemePalette } from '@/constants/theme';

export function createChatScreenStyles(colors: ThemePalette) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    chatArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    chatContent: {
      padding: 16,
      gap: 18,
    },
    dateLabel: {
      color: colors.textSecondary,
      fontSize: 10,
      fontWeight: '700',
      textAlign: 'center',
      letterSpacing: 1.2,
    },
  });
}
