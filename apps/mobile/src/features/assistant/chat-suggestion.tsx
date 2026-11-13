import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { createChatSuggestionStyles } from '@/features/assistant/chat-suggestion.styles';
import { useTheme } from '@/hooks/use-theme';

const SUGGESTED_QUESTION = 'What changes should I look out for?';

type ChatSuggestionProps = {
  onSelect: (question: string) => void;
};

export function ChatSuggestion({ onSelect }: ChatSuggestionProps) {
  const styles = createChatSuggestionStyles(useTheme());

  return (
    <View style={styles.suggestionSection}>
      <ThemedText style={styles.suggestionLabel}>
        SUGGESTED QUESTION
      </ThemedText>

      <Pressable
        accessibilityRole="button"
        onPress={() => onSelect(SUGGESTED_QUESTION)}
        style={({ pressed }) => [
          styles.suggestionChip,
          pressed && styles.buttonPressed,
        ]}
      >
        <ThemedText style={styles.suggestionText}>
          {SUGGESTED_QUESTION}
        </ThemedText>
        <ThemedText style={styles.suggestionArrow}>›</ThemedText>
      </Pressable>
    </View>
  );
}
