import { Pressable, StyleSheet, Text, View } from 'react-native';

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

const styles = StyleSheet.create({
  row: {
    minHeight: 75,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowText: { flex: 1, paddingRight: 12 },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 5,
  },
  rowSubtitle: { fontSize: 12 },
  chevron: { fontSize: 27, fontWeight: '300' },
});
