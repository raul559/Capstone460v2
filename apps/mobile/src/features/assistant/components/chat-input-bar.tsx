import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { ThemePalette } from '@/constants/theme';
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

function createChatInputBarStyles(colors: ThemePalette) {
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
