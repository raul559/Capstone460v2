import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { ThemePalette } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function HomeHeader() {
  const styles = createHomeHeaderStyles(useTheme());

  return (
    <View style={styles.header}>
      <View style={styles.brand}>
        <View style={styles.logoIcon}>
          <ThemedText style={styles.logoIconText}>S</ThemedText>
        </View>

        <View>
          <ThemedText style={styles.logo}>SkinAI</ThemedText>
          <ThemedText style={styles.brandSubtitle}>
            CLASSIFIER
          </ThemedText>
        </View>
      </View>

      <ThemedText style={styles.title}>
        Skin Lesion Classifier
      </ThemedText>

      <ThemedText style={styles.description}>
        Capture or upload a clear photo of your skin spot for guided
        classification and risk assessment.
      </ThemedText>
    </View>
  );
}

function createHomeHeaderStyles(colors: ThemePalette) {
  return StyleSheet.create({
    header: {
      marginBottom: 20,
    },
    brand: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    logoIcon: {
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor: colors.accent,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    logoIconText: {
      color: colors.white,
      fontSize: 23,
      fontWeight: 'bold',
    },
    logo: {
      color: colors.textSecondary,
      fontSize: 20,
      fontWeight: 'bold',
    },
    brandSubtitle: {
      color: colors.text,
      fontSize: 9,
      letterSpacing: 1,
    },
    title: {
      color: colors.text,
      fontSize: 32,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    description: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 21,
    },
  });
}
