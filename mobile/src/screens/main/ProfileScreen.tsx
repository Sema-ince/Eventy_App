import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/common/Button';
import { Typography, Spacing, BorderRadius, Shadows } from '../../constants/typography';
import type { ProfileStackParamList } from '../../types';

type NavProp = NativeStackNavigationProp<ProfileStackParamList, 'ProfileScreen'>;

const ProfileScreen = () => {
  const navigation = useNavigation<NavProp>();
  const { user, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    Alert.alert('Çıkış Yap', 'Hesabından çıkmak istediğine emin misin?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Çıkış Yap', style: 'destructive', onPress: logout },
    ]);
  };

  const getInitials = (nameStr: string) => {
    return nameStr.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const stats = [
    { label: 'Biletler', value: user?._count?.tickets ?? 0, icon: '🎫' },
    { label: 'Favoriler', value: user?._count?.favorites ?? 0, icon: '❤️' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.surface}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>👤 Profil</Text>
        </View>

        {/* Avatar & Name */}
        <View style={[styles.profileCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { borderColor: theme.primary, backgroundColor: theme.primaryTransparent }]}>
              {user?.avatar ? (
                <Text style={{ fontSize: 36 }}>{user.avatar}</Text>
              ) : (
                <Text style={[styles.avatarText, { color: theme.primary }]}>{getInitials(user?.name || 'U')}</Text>
              )}
            </View>
            <View style={[styles.onlineDot, { borderColor: theme.surface }]} />
          </View>

          <Text style={[styles.profileName, { color: theme.text }]}>{user?.name}</Text>
          <Text style={[styles.profileEmail, { color: theme.textSecondary }]}>{user?.email}</Text>
          {user?.bio ? <Text style={[styles.profileBio, { color: theme.textTertiary }]}>{user.bio}</Text> : null}

          <TouchableOpacity
            onPress={() => navigation.navigate('EditProfile')}
            style={[styles.editBtn, { backgroundColor: theme.primaryTransparent, borderColor: theme.primary + '44' }]}
            activeOpacity={0.8}
          >
            <Text style={[styles.editBtnText, { color: theme.primary }]}>✏️ Profili Düzenle</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <View key={stat.label} style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={[styles.statValue, { color: theme.text }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Info Section */}
        <View style={[styles.infoSection, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.infoSectionTitle, { color: theme.text }]}>Hesap Bilgileri</Text>
          <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
            <Text style={styles.infoIcon}>✉️</Text>
            <View>
              <Text style={[styles.infoLabel, { color: theme.textTertiary }]}>E-posta</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{user?.email}</Text>
            </View>
          </View>
          <View style={[styles.infoRow, { borderBottomColor: 'transparent' }]}>
            <Text style={styles.infoIcon}>📅</Text>
            <View>
              <Text style={[styles.infoLabel, { color: theme.textTertiary }]}>Üyelik Tarihi</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : '-'}
              </Text>
            </View>
          </View>
        </View>

        {/* Theme Toggle */}
        <View style={[styles.themeRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.themeLeft}>
            <Text style={styles.themeIcon}>{isDark ? '🌙' : '☀️'}</Text>
            <View>
              <Text style={[styles.themeLabel, { color: theme.text }]}>
                {isDark ? 'Koyu Tema' : 'Açık Tema'}
              </Text>
              <Text style={[styles.themeSub, { color: theme.textTertiary }]}>
                {isDark ? 'Dark mode aktif' : 'Light mode aktif'}
              </Text>
            </View>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.border, true: theme.primary + '88' }}
            thumbColor={isDark ? theme.primary : theme.textSecondary}
            ios_backgroundColor={theme.border}
          />
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={[styles.appName, { color: theme.primary }]}>🎫 Evently</Text>
          <Text style={[styles.appVersion, { color: theme.textTertiary }]}>v1.0.0 — Etkinlik Keşif Uygulaması</Text>
        </View>

        {/* Logout */}
        <Button
          title="Çıkış Yap"
          onPress={handleLogout}
          variant="danger"
          style={{ marginHorizontal: Spacing.base }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: Spacing['3xl'] },
  header: {
    paddingTop: Spacing['3xl'],
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl,
    borderBottomWidth: 1,
  },
  headerTitle: { ...Typography.styles.h3, fontWeight: '700' },
  profileCard: {
    margin: Spacing.base,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    ...Shadows.md,
  },
  avatarContainer: { position: 'relative', marginBottom: Spacing.md },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: BorderRadius.full,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...Typography.styles.h2, fontWeight: '700' },
  onlineDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#00F5A0',
    borderWidth: 2,
  },
  profileName: { ...Typography.styles.h3, fontWeight: '700' },
  profileEmail: { ...Typography.styles.body, marginTop: 4 },
  profileBio: {
    ...Typography.styles.bodySmall,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
  editBtn: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  editBtnText: { ...Typography.styles.label },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    gap: Spacing.md,
    marginBottom: Spacing.base,
  },
  statCard: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    alignItems: 'center',
    borderWidth: 1,
    ...Shadows.sm,
  },
  statIcon: { fontSize: 28, marginBottom: Spacing.xs },
  statValue: { ...Typography.styles.h3, fontWeight: '700' },
  statLabel: { ...Typography.styles.caption },
  infoSection: {
    marginHorizontal: Spacing.base,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    borderWidth: 1,
  },
  infoSectionTitle: { ...Typography.styles.h5, fontWeight: '700', marginBottom: Spacing.md },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  infoIcon: { fontSize: 22, width: 30, textAlign: 'center' },
  infoLabel: { ...Typography.styles.caption },
  infoValue: { ...Typography.styles.bodySmall, fontWeight: '600' },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.base,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    ...Shadows.sm,
  },
  themeLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  themeIcon: { fontSize: 28 },
  themeLabel: { ...Typography.styles.h5, fontWeight: '700' },
  themeSub: { ...Typography.styles.caption, marginTop: 2 },
  appInfo: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  appName: { ...Typography.styles.h4, fontWeight: '700' },
  appVersion: { ...Typography.styles.caption, marginTop: 4 },
});

export default ProfileScreen;
