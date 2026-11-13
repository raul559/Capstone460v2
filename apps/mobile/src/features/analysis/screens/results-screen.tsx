import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { ResultsBackButton } from '@/features/analysis/components/results/results-back-button';
import { ResultsUnavailable } from '@/features/analysis/components/results/results-unavailable';
import { SkinAnalysisResults } from '@/features/analysis/components/results/skin-analysis-results';
import { useStoredAnalysis } from '@/features/analysis/hooks/use-stored-analysis';
import { useTheme } from '@/hooks/use-theme';

export default function ResultsScreen() {
  const colors = useTheme();
  const { analysisResult, imageUri, handleBack } = useStoredAnalysis();

  return (
    <ThemedView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <ResultsBackButton onPress={handleBack} />

          {analysisResult && imageUri ? (
            <SkinAnalysisResults
              result={analysisResult}
              imageUri={imageUri}
            />
          ) : (
            <ResultsUnavailable />
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
});
