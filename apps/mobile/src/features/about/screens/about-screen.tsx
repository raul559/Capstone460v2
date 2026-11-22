import { router } from 'expo-router';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const conditions = [
  { code: 'AKIEC', name: 'Actinic keratoses and related lesions' },
  { code: 'BCC', name: 'Basal cell carcinoma' },
  { code: 'BKL', name: 'Benign keratosis-like lesions' },
  { code: 'DF', name: 'Dermatofibroma' },
  { code: 'MEL', name: 'Melanoma' },
  { code: 'NV', name: 'Melanocytic nevi (moles)' },
  { code: 'VASC', name: 'Vascular lesions' },
];

export default function AboutScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ThemedText themeColor="accent">{'\u2190'} Back</ThemedText>
        </Pressable>

        <ThemedText type="subtitle" style={styles.heading}>
          About SkinAI
        </ThemedText>

        <ThemedText style={styles.intro}>
          SkinAI is an educational skin-analysis application designed to
          provide preliminary information about skin lesions through
          artificial intelligence and an expert-system approach.
        </ThemedText>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="subtitle" style={styles.cardTitle}>
            Part I: Image Analysis
          </ThemedText>
          <ThemedText>
            The first part uses an AI image-classification model to analyze
            an uploaded skin image and identify possible skin-lesion
            categories. It provides prediction results and supporting
            information to help users understand the analysis.
          </ThemedText>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="subtitle" style={styles.cardTitle}>
            Part II: Expert System
          </ThemedText>
          <ThemedText>
            The second part is designed to use follow-up questions and
            expert-system logic to provide additional context about a
            skin concern. This feature is still under development.
          </ThemedText>
        </ThemedView>

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Supported Classifications
        </ThemedText>

        <ThemedText style={styles.description}>
          The image-analysis model currently recognizes seven categories:
        </ThemedText>

        {conditions.map((condition) => (
          <ThemedView
            key={condition.code}
            type="backgroundElement"
            style={styles.condition}
          >
            <ThemedText type="smallBold" themeColor="accent">
              {condition.code}
            </ThemedText>
            <ThemedText style={styles.conditionName}>
              {condition.name}
            </ThemedText>
          </ThemedView>
        ))}

        <ThemedView type="backgroundElement" style={styles.disclaimer}>
          <ThemedText type="smallBold">Important Disclaimer</ThemedText>
          <ThemedText type="small">
            SkinAI is an educational and screening-support tool. It does not
            provide a medical diagnosis and cannot replace advice,
            examination, or treatment from a qualified healthcare
            professional. Always consult a healthcare professional about
            concerning skin changes.
          </ThemedText>
        </ThemedView>

        <Pressable
          onPress={() => router.push('/upload')}
          style={styles.primaryButton}
        >
          <ThemedText style={styles.buttonText}>
            Start an Image Analysis
          </ThemedText>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    container: {
      padding: Spacing.four,
      paddingBottom: Spacing.six,
      gap: Spacing.three,
    },
    backButton: {
      alignSelf: 'flex-start',
      paddingVertical: Spacing.two,
    },
    heading: {
      fontSize: 34,
      lineHeight: 42,
      marginTop: Spacing.two,
    },
    intro: {
      marginBottom: Spacing.two,
    },
    card: {
      padding: Spacing.four,
      borderRadius: 16,
      gap: Spacing.two,
    },
    cardTitle: {
      fontSize: 22,
      lineHeight: 30,
    },
    sectionTitle: {
      fontSize: 24,
      lineHeight: 32,
      marginTop: Spacing.two,
    },
    description: {
      color: theme.textSecondary,
    },
    condition: {
      padding: Spacing.three,
      borderRadius: 12,
      gap: Spacing.one,
    },
    conditionName: {
      fontSize: 15,
    },
    disclaimer: {
      padding: Spacing.three,
      borderRadius: 12,
      gap: Spacing.two,
      borderWidth: 1,
      borderColor: theme.border,
    },
    primaryButton: {
      backgroundColor: theme.accent,
      padding: Spacing.three,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: Spacing.two,
    },
    buttonText: {
      color: '#FFFFFF',
      fontWeight: '700',
    },
  });
}
