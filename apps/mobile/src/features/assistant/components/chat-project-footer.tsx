import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { ThemePalette } from '@/constants/theme';
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

function createChatProjectFooterStyles(colors: ThemePalette) {
  return StyleSheet.create({
    projectFooter: {
      alignItems: 'center',
      paddingVertical: 13,
      gap: 5,
    },
    projectTitle: {
      color: colors.text,
      fontWeight: '700',
      fontSize: 12,
    },
    projectText: {
      color: colors.textSecondary,
      fontSize: 10,
      textAlign: 'center',
    },
  });
}
