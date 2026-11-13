import { Text, View } from 'react-native';

import { styles } from '@/features/account/account-footer.styles';
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
