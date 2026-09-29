import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Colors from '../../constants/colors';
import { Typography, Spacing, BorderRadius } from '../../constants/typography';
import type { AuthStackParamList } from '../../types';

type NavProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const LoginScreen = () => {
  const navigation = useNavigation<NavProp>();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef<any>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) newErrors.email = 'E-posta gerekli';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Geçerli bir e-posta girin';
    if (!password) newErrors.password = 'Şifre gerekli';
    else if (password.length < 6) newErrors.password = 'Şifre en az 6 karakter olmalı';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) { shake(); return; }
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (error) {
      shake();
      Alert.alert('Giriş Başarısız', error instanceof Error ? error.message : 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[Colors.background, Colors.surface]} style={styles.gradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>🎫</Text>
            </View>
            <Text style={styles.appName}>Evently</Text>
            <Text style={styles.tagline}>Etkinlik dünyasına hoş geldin!</Text>
          </View>

          {/* Form */}
          <Animated.View style={[styles.form, { transform: [{ translateX: shakeAnim }] }]}>
            <Text style={styles.formTitle}>Giriş Yap</Text>

            <Input
              label="E-posta"
              placeholder="ornek@mail.com"
              value={email}
              onChangeText={(t) => { setEmail(t); setErrors((e) => ({ ...e, email: undefined })); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={errors.email}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              leftIcon={<Text style={styles.inputIcon}>✉️</Text>}
            />

            <Input
              ref={passwordRef}
              label="Şifre"
              placeholder="••••••••"
              value={password}
              onChangeText={(t) => { setPassword(t); setErrors((e) => ({ ...e, password: undefined })); }}
              secureTextEntry={!showPassword}
              autoComplete="password"
              error={errors.password}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              leftIcon={<Text style={styles.inputIcon}>🔒</Text>}
              rightIcon={<Text style={styles.inputIcon}>{showPassword ? '🙈' : '👁️'}</Text>}
              onRightIconPress={() => setShowPassword(!showPassword)}
            />

            <Button
              title="Giriş Yap"
              onPress={handleLogin}
              loading={loading}
              style={{ marginTop: Spacing.md }}
            />

            {/* Demo hint */}
            <TouchableOpacity
              style={styles.demoHint}
              onPress={() => {
                setEmail('demo@evently.app');
                setPassword('Test1234!');
              }}
            >
              <Text style={styles.demoHintText}>
                🎯 Demo hesapla giriş yap
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Hesabın yok mu? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLink}>Kayıt Ol</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing['3xl'],
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.primary + '33',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary + '66',
  },
  logoEmoji: { fontSize: 40 },
  appName: {
    ...Typography.styles.h1,
    color: Colors.text,
    fontWeight: '800',
    letterSpacing: -1,
  },
  tagline: {
    ...Typography.styles.body,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  form: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formTitle: {
    ...Typography.styles.h3,
    color: Colors.text,
    marginBottom: Spacing.xl,
    fontWeight: '700',
  },
  inputIcon: { fontSize: 18 },
  demoHint: {
    marginTop: Spacing.base,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  demoHintText: {
    ...Typography.styles.bodySmall,
    color: Colors.primary,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    ...Typography.styles.body,
    color: Colors.textSecondary,
  },
  footerLink: {
    ...Typography.styles.body,
    color: Colors.primary,
    fontWeight: '700',
  },
});

export default LoginScreen;
