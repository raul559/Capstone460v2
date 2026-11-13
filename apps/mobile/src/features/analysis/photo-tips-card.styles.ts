import { StyleSheet } from 'react-native';

import type { useTheme } from '@/hooks/use-theme';

export function createStyles(colors: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    infoCard: {
      backgroundColor: colors.backgroundElement,
      borderRadius: 18,
      padding: 16,
      marginBottom: 17,
      elevation: 3,
    },
    infoTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 12,
    },
    tipRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    tipIcon: {
      color: colors.accent,
      fontSize: 16,
      fontWeight: 'bold',
      marginRight: 10,
    },
    tipText: {
      color: colors.textSecondary,
      fontSize: 12,
      flex: 1,
    },
  });
}
