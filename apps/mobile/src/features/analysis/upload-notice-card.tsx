import type { ReactNode } from 'react';
import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { createStyles } from '@/features/analysis/upload-notice-card.styles';
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
