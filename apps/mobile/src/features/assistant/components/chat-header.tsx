import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import type { ThemePalette } from '@/constants/theme';
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

function createChatHeaderStyles(colors: ThemePalette) {
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 13,
      backgroundColor: colors.backgroundElement,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 11,
    },
    backButton: {
      width: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
    backText: {
      color: colors.textSecondary,
      fontSize: 34,
    },
    logo: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoText: {
      color: colors.white,
      fontSize: 22,
      fontWeight: '700',
    },
    headerInfo: {
      flex: 1,
      gap: 3,
    },
    title: {
      color: colors.text,
      fontSize: 17,
      fontWeight: '700',
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: 11,
    },
    profileCircle: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.backgroundSelected,
      alignItems: 'center',
      justifyContent: 'center',
    },
    profileText: {
      color: colors.text,
      fontWeight: '700',
    },
  });
}
