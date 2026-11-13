import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { createHomeActionCardStyles } from '@/features/home/home-action-card.styles';
import { useTheme } from '@/hooks/use-theme';

type HomeActionCardProps = {
  title: string;
  description: string;
  buttonLabel: string;
  onPress: () => void;
  buttonAccessibilityLabel?: string;
  outlined?: boolean;
};

export function HomeActionCard({
  title,
  description,
  buttonLabel,
  onPress,
  buttonAccessibilityLabel,
  outlined = false,
}: HomeActionCardProps) {
  const styles = createHomeActionCardStyles(useTheme());

  return (
    <View style={[styles.card, outlined && styles.outlinedCard]}>
      <View style={styles.cardText}>
        <ThemedText style={styles.sectionTitle}>{title}</ThemedText>

        <ThemedText style={styles.cardDescription}>{description}</ThemedText>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={buttonAccessibilityLabel}
        onPress={onPress}
        style={({ pressed }) => [
          styles.primaryButton,
          pressed && styles.buttonPressed,
        ]}
      >
        <ThemedText style={styles.buttonText}>{buttonLabel}</ThemedText>

        <ThemedText style={styles.arrow}>›</ThemedText>
      </Pressable>
    </View>
  );
}
