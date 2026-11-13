import { StyleSheet } from 'react-native';

import type { ThemePalette } from '@/constants/theme';

export function createChatFeedbackButtonsStyles(colors: ThemePalette) {
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
