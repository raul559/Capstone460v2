import { StyleSheet } from 'react-native';

import type { useTheme } from '@/hooks/use-theme';

export function createStyles(colors: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    selectionCard: {
      alignItems: 'center',
      backgroundColor: colors.backgroundElement,
      borderColor: colors.accent,
      borderWidth: 1,
      borderRadius: 18,
      padding: 22,
      marginBottom: 17,
    },
  });
}
