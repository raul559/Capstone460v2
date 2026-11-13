/* eslint-disable no-nested-ternary -- TODO: replace nested ternaries. */

import { useLocalSearchParams, router } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SkinAnalysisResults } from '@/components/skin-analysis-results';
import { useTheme } from '@/hooks/use-theme';
import {
  clearAnalysisResult,
  getAnalysisResult,
} from '@/library/analysis-result-store';

export default function ResultsScreen() {
  const colors = useTheme();
  const params = useLocalSearchParams<{ analysisId?: string }>();

  const analysisId =
    typeof params.analysisId === 'string'
      ? params.analysisId
      : null;

  const storedAnalysis = analysisId
    ? getAnalysisResult(analysisId)
    : null;

  const analysisResult = storedAnalysis?.result ?? null;
  const imageUri = storedAnalysis?.imageUri ?? null;
  const hasLoaded = true;

  const handleBack = () => {
    if (analysisId) {
      clearAnalysisResult(analysisId);
    }

    router.back();
  };

  return (
    <ThemedView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            style={styles.backButton}
            onPress={handleBack}
          >
            <ThemedText
              style={[styles.backText, { color: colors.accent }]}
            >
              ← Back to Image Analysis
            </ThemedText>
          </Pressable>

          {!hasLoaded ? (
            <View
              style={[
                styles.errorContainer,
                { backgroundColor: colors.backgroundElement },
              ]}
            >
              <ThemedText
                style={[styles.errorTitle, { color: colors.text }]}
              >
                Loading results...
              </ThemedText>
            </View>
          ) : analysisResult && imageUri ? (
            <SkinAnalysisResults
              result={analysisResult}
              imageUri={imageUri}
            />
          ) : (
            <View
              style={[
                styles.errorContainer,
                { backgroundColor: colors.backgroundElement },
              ]}
            >
              <ThemedText
                style={[styles.errorTitle, { color: colors.text }]}
              >
                Results unavailable
              </ThemedText>
              <ThemedText
                style={[
                  styles.errorMessage,
                  { color: colors.textSecondary },
                ]}
              >
                We couldn&apos;t load your analysis. Please try again.
              </ThemedText>
            </View>
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
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    padding: 20,
    borderRadius: 16,
    gap: 10,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  errorMessage: {
    fontSize: 14,
  },
});
