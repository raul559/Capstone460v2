import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { createStyles } from '@/features/analysis/components/result-header.styles';
import { useTheme } from '@/hooks/use-theme';

export function ResultHeader() {
  const styles = createStyles(useTheme());

  return (
    <>
      <View style={styles.header}>
        <View style={styles.logo}>
          <ThemedText style={styles.logoText}>S</ThemedText>
        </View>
        <ThemedText style={styles.headerLabel}>RESULT OVERVIEW</ThemedText>
        <View style={styles.headerIcon}>
          <ThemedText style={styles.sparkle}>✦</ThemedText>
        </View>
      </View>

      <ThemedText style={styles.pageTitle}>Your analysis</ThemedText>
    </>
  );
}
