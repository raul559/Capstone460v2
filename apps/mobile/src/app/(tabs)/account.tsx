/* eslint-disable max-lines, react/no-multi-comp, no-restricted-syntax -- TODO: split into smaller files; move each component to its own file; replace emoji with icons. */

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
import {
  useThemePreference,
  type ThemePreference,
} from '@/contexts/theme-preference';
import { useTheme } from '@/hooks/use-theme';

type AccountRowProps = {
  title: string;
  subtitle: string;
  onPress: () => void;
};

function AccountRow({ title, subtitle, onPress }: AccountRowProps) {
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

export default function AccountScreen() {
  const colors = useTheme();
  const { preference, setPreference } = useThemePreference();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const showUnavailable = (feature: string) => {
    Alert.alert(
      feature,
      'This feature is part of the account screen design but is not connected to an account service yet.',
    );
  };

  const themeOptions: { label: string; value: ThemePreference }[] = [
    { label: 'System Default', value: 'system' },
    { label: 'Light Mode', value: 'light' },
    { label: 'Dark Mode', value: 'dark' },
  ];

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
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerLabel, { color: colors.accent }]}>
              SKINAI
            </Text>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Your account
            </Text>
          </View>
          <Pressable
            style={[
              styles.settingsButton,
              { backgroundColor: colors.backgroundElement },
            ]}
            onPress={() => showUnavailable('Settings')}
            accessibilityLabel="Settings"
          >
            <Text style={[styles.settingsIcon, { color: colors.textSecondary }]}>
              ⚙
            </Text>
          </Pressable>
        </View>

        <View
          style={[
            styles.profileCard,
            { backgroundColor: colors.backgroundElement },
          ]}
        >
          <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
            <Text style={styles.avatarText}>U</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>
              Your profile
            </Text>
            <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
              Account information not connected
            </Text>
            <Text style={[styles.accountType, { color: colors.accent }]}>
              PATIENT USER ACCOUNT
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          ACCOUNT SETTINGS
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.backgroundElement },
          ]}
        >
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
          <View style={styles.notificationRow}>
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                Notifications
              </Text>
              <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>
                Product updates
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{
                false: colors.border,
                true: colors.accent,
              }}
              thumbColor={colors.white}
              accessibilityLabel="Product update notifications"
            />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          APPEARANCE
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.backgroundElement },
          ]}
        >
          <Text
            style={[
              styles.appearanceDescription,
              { color: colors.textSecondary },
            ]}
          >
            Choose how SkinAI looks on your device.
          </Text>

          {themeOptions.map((option) => {
            const selected = preference === option.value;

            return (
              <Pressable
                key={option.value}
                onPress={() => setPreference(option.value)}
                style={[
                  styles.themeOption,
                  {
                    backgroundColor: selected
                      ? colors.backgroundSelected
                      : 'transparent',
                    borderColor: selected
                      ? colors.accent
                      : colors.border,
                  },
                ]}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
              >
                <Text style={[styles.themeOptionText, { color: colors.text }]}>
                  {option.label}
                </Text>

                <View
                  style={[
                    styles.radioOuter,
                    {
                      borderColor: selected
                        ? colors.accent
                        : colors.textSecondary,
                    },
                  ]}
                >
                  {selected && (
                    <View
                      style={[
                        styles.radioInner,
                        { backgroundColor: colors.accent },
                      ]}
                    />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          DATA & SESSIONS
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.backgroundElement },
          ]}
        >
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
        </View>

        <View
          style={[
            styles.signOutCard,
            { backgroundColor: colors.backgroundElement },
          ]}
        >
          <Text style={[styles.signOutTitle, { color: colors.text }]}>
            Sign out
          </Text>
          <Text style={[styles.signOutSubtitle, { color: colors.textSecondary }]}>
            Account sign-out is not connected yet.
          </Text>
          <Pressable
            style={[styles.signOutButton, { backgroundColor: colors.accent }]}
            onPress={() => showUnavailable('Sign out')}
          >
            <Text style={styles.signOutButtonText}>Sign out</Text>
          </Pressable>
          <Pressable
            onPress={() => showUnavailable('Delete account')}
            style={styles.deleteButton}
          >
            <Text style={[styles.deleteText, { color: colors.danger }]}>
              Delete account
            </Text>
          </Pressable>
        </View>

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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  screen: { flex: 1 },
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
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 5,
  },
  headerTitle: { fontSize: 28, fontWeight: '700' },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: { fontSize: 22 },
  profileCard: {
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
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '700',
  },
  profileInfo: { flex: 1 },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 3,
  },
  profileEmail: { fontSize: 12, marginBottom: 8 },
  accountType: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
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
  notificationRow: {
    minHeight: 75,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  appearanceDescription: {
    fontSize: 12,
    paddingVertical: 12,
  },
  themeOption: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  themeOptionText: { fontSize: 14, fontWeight: '600' },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  signOutCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 28,
  },
  signOutTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 5,
  },
  signOutSubtitle: { fontSize: 12, marginBottom: 16 },
  signOutButton: {
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  deleteButton: { alignItems: 'center', paddingTop: 16 },
  deleteText: { fontSize: 13, fontWeight: '600' },
  footer: { alignItems: 'center', paddingTop: 8 },
  footerTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 5,
  },
  footerText: { fontSize: 11, marginBottom: 7 },
  footerDisclaimer: { fontSize: 10, textAlign: 'center' },
});
