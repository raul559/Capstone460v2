import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { createHomeHeaderStyles } from '@/features/home/home-header.styles';
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
