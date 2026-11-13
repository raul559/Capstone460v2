import { StyleSheet } from 'react-native';

import type { useTheme } from '@/hooks/use-theme';

export function createStyles(colors: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    noticeCard: {
      flexDirection: 'row',
      backgroundColor: colors.backgroundElement,
      borderColor: colors.danger,
      borderWidth: 1,
      borderRadius: 12,
      padding: 14,
      marginBottom: 20,
      elevation: 3,
    },
    noticeIcon: {
      color: colors.danger,
      fontSize: 17,
      fontWeight: 'bold',
      marginRight: 12,
    },
    noticeContent: {
      flex: 1,
    },
    noticeTitle: {
      color: colors.text,
      fontSize: 13,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    noticeText: {
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 18,
    },
  });
}
