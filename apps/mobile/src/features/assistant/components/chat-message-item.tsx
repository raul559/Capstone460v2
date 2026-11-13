import { Image, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ChatFeedbackButtons } from '@/features/assistant/components/chat-feedback-buttons';
import { createChatMessageItemStyles } from '@/features/assistant/components/chat-message-item.styles';
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
