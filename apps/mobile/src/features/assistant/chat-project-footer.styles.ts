import { StyleSheet } from 'react-native';

import type { useTheme } from '@/hooks/use-theme';

export function createChatProjectFooterStyles(colors: ReturnType<typeof useTheme>) {
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
