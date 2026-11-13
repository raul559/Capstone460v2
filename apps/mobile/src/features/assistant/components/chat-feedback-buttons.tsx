import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { ThemePalette } from '@/constants/theme';
import type { Feedback } from '@/features/assistant/utils/chat-messages';
import { useTheme } from '@/hooks/use-theme';

type ChatFeedbackButtonsProps = {
  selected?: Feedback;
  onSelect: (feedback: Feedback) => void;
};

const FEEDBACK_OPTIONS = [
  {
    value: 'up',
    accessibilityLabel: 'Helpful response',
    // eslint-disable-next-line no-restricted-syntax -- TODO: replace emoji with an icon
    symbol: '👍',
  },
  {
    value: 'down',
    accessibilityLabel: 'Unhelpful response',
    // eslint-disable-next-line no-restricted-syntax -- TODO: replace emoji with an icon
    symbol: '👎',
  },
] as const;

export function ChatFeedbackButtons({
  selected,
  onSelect,
}: ChatFeedbackButtonsProps) {
  const styles = createChatFeedbackButtonsStyles(useTheme());

  return (
    <View style={styles.feedbackRow}>
      {FEEDBACK_OPTIONS.map((option) => (
        <Pressable
          key={option.value}
          accessibilityRole="button"
          accessibilityLabel={option.accessibilityLabel}
          accessibilityState={{
            selected: selected === option.value,
          }}
          onPress={() => onSelect(option.value)}
          style={[
            styles.feedbackButton,
            selected === option.value && styles.feedbackSelected,
          ]}
        >
          <ThemedText style={styles.feedbackText}>{option.symbol}</ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

function createChatFeedbackButtonsStyles(colors: ThemePalette) {
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
