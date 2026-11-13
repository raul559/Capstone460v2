import { StyleSheet } from 'react-native';

import type { useTheme } from '@/hooks/use-theme';

export function createStyles(colors: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    questionnaire: {
      marginBottom: 20,
    },
    questionnaireText: {
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: 'bold',
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 13,
    },
    questionnaireButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.accent,
      borderRadius: 100,
      paddingVertical: 16,
      paddingHorizontal: 20,
      elevation: 4,
    },
    questionnaireButtonText: {
      color: colors.white,
      fontSize: 14,
      fontWeight: 'bold',
    },
    chatButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.backgroundElement,
      borderColor: colors.accent,
      borderWidth: 1,
      borderRadius: 100,
      paddingVertical: 16,
      paddingHorizontal: 20,
      marginTop: 12,
    },
    chatButtonText: {
      color: colors.accent,
      fontSize: 14,
      fontWeight: 'bold',
    },
    chatArrow: {
      color: colors.accent,
      fontSize: 24,
    },
    buttonPressed: {
      opacity: 0.7,
    },
    arrow: {
      color: colors.white,
      fontSize: 24,
    },
  });
}
