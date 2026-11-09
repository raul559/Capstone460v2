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
import type { SkinAnalysisResult } from '@/library/skin-analysis';

export default function ResultsScreen() {
  const params = useLocalSearchParams<{
    imageUri?: string;
    result?: string;
  }>();

  const imageUri = Array.isArray(params.imageUri)
    ? params.imageUri[0]
    : params.imageUri;

  const resultData = Array.isArray(params.result)
    ? params.result[0]
    : params.result;

  let analysisResult: SkinAnalysisResult | null = null;

  try {
    if (resultData) {
      analysisResult = JSON.parse(resultData) as SkinAnalysisResult;
    }
  } catch {
    analysisResult = null;
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ThemedText style={styles.backText}>
              ← Back to Image Analysis
            </ThemedText>
          </Pressable>

          {analysisResult && imageUri ? (
            <SkinAnalysisResults
              result={analysisResult}
              imageUri={imageUri}
            />
          ) : (
            <View style={styles.errorContainer}>
              <ThemedText style={styles.errorTitle}>
                Results unavailable
              </ThemedText>
              <ThemedText>
                We couldn't load your analysis. Please try again.
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
    backgroundColor: '#D0D6E1',
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
    color: '#3E839C',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#EFF1F4',
    padding: 20,
    borderRadius: 16,
    gap: 10,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
});