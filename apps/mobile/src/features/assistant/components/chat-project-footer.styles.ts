import { StyleSheet } from 'react-native';

import type { ThemePalette } from '@/constants/theme';

export function createChatProjectFooterStyles(colors: ThemePalette) {
  return StyleSheet.create({
    projectFooter: {
      alignItems: 'center',
      paddingVertical: 13,
      gap: 5,
    },
    projectTitle: {
      color: colors.text,
      fontWeight: '700',
      fontSize: 12,
    },
    projectText: {
      color: colors.textSecondary,
      fontSize: 10,
      textAlign: 'center',
    },
  });
}
