
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { SkinAnalysisResult } from '@/library/skin-analysis';

type Props = {
  result: SkinAnalysisResult;
};

const riskLabels: Record<string, string> = {
  high_risk: 'High risk',
  moderate_risk: 'Moderate risk',
  low_risk: 'Low risk',
  clinician_review: 'Clinician review recommended',
};

const predictionLabels: Record<string, string> = {
  akiec: 'Actinic keratoses / related lesions',
  bcc: 'Basal cell carcinoma',
  bkl: 'Benign keratosis-like lesion',
  df: 'Dermatofibroma',
  mel: 'Melanoma',
  nv: 'Melanocytic nevus',
  vasc: 'Vascular lesion',
};

export function SkinAnalysisResults({ result }: Props) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.heading}>
        Analysis Results
      </ThemedText>

      <ThemedText style={styles.riskLabel}>
        Risk classification
      </ThemedText>

      <ThemedText style={styles.riskValue}>
        {riskLabels[result.risk_score] ?? result.risk_score}
      </ThemedText>

      <ThemedText style={styles.note}>
        This is an AI-generated estimate, not a medical diagnosis.
        A clinician should assess concerning or changing lesions.
      </ThemedText>

      <ThemedText style={styles.subheading}>
        Top predictions
      </ThemedText>

      {result.top_predictions.map((prediction, index) => (
        <View
          key={`${prediction.label}-${index}`}
          style={styles.predictionRow}
        >
          <View style={styles.predictionText}>
            <ThemedText style={styles.predictionName}>
              {predictionLabels[prediction.label.toLowerCase()] ??
                prediction.label}
            </ThemedText>
          </View>

          <ThemedText style={styles.confidence}>
            {(prediction.confidence * 100).toFixed(1)}%
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#B8CDD6',
    borderRadius: 14,
    padding: 16,
    marginTop: 18,
    backgroundColor: '#F3F7F8',
  },
  heading: {
    fontSize: 21,
    fontWeight: 'bold',
    marginBottom: 14,
  },
  riskLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  riskValue: {
    fontSize: 19,
    fontWeight: 'bold',
    marginTop: 4,
  },
  note: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
    marginBottom: 16,
    opacity: 0.8,
  },
  subheading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  predictionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: '#D6E1E5',
  },
  predictionText: {
    flex: 1,
    paddingRight: 12,
  },
  predictionName: {
    fontSize: 14,
  },
  confidence: {
    fontSize: 14,
    fontWeight: '700',
  },
});
