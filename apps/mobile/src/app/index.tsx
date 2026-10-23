import { StyleSheet, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>

        <View style={styles.header}>
          <ThemedText style={styles.logo}>SkinAI</ThemedText>
          <ThemedText style={styles.subtitle}>
            Skin Lesion Analysis
          </ThemedText>
          <ThemedText style={styles.description}>
            AI-powered skin analysis and guidance
          </ThemedText>
        </View>

        <View style={styles.buttons}>

          <Pressable style={styles.button}>
            <ThemedText style={styles.buttonIcon}>📷</ThemedText>
            <ThemedText style={styles.buttonTitle}>
              Take a Photo
            </ThemedText>
            <ThemedText style={styles.buttonDescription}>
              Use your camera to take an image
            </ThemedText>
          </Pressable>

          <Pressable style={styles.button}>
            <ThemedText style={styles.buttonIcon}>🖼️</ThemedText>
            <ThemedText style={styles.buttonTitle}>
              Upload Image
            </ThemedText>
            <ThemedText style={styles.buttonDescription}>
              Choose an image from your phone
            </ThemedText>
          </Pressable>

          <Pressable style={styles.button}>
            <ThemedText style={styles.buttonIcon}>💬</ThemedText>
            <ThemedText style={styles.buttonTitle}>
              Chat with SkinAI
            </ThemedText>
            <ThemedText style={styles.buttonDescription}>
              Ask questions about your results
            </ThemedText>
          </Pressable>

        </View>

        <View style={styles.disclaimer}>
          <ThemedText style={styles.disclaimerText}>
            SkinAI is an educational tool and does not provide a medical diagnosis.
          </ThemedText>
        </View>

      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },

  header: {
    alignItems: 'center',
    paddingTop: 40,
  },

  logo: {
    fontSize: 40,
    fontWeight: 'bold',
  },

  subtitle: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },

  description: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.7,
  },

  buttons: {
    gap: 16,
  },

  button: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#F0F0F3',
  },

  buttonIcon: {
    fontSize: 28,
    marginBottom: 8,
  },

  buttonTitle: {
    fontSize: 19,
    fontWeight: '600',
  },

  buttonDescription: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.7,
  },

  disclaimer: {
    alignItems: 'center',
    paddingBottom: 20,
  },

  disclaimerText: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.6,
  },
});