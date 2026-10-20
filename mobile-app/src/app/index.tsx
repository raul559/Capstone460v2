
import { Alert, StyleSheet, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function HomeScreen() {
  const showComingSoon = (feature: string) => {
    Alert.alert(
      `${feature} coming soon`,
      'This feature is not connected yet. It will be added in a future update.'
    );
  };

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
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Take a photo"
            onPress={() => showComingSoon('Camera')}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
          >
            <ThemedText style={styles.buttonIcon}>
              {'\u{1F4F7}'}
            </ThemedText>
            <View style={styles.buttonText}>
              <ThemedText style={styles.buttonTitle}>
                Take a Photo
              </ThemedText>
              <ThemedText style={styles.buttonDescription}>
                Use your camera to take an image
              </ThemedText>
            </View>
            <ThemedText style={styles.arrow}>{'\u203A'}</ThemedText>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Upload an image"
            onPress={() => showComingSoon('Image upload')}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
          >
            <ThemedText style={styles.buttonIcon}>
              {'\u{1F5BC}\u{FE0F}'}
            </ThemedText>
            <View style={styles.buttonText}>
              <ThemedText style={styles.buttonTitle}>
                Upload Image
              </ThemedText>
              <ThemedText style={styles.buttonDescription}>
                Choose an image from your phone
              </ThemedText>
            </View>
            <ThemedText style={styles.arrow}>{'\u203A'}</ThemedText>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Chat with SkinAI"
            onPress={() => showComingSoon('SkinAI chat')}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
          >
            <ThemedText style={styles.buttonIcon}>
              {'\u{1F4AC}'}
            </ThemedText>
            <View style={styles.buttonText}>
              <ThemedText style={styles.buttonTitle}>
                Chat with SkinAI
              </ThemedText>
              <ThemedText style={styles.buttonDescription}>
                Ask questions about your results
              </ThemedText>
            </View>
            <ThemedText style={styles.arrow}>{'\u203A'}</ThemedText>
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
    paddingHorizontal: 22,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: 36,
  },
  logo: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#167D9A',
  },
  subtitle: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.75,
  },
  buttons: {
    gap: 14,
    marginVertical: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 19,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#B8CDD6',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  buttonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.99 }],
  },
  buttonIcon: {
    fontSize: 29,
    marginRight: 14,
  },
  buttonText: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#183744',
  },
  buttonDescription: {
    fontSize: 13,
    marginTop: 5,
    color: '#526873',
  },
  arrow: {
    fontSize: 27,
    color: '#167D9A',
    marginLeft: 8,
  },
  disclaimer: {
    alignItems: 'center',
    paddingBottom: 18,
  },
  disclaimerText: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.65,
  },
});
