import { StyleSheet } from 'react-native';

import type { useTheme } from '@/hooks/use-theme';

export function createHomeActionCardStyles(colors: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.backgroundElement,
      borderRadius: 12,
      padding: 14,
      marginBottom: 15,
      elevation: 3,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 4,
    },
    outlinedCard: {
      borderWidth: 1,
      borderColor: colors.accent,
    },
    cardText: {
      marginBottom: 14,
    },
    sectionTitle: {
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    cardDescription: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 21,
    },
    primaryButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.accent,
      borderRadius: 100,
      paddingVertical: 16,
      paddingHorizontal: 17,
    },
    buttonPressed: {
      opacity: 0.7,
      transform: [{ scale: 0.99 }],
    },
    buttonText: {
      color: colors.white,
      fontSize: 15,
      fontWeight: 'bold',
    },
    arrow: {
      color: colors.white,
      fontSize: 24,
      lineHeight: 24,
    },
  });
}
