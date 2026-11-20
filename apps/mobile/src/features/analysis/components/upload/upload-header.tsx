import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { ThemePalette } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function UploadHeader() {
  const styles = createStyles(useTheme());

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={() => router.back()}
        style={({ pressed }) => [
          styles.backButton,
          pressed && styles.buttonPressed,
        ]}
      >
        <ThemedText style={styles.backText}>
          ‹ Back
        </ThemedText>
      </Pressable>

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.logoBox}>
            <ThemedText style={styles.logoText}>S</ThemedText>
          </View>

          <ThemedText style={styles.headerLabel}>
            IMAGE ANALYSIS
          </ThemedText>

          <View style={styles.headerIcon}>
            <ThemedText style={styles.headerIconText}>✦</ThemedText>
          </View>
        </View>

        <ThemedText style={styles.title}>
          Start with an image
        </ThemedText>

        <ThemedText style={styles.description}>
          Upload your image to explore how SkinAI works.
        </ThemedText>
      </View>
    </>
  );
}

function createStyles(colors: ThemePalette) {
  return StyleSheet.create({
    backButton: {
      alignSelf: 'flex-start',
      paddingVertical: 12,
      paddingHorizontal: 4,
      marginBottom: 12,
    },
    backText: {
      color: colors.accent,
      fontSize: 16,
      fontWeight: '600',
    },
    buttonPressed: {
      opacity: 0.75,
    },
    header: {
      marginBottom: 17,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 19,
    },
    logoBox: {
      width: 36,
      height: 36,
      borderRadius: 11,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoText: {
      color: colors.white,
      fontSize: 21,
      fontWeight: 'bold',
    },
    headerLabel: {
      color: colors.text,
      fontSize: 11,
      fontWeight: 'bold',
      letterSpacing: 1,
    },
    headerIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.backgroundElement,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerIconText: {
      color: colors.accent,
      fontSize: 20,
    },
    title: {
      color: colors.text,
      fontSize: 27,
      fontWeight: 'bold',
    },
    description: {
      color: colors.textSecondary,
      fontSize: 14,
      marginTop: 10,
    },
  });
}
