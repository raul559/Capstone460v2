import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { ThemePalette } from '@/constants/theme';
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

function createStyles(colors: ThemePalette) {
  return StyleSheet.create({
    noticeCard: {
      flexDirection: 'row',
      backgroundColor: colors.backgroundElement,
      borderColor: colors.danger,
      borderWidth: 1,
      borderRadius: 12,
      padding: 14,
      marginBottom: 20,
      elevation: 3,
    },
    noticeIcon: {
      color: colors.danger,
      fontSize: 17,
      fontWeight: 'bold',
      marginRight: 12,
    },
    noticeContent: {
      flex: 1,
    },
    noticeTitle: {
      color: colors.text,
      fontSize: 13,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    noticeText: {
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 18,
    },
  });
}
