import { StyleSheet } from 'react-native';

import type { ThemePalette } from '@/constants/theme';

export function createHomeDisclaimerStyles(colors: ThemePalette) {
  return StyleSheet.create({
    disclaimer: {
      flexDirection: 'row',
      backgroundColor: colors.backgroundElement,
      borderRadius: 12,
      padding: 14,
      elevation: 2,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    disclaimerIcon: {
      color: colors.accent,
      fontSize: 20,
      marginRight: 10,
    },
    disclaimerContent: {
      flex: 1,
    },
    disclaimerTitle: {
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    disclaimerText: {
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 18,
    },
  });
}
