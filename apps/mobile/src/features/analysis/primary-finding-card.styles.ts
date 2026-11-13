import { StyleSheet } from 'react-native';

import type { useTheme } from '@/hooks/use-theme';

export function createStyles(colors: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    findingCard: {
      backgroundColor: colors.backgroundElement,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 18,
      padding: 18,
      marginBottom: 20,
      elevation: 4,
    },
    findingHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    sectionLabel: {
      color: colors.text,
      fontSize: 10,
      fontWeight: 'bold',
      letterSpacing: 1,
    },
    codeBadge: {
      backgroundColor: colors.text,
      borderRadius: 6,
      paddingVertical: 5,
      paddingHorizontal: 9,
    },
    codeText: {
      color: colors.backgroundElement,
      fontSize: 10,
      fontWeight: 'bold',
    },
    findingTitle: {
      color: colors.text,
      fontSize: 23,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    description: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 20,
      marginBottom: 12,
    },
    confidenceRow: {
      flexDirection: 'row',
      marginBottom: 12,
    },
    confidenceBadge: {
      backgroundColor: colors.backgroundSelected,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 12,
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    confidenceText: {
      color: colors.accent,
      fontSize: 11,
      fontWeight: '600',
    },
    riskBadge: {
      alignSelf: 'flex-start',
      backgroundColor: colors.accent,
      borderRadius: 12,
      paddingVertical: 8,
      paddingHorizontal: 14,
      marginBottom: 10,
    },
    riskText: {
      color: colors.white,
      fontSize: 12,
      fontWeight: 'bold',
    },
    learnMore: {
      color: colors.textSecondary,
      fontSize: 11,
    },
  });
}
