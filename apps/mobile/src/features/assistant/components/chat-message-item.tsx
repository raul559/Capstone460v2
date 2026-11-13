import { Image, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { ThemePalette } from '@/constants/theme';
import { ChatFeedbackButtons } from '@/features/assistant/components/chat-feedback-buttons';
import type { ChatMessage, Feedback } from '@/features/assistant/utils/chat-messages';
import { useTheme } from '@/hooks/use-theme';

type ChatMessageItemProps = {
  message: ChatMessage;
  onFeedback: (messageId: number, feedback: Feedback) => void;
};

export function ChatMessageItem({ message, onFeedback }: ChatMessageItemProps) {
  const styles = createChatMessageItemStyles(useTheme());
  const isUser = message.sender === 'user';
  const isAssistant = message.sender === 'assistant';

  return (
    <View style={[styles.messageRow, isUser && styles.userMessageRow]}>
      {isAssistant && (
        <View style={styles.smallLogo}>
          <ThemedText style={styles.smallLogoText}>S</ThemedText>
        </View>
      )}

      <View style={[styles.messageGroup, isUser && styles.userMessageGroup]}>
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.assistantBubble,
          ]}
        >
          {message.imageUri && (
            <Image
              source={{ uri: message.imageUri }}
              style={styles.attachedImage}
              resizeMode="cover"
              accessibilityLabel="Uploaded skin image"
            />
          )}

          <ThemedText
            style={[styles.messageText, isUser && styles.userMessageText]}
          >
            {message.text}
          </ThemedText>
        </View>

        {isAssistant && (
          <ChatFeedbackButtons
            selected={message.feedback}
            onSelect={(feedback) => onFeedback(message.id, feedback)}
          />
        )}
      </View>
    </View>
  );
}

function createChatMessageItemStyles(colors: ThemePalette) {
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
