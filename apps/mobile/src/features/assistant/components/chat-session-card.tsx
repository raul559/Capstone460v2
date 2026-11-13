import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { createChatSessionCardStyles } from '@/features/assistant/components/chat-session-card.styles';
import { useTheme } from '@/hooks/use-theme';

export function ChatSessionCard() {
  const styles = createChatSessionCardStyles(useTheme());

  return (
    <View style={styles.sessionCard}>
      <View style={styles.sessionIcon}>
        <ThemedText style={styles.sessionIconText}>✦</ThemedText>
      </View>

      <View style={styles.sessionInfo}>
        <ThemedText style={styles.sessionTitle}>
          Skin image questions
        </ThemedText>
        <ThemedText style={styles.sessionSubtitle}>
          Current conversation
        </ThemedText>
      </View>

      <ThemedText style={styles.sessionMenu}>•••</ThemedText>
    </View>
  );
}
