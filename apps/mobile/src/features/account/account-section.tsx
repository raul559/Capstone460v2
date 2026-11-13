import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { styles } from '@/features/account/account-section.styles';
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
