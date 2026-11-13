import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { ResultsBackButton } from '@/features/analysis/components/results-back-button';
import { styles } from '@/features/analysis/screens/results-screen.styles';
import { ResultsUnavailable } from '@/features/analysis/components/results-unavailable';
import { SkinAnalysisResults } from '@/features/analysis/components/skin-analysis-results';
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
