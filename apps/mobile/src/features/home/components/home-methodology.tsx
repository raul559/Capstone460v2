import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { ThemePalette } from '@/constants/theme';
import { showComingSoon } from '@/features/home/utils/show-coming-soon';
import { useTheme } from '@/hooks/use-theme';

export function HomeMethodology() {
  const styles = createHomeMethodologyStyles(useTheme());

  return (
    <View style={styles.methodology}>
      <ThemedText style={styles.sectionTitle}>
        What is SkinAI?
      </ThemedText>

      <ThemedText style={styles.cardDescription}>
        Our model uses a 2-part system for evaluation. Learn about
        how our classifier works. We recommend both to provide
        optimal information for analysis.
      </ThemedText>

      <Pressable
        accessibilityRole="button"
        onPress={() => showComingSoon('Methodology')}
        style={({ pressed }) => pressed && styles.linkPressed}
      >
        <ThemedText style={styles.methodologyLink}>
          Learn about our 2-part methodology →
        </ThemedText>
      </Pressable>
    </View>
  );
}

function createHomeMethodologyStyles(colors: ThemePalette) {
  return StyleSheet.create({
    methodology: {
      marginBottom: 18,
    },
    sectionTitle: {
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    cardDescription: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 21,
    },
    methodologyLink: {
      color: colors.accent,
      fontSize: 14,
      fontWeight: 'bold',
      marginTop: 10,
    },
    linkPressed: {
      opacity: 0.6,
    },
  });
}
