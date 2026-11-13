import { StyleSheet } from 'react-native';

import type { useTheme } from '@/hooks/use-theme';

export function createStyles(colors: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    analyzeButton: {
      backgroundColor: colors.accent,
      borderRadius: 100,
      paddingVertical: 15,
      paddingHorizontal: 17,
      marginTop: 2,
      elevation: 3,
    },
    disabledButton: {
      opacity: 0.5,
    },
    analyzeButtonContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    analyzeButtonText: {
      color: colors.white,
      fontSize: 15,
      fontWeight: 'bold',
    },
    analyzeArrow: {
      color: colors.white,
      fontSize: 21,
    },
    loadingContent: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10,
    },
    buttonPressed: {
      opacity: 0.75,
    },
  });
}
