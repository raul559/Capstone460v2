import { StyleSheet } from 'react-native';

import type { useTheme } from '@/hooks/use-theme';

export function createChatSuggestionStyles(colors: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    suggestionSection: {
      gap: 9,
      marginTop: 3,
    },
    suggestionLabel: {
      color: colors.textSecondary,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1,
    },
    suggestionChip: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.backgroundElement,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 13,
      paddingVertical: 12,
    },
    suggestionText: {
      color: colors.accent,
      fontSize: 12,
      fontWeight: '600',
    },
    suggestionArrow: {
      color: colors.accent,
      fontSize: 20,
    },
    buttonPressed: {
      opacity: 0.7,
    },
  });
}
