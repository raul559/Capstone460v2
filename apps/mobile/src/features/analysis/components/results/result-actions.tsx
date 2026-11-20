import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { ThemePalette } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  imageUri: string;
};

export function ResultActions({ imageUri }: Props) {
  const styles = createStyles(useTheme());

  return (
    <View style={styles.questionnaire}>
      <ThemedText style={styles.questionnaireText}>
        Boost confidence: Complete the symptom check to provide additional
        information about your skin.
      </ThemedText>

      <Pressable
        accessibilityRole="button"
        onPress={() => {}}
        style={styles.questionnaireButton}
      >
        <ThemedText style={styles.questionnaireButtonText}>
          Questionnaire coming soon
        </ThemedText>
        <ThemedText style={styles.arrow}>›</ThemedText>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        onPress={() =>
          router.push({
            pathname: '/explore',
            params: {
              imageUri,
              from: 'results',
            },
          })
        }
        style={({ pressed }) => [
          styles.chatButton,
          pressed && styles.buttonPressed,
        ]}
      >
        <ThemedText style={styles.chatButtonText}>
          Chat with SkinAI
        </ThemedText>
        <ThemedText style={styles.chatArrow}>›</ThemedText>
      </Pressable>
    </View>
  );
}

function createStyles(colors: ThemePalette) {
  return StyleSheet.create({
    questionnaire: {
      marginBottom: 20,
    },
    questionnaireText: {
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: 'bold',
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 13,
    },
    questionnaireButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.accent,
      borderRadius: 100,
      paddingVertical: 16,
      paddingHorizontal: 20,
      elevation: 4,
    },
    questionnaireButtonText: {
      color: colors.white,
      fontSize: 14,
      fontWeight: 'bold',
    },
    chatButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.backgroundElement,
      borderColor: colors.accent,
      borderWidth: 1,
      borderRadius: 100,
      paddingVertical: 16,
      paddingHorizontal: 20,
      marginTop: 12,
    },
    chatButtonText: {
      color: colors.accent,
      fontSize: 14,
      fontWeight: 'bold',
    },
    chatArrow: {
      color: colors.accent,
      fontSize: 24,
    },
    buttonPressed: {
      opacity: 0.7,
    },
    arrow: {
      color: colors.white,
      fontSize: 24,
    },
  });
}
