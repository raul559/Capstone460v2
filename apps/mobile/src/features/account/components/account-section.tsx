import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type AccountSectionProps = {
  title: string;
  children: ReactNode;
};

export function AccountSection({ title, children }: AccountSectionProps) {
  const colors = useTheme();

  return (
    <>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        {title}
      </Text>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.backgroundElement },
        ]}
      >
        {children}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 10,
    marginLeft: 3,
  },
  card: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 26,
  },
});
