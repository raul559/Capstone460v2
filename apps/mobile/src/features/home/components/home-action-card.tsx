import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { ThemePalette } from '@/constants/theme';
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

function createHomeActionCardStyles(colors: ThemePalette) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.backgroundElement,
      borderRadius: 12,
      padding: 14,
      marginBottom: 15,
      elevation: 3,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 4,
    },
    outlinedCard: {
      borderWidth: 1,
      borderColor: colors.accent,
    },
    cardText: {
      marginBottom: 14,
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
    primaryButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.accent,
      borderRadius: 100,
      paddingVertical: 16,
      paddingHorizontal: 17,
    },
    buttonPressed: {
      opacity: 0.7,
      transform: [{ scale: 0.99 }],
    },
    buttonText: {
      color: colors.white,
      fontSize: 15,
      fontWeight: 'bold',
    },
    arrow: {
      color: colors.white,
      fontSize: 24,
      lineHeight: 24,
    },
  });
}
