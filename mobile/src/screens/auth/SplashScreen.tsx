import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../constants/colors';
import { Typography, Spacing, BorderRadius } from '../../constants/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SplashScreenProps {
  statusMessage?: string;
}

const SplashScreen: React.FC<SplashScreenProps> = ({
  statusMessage = 'Oturum doğrulanıyor...',
}) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a14" />
      <LinearGradient
        colors={['#0a0a14', '#150d2a', '#0a0a14']}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative ambient glow */}
      <View style={styles.glowSphere} />

      <View style={styles.content}>
        {/* Brand Icon Box */}
        <LinearGradient
          colors={[Colors.primary, Colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoBox}
        >
          <Text style={styles.logoEmoji}>🎫</Text>
        </LinearGradient>

        {/* Brand Name */}
        <Text style={styles.appName}>Evently</Text>
        <Text style={styles.appTagline}>Şehrindeki En İyi Etkinlikleri Keşfet</Text>

        {/* Loading Indicator & Status */}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.statusText}>{statusMessage}</Text>
        </View>
      </View>

      {/* Footer / Version */}
      <View style={styles.footer}>
        <Text style={styles.versionText}>Evently v1.0 • Güvenli Oturum</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowSphere: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    borderRadius: (SCREEN_WIDTH * 0.8) / 2,
    backgroundColor: Colors.primary + '18',
    top: '30%',
    alignSelf: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  logoBox: {
    width: 90,
    height: 90,
    borderRadius: BorderRadius['2xl'],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 12,
  },
  logoEmoji: {
    fontSize: 44,
  },
  appName: {
    ...Typography.styles.h1,
    color: Colors.text,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: Spacing.xs,
  },
  appTagline: {
    ...Typography.styles.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing['3xl'],
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  statusText: {
    ...Typography.styles.caption,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: Spacing['2xl'],
    alignItems: 'center',
  },
  versionText: {
    ...Typography.styles.caption,
    color: Colors.textTertiary,
  },
});

export default SplashScreen;
