import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccountAppearanceOptions } from '@/features/account/account-appearance-options';
import { AccountFooter } from '@/features/account/account-footer';
import { AccountHeader } from '@/features/account/account-header';
import { AccountNotificationRow } from '@/features/account/account-notification-row';
import { AccountProfileCard } from '@/features/account/account-profile-card';
import { AccountRow } from '@/features/account/account-row';
import { styles } from '@/features/account/account-screen.styles';
import { AccountSection } from '@/features/account/account-section';
import { AccountSignOutCard } from '@/features/account/account-sign-out-card';
import { showUnavailable } from '@/features/account/show-unavailable';
import { useTheme } from '@/hooks/use-theme';

export default function AccountScreen() {
  const colors = useTheme();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <ScrollView
        style={[styles.screen, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AccountHeader />

        <AccountProfileCard />

        <AccountSection title="ACCOUNT SETTINGS">
          <AccountRow
            title="Personal details"
            subtitle="Name, email and profile"
            onPress={() => showUnavailable('Personal details')}
          />
          <AccountRow
            title="Password & security"
            subtitle="Manage your account security"
            onPress={() => showUnavailable('Password & security')}
          />
          <AccountNotificationRow />
        </AccountSection>

        <AccountSection title="APPEARANCE">
          <AccountAppearanceOptions />
        </AccountSection>

        <AccountSection title="DATA & SESSIONS">
          <AccountRow
            title="History & images"
            subtitle="Review or delete saved sessions"
            onPress={() => showUnavailable('History & images')}
          />
          <AccountRow
            title="Data use & privacy"
            subtitle="How images and messages are processed"
            onPress={() => showUnavailable('Data use & privacy')}
          />
          <AccountRow
            title="About SkinAI"
            subtitle="Learn more about how SkinAI works"
            onPress={() => showUnavailable('About SkinAI')}
          />
        </AccountSection>

        <AccountSignOutCard />

        <AccountFooter />
      </ScrollView>
    </SafeAreaView>
  );
}
