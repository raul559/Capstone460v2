import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { ThemePalette } from '@/constants/theme';
import { formatConfidencePercent, predictionLabels } from '@/features/analysis/utils/prediction-labels';
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

function createStyles(colors: ThemePalette) {
  return StyleSheet.create({
    otherCard: {
      backgroundColor: colors.backgroundElement,
      borderRadius: 14,
      padding: 16,
      marginBottom: 20,
    },
    otherTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    predictionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingVertical: 10,
    },
    predictionName: {
      color: colors.textSecondary,
      fontSize: 12,
      flex: 1,
      paddingRight: 10,
    },
    predictionConfidence: {
      color: colors.text,
      fontSize: 12,
      fontWeight: 'bold',
    },
  });
}
