import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { createStyles } from '@/features/analysis/components/clinical-notice-card.styles';
import { useTheme } from '@/hooks/use-theme';

export function ClinicalNoticeCard() {
  const styles = createStyles(useTheme());

  return (
    <View style={styles.noticeCard}>
      <ThemedText style={styles.noticeIcon}>!</ThemedText>
      <View style={styles.noticeContent}>
        <ThemedText style={styles.noticeTitle}>
          Clinical Triage Notice
        </ThemedText>
        <ThemedText style={styles.noticeText}>
          Confidence scores are not clinical recommendations. This tool
          cannot rule out malignancy or replace a biopsy. If a spot is new,
          changing, bleeding, or concerning, contact a qualified healthcare
          professional.
        </ThemedText>
      </View>
    </View>
  );
}
