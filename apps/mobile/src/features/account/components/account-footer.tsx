import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export function AccountFooter() {
  const colors = useTheme();

  return (
    <View style={styles.footer}>
      <Text style={[styles.footerTitle, { color: colors.textSecondary }]}>
        SkinAI Classifier · Capstone
      </Text>
      <Text style={[styles.footerText, { color: colors.textSecondary }]}>
        Purdue University Fort Wayne
      </Text>
      <Text
        style={[
          styles.footerDisclaimer,
          { color: colors.textSecondary },
        ]}
      >
        Educational purposes only · Not for medical diagnosis
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: { alignItems: 'center', paddingTop: 8 },
  footerTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 5,
  },
  footerText: { fontSize: 11, marginBottom: 7 },
  footerDisclaimer: { fontSize: 10, textAlign: 'center' },
});
