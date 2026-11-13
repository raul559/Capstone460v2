import { Pressable, Text, View } from 'react-native';

import { styles } from '@/features/account/account-row.styles';
import { useTheme } from '@/hooks/use-theme';

type AccountRowProps = {
  title: string;
  subtitle: string;
  onPress: () => void;
};

export function AccountRow({ title, subtitle, onPress }: AccountRowProps) {
  const colors = useTheme();

  return (
    <Pressable
      style={[styles.row, { borderBottomColor: colors.border }]}
      onPress={onPress}
    >
      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>
          {subtitle}
        </Text>
      </View>
      <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
    </Pressable>
  );
}
