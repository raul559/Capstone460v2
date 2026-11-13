import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { ThemePalette } from '@/constants/theme';
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

function createChatSuggestionStyles(colors: ThemePalette) {
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
