import { StyleSheet } from 'react-native';

import type { ThemePalette } from '@/constants/theme';

export function createStyles(colors: ThemePalette) {
  return StyleSheet.create({
    otherCard: {
      backgroundColor: colors.backgroundElement,
      borderRadius: 14,
      padding: 16,
      marginBottom: 20,
    },
    otherTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    predictionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingVertical: 10,
    },
    predictionName: {
      color: colors.textSecondary,
      fontSize: 12,
      flex: 1,
      paddingRight: 10,
    },
    predictionConfidence: {
      color: colors.text,
      fontSize: 12,
      fontWeight: 'bold',
    },
  });
}
