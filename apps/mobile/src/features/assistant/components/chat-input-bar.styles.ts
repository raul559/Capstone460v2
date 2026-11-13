import { StyleSheet } from 'react-native';

import type { ThemePalette } from '@/constants/theme';

export function createChatInputBarStyles(colors: ThemePalette) {
  return StyleSheet.create({
    inputSection: {
      paddingHorizontal: 13,
      paddingTop: 11,
      paddingBottom: 9,
      backgroundColor: colors.backgroundElement,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 5,
      gap: 8,
    },
    textInput: {
      flex: 1,
      color: colors.text,
      fontSize: 13,
      maxHeight: 90,
      minHeight: 40,
      paddingVertical: 8,
    },
    sendButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendButtonDisabled: {
      opacity: 0.4,
    },
    sendButtonText: {
      color: colors.white,
      fontSize: 23,
      fontWeight: '700',
    },
    buttonPressed: {
      opacity: 0.7,
    },
    disclaimer: {
      color: colors.textSecondary,
      fontSize: 9,
      textAlign: 'center',
      marginTop: 8,
    },
  });
}
