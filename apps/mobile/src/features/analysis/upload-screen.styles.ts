import { StyleSheet } from 'react-native';

import type { useTheme } from '@/hooks/use-theme';

export function createStyles(colors: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    safeArea: {
      flex: 1,
      paddingHorizontal: 24,
    },
    scrollContent: {
      paddingTop: 13,
      paddingBottom: 30,
    },
  });
}
