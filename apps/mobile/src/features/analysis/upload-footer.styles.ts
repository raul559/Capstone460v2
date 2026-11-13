import { StyleSheet } from 'react-native';

import type { useTheme } from '@/hooks/use-theme';

export function createStyles(colors: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    footerText: {
      color: colors.textSecondary,
      fontSize: 11,
      textAlign: 'center',
      marginTop: 10,
    },
    disclaimer: {
      color: colors.textSecondary,
      fontSize: 11,
      textAlign: 'center',
      marginTop: 20,
      lineHeight: 17,
    },
  });
}
