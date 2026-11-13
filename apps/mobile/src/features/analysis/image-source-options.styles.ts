import { StyleSheet } from 'react-native';

import type { useTheme } from '@/hooks/use-theme';

export function createStyles(colors: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    uploadIcon: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor: colors.backgroundSelected,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    uploadIconText: {
      fontSize: 29,
      color: colors.accent,
    },
    cardTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    cardDescription: {
      color: colors.textSecondary,
      fontSize: 12,
      marginBottom: 14,
      textAlign: 'center',
    },
    selectionButtons: {
      flexDirection: 'row',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: 20,
    },
    selectionOption: {
      paddingVertical: 8,
      paddingHorizontal: 4,
    },
    optionText: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: 'bold',
    },
  });
}
