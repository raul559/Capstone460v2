import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  background: '#D0D6E1',
  card: '#EFF1F4',
  text: '#1F242C',
  secondary: '#3B4351',
  accent: '#3E839C',
  border: '#C2CAD5',
  white: '#FFFFFF',
  danger: '#B84A4A',
};

type AccountRowProps = {
  title: string;
  subtitle: string;
  onPress: () => void;
};

function AccountRow({ title, subtitle, onPress }: AccountRowProps) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

export default function AccountScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const showUnavailable = (feature: string) => {
    Alert.alert(
      feature,
      'This feature is part of the account screen design but is not connected to an account service yet.',
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.headerLabel}>SKINAI</Text>
            <Text style={styles.headerTitle}>Your account</Text>
          </View>
          <Pressable
            style={styles.settingsButton}
            onPress={() => showUnavailable('Settings')}
            accessibilityLabel="Settings"
          >
            <Text style={styles.settingsIcon}>⚙</Text>
          </Pressable>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>U</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Your profile</Text>
            <Text style={styles.profileEmail}>
              Account information not connected
            </Text>
            <Text style={styles.accountType}>PATIENT USER ACCOUNT</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>ACCOUNT SETTINGS</Text>
        <View style={styles.card}>
          <AccountRow
            title="Personal details"
            subtitle="Name, email and profile"
            onPress={() => showUnavailable('Personal details')}
          />
          <View style={styles.separator} />
          <AccountRow
            title="Password & security"
            subtitle="Manage your account security"
            onPress={() => showUnavailable('Password & security')}
          />
          <View style={styles.separator} />
          <View style={styles.notificationRow}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Notifications</Text>
              <Text style={styles.rowSubtitle}>Product updates</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: COLORS.border, true: COLORS.accent }}
              thumbColor={COLORS.white}
              accessibilityLabel="Product update notifications"
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>DATA & SESSIONS</Text>
        <View style={styles.card}>
          <AccountRow
            title="History & images"
            subtitle="Review or delete saved sessions"
            onPress={() => showUnavailable('History & images')}
          />
          <View style={styles.separator} />
          <AccountRow
            title="Data use & privacy"
            subtitle="How images and messages are processed"
            onPress={() => showUnavailable('Data use & privacy')}
          />
          <View style={styles.separator} />
          <AccountRow
            title="About SkinAI"
            subtitle="Learn more about how SkinAI works"
            onPress={() => showUnavailable('About SkinAI')}
          />
        </View>

        <View style={styles.signOutCard}>
          <Text style={styles.signOutTitle}>Sign out</Text>
          <Text style={styles.signOutSubtitle}>
            Account sign-out is not connected yet.
          </Text>
          <Pressable
            style={styles.signOutButton}
            onPress={() => showUnavailable('Sign out')}
          >
            <Text style={styles.signOutButtonText}>Sign out</Text>
          </Pressable>
          <Pressable
            onPress={() => showUnavailable('Delete account')}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteText}>Delete account</Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerTitle}>SkinAI Classifier · Capstone</Text>
          <Text style={styles.footerText}>
            Purdue University Fort Wayne
          </Text>
          <Text style={styles.footerDisclaimer}>
            Educational purposes only · Not for medical diagnosis
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
    maxWidth: 650,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerLabel: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 5,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '700',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: 22,
    color: COLORS.secondary,
  },
  profileCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 23,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 3,
  },
  profileEmail: {
    color: COLORS.secondary,
    fontSize: 12,
    marginBottom: 8,
  },
  accountType: {
    color: COLORS.accent,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  sectionTitle: {
    color: COLORS.secondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 10,
    marginLeft: 3,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 26,
  },
  row: {
    minHeight: 75,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
  },
  rowText: {
    flex: 1,
    paddingRight: 12,
  },
  rowTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 5,
  },
  rowSubtitle: {
    color: COLORS.secondary,
    fontSize: 12,
  },
  chevron: {
    color: COLORS.secondary,
    fontSize: 27,
    fontWeight: '300',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
  },
  notificationRow: {
    minHeight: 75,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  signOutCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 28,
  },
  signOutTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 5,
  },
  signOutSubtitle: {
    color: COLORS.secondary,
    fontSize: 12,
    marginBottom: 16,
  },
  signOutButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  deleteButton: {
    alignItems: 'center',
    paddingTop: 16,
  },
  deleteText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 8,
  },
  footerTitle: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 5,
  },
  footerText: {
    color: COLORS.secondary,
    fontSize: 11,
    marginBottom: 7,
  },
  footerDisclaimer: {
    color: COLORS.secondary,
    fontSize: 10,
    textAlign: 'center',
  },
});
