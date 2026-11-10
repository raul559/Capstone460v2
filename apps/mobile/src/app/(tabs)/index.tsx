
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export default function HomeScreen() {
  const colors = useTheme();

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 28,
    },
    header: {
      marginBottom: 20,
    },
    brand: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    logoIcon: {
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor: colors.accent,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    logoIconText: {
      color: colors.white,
      fontSize: 23,
      fontWeight: 'bold',
    },
    logo: {
      color: colors.textSecondary,
      fontSize: 20,
      fontWeight: 'bold',
    },
    brandSubtitle: {
      color: colors.text,
      fontSize: 9,
      letterSpacing: 1,
    },
    title: {
      color: colors.text,
      fontSize: 32,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    description: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 21,
    },
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
    methodology: {
      marginBottom: 18,
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
    disclaimer: {
      flexDirection: 'row',
      backgroundColor: colors.backgroundElement,
      borderRadius: 12,
      padding: 14,
      elevation: 2,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    disclaimerIcon: {
      color: colors.accent,
      fontSize: 20,
      marginRight: 10,
    },
    disclaimerContent: {
      flex: 1,
    },
    disclaimerTitle: {
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    disclaimerText: {
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 18,
    },
    footer: {
      color: colors.textSecondary,
      fontSize: 11,
      textAlign: 'center',
      marginTop: 18,
    },
  });

  const showComingSoon = (feature: string) => {
    Alert.alert(
      `${feature} coming soon`,
      'This feature will be connected when its screen is implemented.'
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.brand}>
            <View style={styles.logoIcon}>
              <ThemedText style={styles.logoIconText}>S</ThemedText>
            </View>

            <View>
              <ThemedText style={styles.logo}>SkinAI</ThemedText>
              <ThemedText style={styles.brandSubtitle}>
                CLASSIFIER
              </ThemedText>
            </View>
          </View>

          <ThemedText style={styles.title}>
            Skin Lesion Classifier
          </ThemedText>

          <ThemedText style={styles.description}>
            Capture or upload a clear photo of your skin spot for guided
            classification and risk assessment.
          </ThemedText>
        </View>

        <View style={styles.card}>
          <View style={styles.cardText}>
            <ThemedText style={styles.sectionTitle}>
              Part I: Image Analysis
            </ThemedText>

            <ThemedText style={styles.cardDescription}>
              Upload or capture a spot for visual AI classification.
              We recommend starting with an image, followed by our
              expert system questionnaire.
            </ThemedText>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Start an image analysis"
            onPress={() => router.push('/upload')}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <ThemedText style={styles.buttonText}>
              Start an image analysis
            </ThemedText>

            <ThemedText style={styles.arrow}>›</ThemedText>
          </Pressable>
        </View>

        <View style={[styles.card, styles.outlinedCard]}>
          <View style={styles.cardText}>
            <ThemedText style={styles.sectionTitle}>
              Part II: Questionnaire
            </ThemedText>

            <ThemedText style={styles.cardDescription}>
              Don&apos;t have an image? Try our questionnaire-only option.
              Evaluate warning signs, changes, and family risk factors.
            </ThemedText>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => showComingSoon('Questionnaire')}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <ThemedText style={styles.buttonText}>
              Begin with a questionnaire
            </ThemedText>

            <ThemedText style={styles.arrow}>›</ThemedText>
          </Pressable>
        </View>

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

        <View style={styles.disclaimer}>
          <ThemedText style={styles.disclaimerIcon}>ⓘ</ThemedText>

          <View style={styles.disclaimerContent}>
            <ThemedText style={styles.disclaimerTitle}>
              Learning, not diagnosis
            </ThemedText>

            <ThemedText style={styles.disclaimerText}>
              Not a medical diagnosis tool. Do not use results for
              diagnosis or treatment decisions.
            </ThemedText>
          </View>
        </View>

        <ThemedText style={styles.footer}>
          SkinAI Classifier · Capstone
        </ThemedText>
      </ScrollView>
    </SafeAreaView>
  );
}
