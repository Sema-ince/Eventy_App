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

type NavProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

const RegisterScreen = () => {
  const navigation = useNavigation<NavProp>();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<any>(null);
  const passwordRef = useRef<any>(null);
  const confirmRef = useRef<any>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) newErrors.name = 'Ad en az 2 karakter olmalı';
    if (!email.trim()) newErrors.email = 'E-posta gerekli';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Geçerli bir e-posta girin';
    if (!password || password.length < 6) newErrors.password = 'Şifre en az 6 karakter olmalı';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) { shake(); return; }
    setLoading(true);
    try {
      await register(name.trim(), email.trim().toLowerCase(), password);
    } catch (error) {
      shake();
      Alert.alert('Kayıt Başarısız', error instanceof Error ? error.message : 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Password strength
  const passwordStrength = password.length === 0 ? null
    : password.length < 6 ? 'weak'
    : password.length < 10 ? 'medium'
    : 'strong';

  const strengthConfig = {
    weak: { color: Colors.error, label: 'Zayıf', width: '33%' },
    medium: { color: Colors.warning, label: 'Orta', width: '66%' },
    strong: { color: Colors.success, label: 'Güçlü', width: '100%' },
  };

  return (
    <LinearGradient colors={[Colors.background, Colors.surface]} style={styles.gradient}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backText}>← Geri</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Hesap Oluştur</Text>
            <Text style={styles.subtitle}>Etkinlik dünyasına katıl</Text>
          </View>

          {/* Form */}
          <Animated.View style={[styles.form, { transform: [{ translateX: shakeAnim }] }]}>
            <Input
              label="Ad Soyad"
              placeholder="Adınız Soyadınız"
              value={name}
              onChangeText={(t) => { setName(t); setErrors(e => ({ ...e, name: undefined as any })); }}
              autoComplete="name"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              error={errors.name}
              leftIcon={<Text style={styles.inputIcon}>👤</Text>}
            />

            <Input
              ref={emailRef}
              label="E-posta"
              placeholder="ornek@mail.com"
              value={email}
              onChangeText={(t) => { setEmail(t); setErrors(e => ({ ...e, email: undefined as any })); }}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              error={errors.email}
              leftIcon={<Text style={styles.inputIcon}>✉️</Text>}
            />

            <Input
              ref={passwordRef}
              label="Şifre"
              placeholder="En az 6 karakter"
              value={password}
              onChangeText={(t) => { setPassword(t); setErrors(e => ({ ...e, password: undefined as any })); }}
              secureTextEntry={!showPassword}
              returnKeyType="next"
              onSubmitEditing={() => confirmRef.current?.focus()}
              error={errors.password}
              leftIcon={<Text style={styles.inputIcon}>🔒</Text>}
              rightIcon={<Text style={styles.inputIcon}>{showPassword ? '🙈' : '👁️'}</Text>}
              onRightIconPress={() => setShowPassword(!showPassword)}
            />

            {/* Password Strength */}
            {passwordStrength && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBar}>
                  <View
                    style={[
                      styles.strengthFill,
                      {
                        width: strengthConfig[passwordStrength].width as any,
                        backgroundColor: strengthConfig[passwordStrength].color,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.strengthLabel, { color: strengthConfig[passwordStrength].color }]}>
                  {strengthConfig[passwordStrength].label}
                </Text>
              </View>
            )}

            <Input
              ref={confirmRef}
              label="Şifre Tekrar"
              placeholder="Şifrenizi tekrar girin"
              value={confirmPassword}
              onChangeText={(t) => { setConfirmPassword(t); setErrors(e => ({ ...e, confirmPassword: undefined as any })); }}
              secureTextEntry={!showPassword}
              returnKeyType="done"
              onSubmitEditing={handleRegister}
              error={errors.confirmPassword}
              leftIcon={<Text style={styles.inputIcon}>🔑</Text>}
            />

            <Button
              title="Kayıt Ol"
              onPress={handleRegister}
              loading={loading}
              style={{ marginTop: Spacing.md }}
            />
          </Animated.View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Hesabın var mı? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Giriş Yap</Text>
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
    paddingVertical: Spacing['2xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.xl,
  },
  backText: {
    ...Typography.styles.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  title: { ...Typography.styles.h2, color: Colors.text, fontWeight: '700' },
  subtitle: { ...Typography.styles.body, color: Colors.textSecondary, marginTop: Spacing.xs },
  form: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputIcon: { fontSize: 18 },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  strengthLabel: { ...Typography.styles.caption, fontWeight: '600', minWidth: 40 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  footerText: { ...Typography.styles.body, color: Colors.textSecondary },
  footerLink: { ...Typography.styles.body, color: Colors.primary, fontWeight: '700' },
});

export default RegisterScreen;
