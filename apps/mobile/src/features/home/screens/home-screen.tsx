import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { HomeActionCard } from '@/features/home/components/home-action-card';
import { HomeDisclaimer } from '@/features/home/components/home-disclaimer';
import { HomeHeader } from '@/features/home/components/home-header';
import { HomeMethodology } from '@/features/home/components/home-methodology';
import { createHomeScreenStyles } from '@/features/home/screens/home-screen.styles';
import { showComingSoon } from '@/features/home/utils/show-coming-soon';
import { useTheme } from '@/hooks/use-theme';

export default function HomeScreen() {
  const styles = createHomeScreenStyles(useTheme());

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader />

        <HomeActionCard
          title="Part I: Image Analysis"
          description="Upload or capture a spot for visual AI classification. We recommend starting with an image, followed by our expert system questionnaire."
          buttonLabel="Start an image analysis"
          buttonAccessibilityLabel="Start an image analysis"
          onPress={() => router.push('/upload')}
        />

        <HomeActionCard
          outlined
          title="Part II: Questionnaire"
          description="Don't have an image? Try our questionnaire-only option. Evaluate warning signs, changes, and family risk factors."
          buttonLabel="Begin with a questionnaire"
          onPress={() => showComingSoon('Questionnaire')}
        />

        <HomeMethodology />

        <HomeDisclaimer />

        <ThemedText style={styles.footer}>
          SkinAI Classifier · Capstone
        </ThemedText>
      </ScrollView>
    </SafeAreaView>
  );
}
