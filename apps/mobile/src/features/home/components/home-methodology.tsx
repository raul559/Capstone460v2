import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { createHomeMethodologyStyles } from '@/features/home/components/home-methodology.styles';
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
