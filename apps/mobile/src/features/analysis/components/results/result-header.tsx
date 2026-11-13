import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { ThemePalette } from '@/constants/theme';
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

function createStyles(colors: ThemePalette) {
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 18,
    },
    logo: {
      width: 36,
      height: 36,
      borderRadius: 11,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoText: {
      color: colors.white,
      fontSize: 21,
      fontWeight: 'bold',
    },
    headerLabel: {
      color: colors.text,
      fontSize: 11,
      fontWeight: 'bold',
      letterSpacing: 1,
    },
    headerIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.backgroundElement,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sparkle: {
      fontSize: 20,
      color: colors.accent,
    },
    pageTitle: {
      color: colors.text,
      fontSize: 27,
      fontWeight: 'bold',
      marginBottom: 20,
    },
  });
}
