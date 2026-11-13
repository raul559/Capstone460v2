import { StyleSheet, View } from 'react-native';

import { AnalyzedImageCard } from '@/features/analysis/analyzed-image-card';
import { ClinicalNoticeCard } from '@/features/analysis/clinical-notice-card';
import { OtherPredictionsCard } from '@/features/analysis/other-predictions-card';
import { PrimaryFindingCard } from '@/features/analysis/primary-finding-card';
import { ResultActions } from '@/features/analysis/result-actions';
import { ResultHeader } from '@/features/analysis/result-header';
import type { SkinAnalysisResult } from '@/types/skin-analysis';

type Props = {
  result: SkinAnalysisResult;
  imageUri: string;
};

export function SkinAnalysisResults({ result, imageUri }: Props) {
  const [primary, ...otherPredictions] = result.top_predictions;

  return (
    <View style={styles.container}>
      <ResultHeader />
      <AnalyzedImageCard imageUri={imageUri} />

      {primary && (
        <PrimaryFindingCard prediction={primary} riskScore={result.risk_score} />
      )}

      <ClinicalNoticeCard />

      {otherPredictions.length > 0 && (
        <OtherPredictionsCard predictions={otherPredictions} />
      )}

      <ResultActions imageUri={imageUri} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
});
