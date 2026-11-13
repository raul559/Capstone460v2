import { Pressable, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { createChatInputBarStyles } from '@/features/assistant/chat-input-bar.styles';
import { useTheme } from '@/hooks/use-theme';

type ChatInputBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: (text: string) => void;
};

export function ChatInputBar({ value, onChangeText, onSend }: ChatInputBarProps) {
  const colors = useTheme();
  const styles = createChatInputBarStyles(colors);
  const isEmpty = !value.trim();

  return (
    <View style={styles.inputSection}>
      <View style={styles.inputContainer}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Ask SkinAI a question..."
          placeholderTextColor={colors.textSecondary}
          style={styles.textInput}
          multiline
          maxLength={1000}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send message"
          disabled={isEmpty}
          onPress={() => onSend(value)}
          style={({ pressed }) => [
            styles.sendButton,
            isEmpty && styles.sendButtonDisabled,
            pressed && styles.buttonPressed,
          ]}
        >
          <ThemedText style={styles.sendButtonText}>↑</ThemedText>
        </Pressable>
      </View>

      <ThemedText style={styles.disclaimer}>
        AI can make mistakes. Never rely on it for medical decisions.
      </ThemedText>
    </View>
  );
}
