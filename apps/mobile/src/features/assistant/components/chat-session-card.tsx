import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { ThemePalette } from '@/constants/theme';
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

function createChatSessionCardStyles(colors: ThemePalette) {
  return StyleSheet.create({
    sessionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.backgroundElement,
      borderRadius: 14,
      padding: 13,
      gap: 11,
    },
    sessionIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: colors.backgroundSelected,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sessionIconText: {
      color: colors.accent,
      fontSize: 21,
    },
    sessionInfo: {
      flex: 1,
      gap: 4,
    },
    sessionTitle: {
      color: colors.text,
      fontWeight: '700',
      fontSize: 13,
    },
    sessionSubtitle: {
      color: colors.textSecondary,
      fontSize: 11,
    },
    sessionMenu: {
      color: colors.textSecondary,
      fontWeight: '700',
    },
  });
}
