import { StyleSheet } from 'react-native';

import type { useTheme } from '@/hooks/use-theme';

export function createChatFeedbackButtonsStyles(colors: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    feedbackRow: {
      flexDirection: 'row',
      gap: 8,
    },
    feedbackButton: {
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 9,
      backgroundColor: colors.backgroundElement,
    },
    feedbackSelected: {
      backgroundColor: colors.backgroundSelected,
    },
    feedbackText: {
      fontSize: 13,
    },
  });
}
