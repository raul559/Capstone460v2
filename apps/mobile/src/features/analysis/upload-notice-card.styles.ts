import { StyleSheet } from 'react-native';

import type { useTheme } from '@/hooks/use-theme';

export function createStyles(colors: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    noticeCard: {
      flexDirection: 'row',
      backgroundColor: colors.backgroundElement,
      borderRadius: 12,
      padding: 14,
      marginBottom: 17,
      elevation: 3,
    },
    noticeIcon: {
      color: colors.accent,
      fontSize: 19,
      marginRight: 10,
    },
    noticeContent: {
      flex: 1,
    },
    noticeTitle: {
      color: colors.text,
      fontSize: 13,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    noticeText: {
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 18,
    },
  });
}
