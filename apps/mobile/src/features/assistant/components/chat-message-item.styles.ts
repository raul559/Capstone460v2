import { StyleSheet } from 'react-native';

import type { ThemePalette } from '@/constants/theme';

export function createChatMessageItemStyles(colors: ThemePalette) {
  return StyleSheet.create({
    messageRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 8,
    },
    userMessageRow: {
      justifyContent: 'flex-end',
    },
    smallLogo: {
      width: 27,
      height: 27,
      borderRadius: 14,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    smallLogoText: {
      color: colors.white,
      fontSize: 14,
      fontWeight: '700',
    },
    messageGroup: {
      maxWidth: '86%',
      gap: 7,
    },
    userMessageGroup: {
      alignItems: 'flex-end',
    },
    messageBubble: {
      padding: 13,
      borderRadius: 15,
      gap: 9,
    },
    assistantBubble: {
      backgroundColor: colors.backgroundElement,
      borderBottomLeftRadius: 4,
    },
    userBubble: {
      backgroundColor: colors.accent,
      borderBottomRightRadius: 4,
    },
    attachedImage: {
      width: 210,
      height: 165,
      borderRadius: 10,
      backgroundColor: colors.backgroundSelected,
    },
    messageText: {
      color: colors.text,
      fontSize: 13,
      lineHeight: 20,
    },
    userMessageText: {
      color: colors.white,
    },
  });
}
