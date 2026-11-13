import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { createStyles } from '@/features/analysis/other-predictions-card.styles';
import {
  formatConfidencePercent,
  predictionLabels,
} from '@/features/analysis/prediction-labels';
import { useTheme } from '@/hooks/use-theme';
import type { SkinPrediction } from '@/types/skin-analysis';

type Props = {
  predictions: SkinPrediction[];
};

export function OtherPredictionsCard({ predictions }: Props) {
  const styles = createStyles(useTheme());

  return (
    <View style={styles.otherCard}>
      <ThemedText style={styles.otherTitle}>
        Other possible findings
      </ThemedText>

      {predictions.map((prediction, index) => {
        const label = prediction.label.toLowerCase();

        return (
          <View
            key={`${prediction.label}-${index}`}
            style={styles.predictionRow}
          >
            <ThemedText style={styles.predictionName}>
              {predictionLabels[label] ?? prediction.label}
            </ThemedText>
            <ThemedText style={styles.predictionConfidence}>
              {formatConfidencePercent(prediction.confidence)}%
            </ThemedText>
          </View>
        );
      })}
    </View>
  );
}
