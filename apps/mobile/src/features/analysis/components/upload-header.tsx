import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { createStyles } from '@/features/analysis/components/upload-header.styles';
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
