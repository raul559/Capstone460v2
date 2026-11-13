import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import {
  DEFAULT_PREDICTION_DESCRIPTION,
  formatConfidencePercent,
  predictionDescriptions,
  predictionLabels,
  riskLabels,
} from '@/features/analysis/utils/prediction-labels';
import { createStyles } from '@/features/analysis/components/primary-finding-card.styles';
import { useTheme } from '@/hooks/use-theme';
import type { SkinPrediction } from '@/types/skin-analysis';

type Props = {
  prediction: SkinPrediction;
  riskScore: string;
};

export function PrimaryFindingCard({ prediction, riskScore }: Props) {
  const styles = createStyles(useTheme());

  const code = prediction.label.toLowerCase();
  const risk = riskLabels[riskScore] ?? riskScore;

  return (
    <View style={styles.findingCard}>
      <View style={styles.findingHeader}>
        <ThemedText style={styles.sectionLabel}>
          PRIMARY FINDING
        </ThemedText>
        <View style={styles.codeBadge}>
          <ThemedText style={styles.codeText}>
            {code.toUpperCase()}
          </ThemedText>
        </View>
      </View>

      <ThemedText style={styles.findingTitle}>
        {predictionLabels[code] ?? prediction.label}
      </ThemedText>

      <ThemedText style={styles.description}>
        {predictionDescriptions[code] ?? DEFAULT_PREDICTION_DESCRIPTION}
      </ThemedText>

      <View style={styles.confidenceRow}>
        <View style={styles.confidenceBadge}>
          <ThemedText style={styles.confidenceText}>
            Confidence: {formatConfidencePercent(prediction.confidence)}%
          </ThemedText>
        </View>
      </View>

      <View style={styles.riskBadge}>
        <ThemedText style={styles.riskText}>
          {risk}
        </ThemedText>
      </View>

      <ThemedText style={styles.learnMore}>
        Preliminary AI finding · Not a diagnosis
      </ThemedText>
    </View>
  );
}
