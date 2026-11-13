import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { createStyles } from '@/features/analysis/components/result-actions.styles';
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
