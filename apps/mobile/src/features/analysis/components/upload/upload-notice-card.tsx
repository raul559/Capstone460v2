import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { ThemePalette } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  icon: string;
  title: string;
  children: ReactNode;
};

export function UploadNoticeCard({ icon, title, children }: Props) {
  const styles = createStyles(useTheme());

  return (
    <View style={styles.noticeCard}>
      <ThemedText style={styles.noticeIcon}>{icon}</ThemedText>

      <View style={styles.noticeContent}>
        <ThemedText style={styles.noticeTitle}>
          {title}
        </ThemedText>

        <ThemedText style={styles.noticeText}>
          {children}
        </ThemedText>
      </View>
    </View>
  );
}

function createStyles(colors: ThemePalette) {
  return StyleSheet.create({
    noticeCard: {
      flexDirection: 'row',
      backgroundColor: colors.backgroundElement,
      borderRadius: 12,
      padding: 14,
      marginBottom: 17,
      elevation: 3,
    },
    noticeIcon: {
      color: colors.accent,
      fontSize: 19,
      marginRight: 10,
    },
    noticeContent: {
      flex: 1,
    },
    noticeTitle: {
      color: colors.text,
      fontSize: 13,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    noticeText: {
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 18,
    },
  });
}
