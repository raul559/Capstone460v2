import { router, useLocalSearchParams } from 'expo-router';

import {
  clearAnalysisResult,
  getAnalysisResult,
} from '@/features/analysis/analysis-result-store';

export function useStoredAnalysis() {
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

  const handleBack = () => {
    if (analysisId) {
      clearAnalysisResult(analysisId);
    }

    router.back();
  };

  return { analysisResult, imageUri, handleBack };
}
