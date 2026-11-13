import { Pressable, View } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { createChatHeaderStyles } from '@/features/assistant/chat-header.styles';
import { useTheme } from '@/hooks/use-theme';

type ChatHeaderProps = {
  showBackButton: boolean;
};

export function ChatHeader({ showBackButton }: ChatHeaderProps) {
  const styles = createChatHeaderStyles(useTheme());

  return (
    <View style={styles.header}>
      {showBackButton && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back to results"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ThemedText style={styles.backText}>‹</ThemedText>
        </Pressable>
      )}

      <View style={styles.logo}>
        <ThemedText style={styles.logoText}>S</ThemedText>
      </View>

      <View style={styles.headerInfo}>
        <ThemedText style={styles.title}>SkinAI Chat</ThemedText>
        <ThemedText style={styles.subtitle}>
          Your skin health learning assistant
        </ThemedText>
      </View>

      <View style={styles.profileCircle}>
        <ThemedText style={styles.profileText}>U</ThemedText>
      </View>
    </View>
  );
}
