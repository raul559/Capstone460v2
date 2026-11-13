import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { createChatProjectFooterStyles } from '@/features/assistant/components/chat-project-footer.styles';
import { useTheme } from '@/hooks/use-theme';

export function ChatProjectFooter() {
  const styles = createChatProjectFooterStyles(useTheme());

  return (
    <View style={styles.projectFooter}>
      <ThemedText style={styles.projectTitle}>
        SkinAI Classifier
      </ThemedText>
      <ThemedText style={styles.projectText}>
        Capstone Project · Purdue University Fort Wayne
      </ThemedText>
      <ThemedText style={styles.projectText}>
        Educational purposes only
      </ThemedText>
    </View>
  );
}
