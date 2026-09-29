import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Colors from '../../constants/colors';
import { Typography, Spacing, BorderRadius, Shadows } from '../../constants/typography';
import type { ProfileStackParamList } from '../../types';

type NavProp = NativeStackNavigationProp<ProfileStackParamList, 'EditProfile'>;

const AVATAR_OPTIONS = [
  { emoji: '👩', label: 'Kadın' },
  { emoji: '👨', label: 'Erkek' },
];

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { user, updateUser } = useAuth();
  const { theme, isDark } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [bio, setBio] = useState(user?.bio || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || '👩');

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  // Validation logic
  const validate = (): boolean => {
    const newErrors: { name?: string; email?: string; password?: string } = {};

    // Name validation
    const trimmedName = name.trim();
    if (!trimmedName) {
      newErrors.name = 'Ad Soyad alanı boş bırakılamaz.';
    } else if (trimmedName.length < 2) {
      newErrors.name = 'Ad Soyad en az 2 karakter olmalıdır.';
    } else if (trimmedName.length > 50) {
      newErrors.name = 'Ad Soyad en fazla 50 karakter olabilir.';
    }

    // Email validation
    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail) {
      newErrors.email = 'E-posta alanı boş bırakılamaz.';
    } else if (!emailRegex.test(trimmedEmail)) {
      newErrors.email = 'Lütfen geçerli bir e-posta formatı giriniz (örn: ad@ornek.com).';
    }

    // Password validation (optional, but if provided must be >= 6 chars)
    if (password.length > 0 && password.length < 6) {
      newErrors.password = 'Yeni şifre en az 6 karakterden oluşmalıdır.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await updateUser({
        name: name.trim(),
        email: email.trim(),
        bio: bio.trim(),
        avatar: selectedAvatar,
        ...(password.trim().length >= 6 ? { password: password.trim() } : {}),
      });

      Alert.alert('Başarılı', 'Profil bilgileriniz başarıyla güncellendi.', [
        { text: 'Tamam', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Profil güncellenirken hata oluştu.';
      Alert.alert('Güncelleme Başarısız', msg);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (!password) return null;
    if (password.length < 6) return { label: 'Zayıf (Min 6 karakter)', color: Colors.error };
    if (password.length < 9) return { label: 'Orta Düzey', color: Colors.warning };
    return { label: 'Güçlü', color: Colors.success };
  };

  const strength = getPasswordStrength();

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.surface}
      />

      {/* ─── Top Bar ─── */}
      <View style={[styles.topBar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.backButtonText, { color: theme.primary }]}>← Geri</Text>
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: theme.text }]}>Profili Düzenle</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* ─── Avatar Selector ─── */}
        <View style={styles.avatarSection}>
          <Text style={[styles.avatarHint, { color: theme.textSecondary }]}>Profil Fotoğrafı Seçin</Text>

          {/* Two-option Gender Picker */}
          <View style={styles.avatarPickerRow}>
            {AVATAR_OPTIONS.map(({ emoji, label }) => {
              const isSelected = selectedAvatar === emoji;
              return (
                <TouchableOpacity
                  key={emoji}
                  onPress={() => setSelectedAvatar(emoji)}
                  style={[
                    styles.avatarGenderCard,
                    {
                      backgroundColor: theme.surface,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                    isSelected && [
                      styles.avatarGenderCardSelected,
                      { backgroundColor: isDark ? '#232338' : '#F0F0FF' },
                    ],
                  ]}
                  activeOpacity={0.8}
                >
                  <Text style={styles.avatarGenderEmoji}>{emoji}</Text>
                  <Text
                    style={[
                      styles.avatarGenderLabel,
                      { color: isSelected ? theme.primary : theme.textSecondary },
                      isSelected && styles.avatarGenderLabelSelected,
                    ]}
                  >
                    {label}
                  </Text>
                  {isSelected && (
                    <View style={[styles.avatarCheckmark, { backgroundColor: theme.primary }]}>
                      <Text style={styles.avatarCheckmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ─── Form Fields ─── */}
        <View style={[styles.formCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {/* Ad Soyad */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Ad Soyad *</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.background,
                  borderColor: errors.name ? Colors.error : theme.border,
                  color: theme.text,
                },
                errors.name ? styles.inputError : null,
              ]}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="Adınızı ve soyadınızı giriniz"
              placeholderTextColor={theme.textTertiary}
              autoCapitalize="words"
            />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
          </View>

          {/* E-posta */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>E-posta Adresi *</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.background,
                  borderColor: errors.email ? Colors.error : theme.border,
                  color: theme.text,
                },
                errors.email ? styles.inputError : null,
              ]}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              placeholder="ornek@evently.com"
              placeholderTextColor={theme.textTertiary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>

          {/* Yeni Şifre */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Yeni Şifre (İsteğe Bağlı)</Text>
              {strength && (
                <Text style={[styles.strengthLabel, { color: strength.color }]}>
                  {strength.label}
                </Text>
              )}
            </View>
            <View style={styles.passwordInputWrapper}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  {
                    backgroundColor: theme.background,
                    borderColor: errors.password ? Colors.error : theme.border,
                    color: theme.text,
                  },
                  errors.password ? styles.inputError : null,
                ]}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                placeholder="Değiştirmek istemiyorsanız boş bırakın"
                placeholderTextColor={theme.textTertiary}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                <Text style={{ fontSize: 16 }}>{showPassword ? '👁️' : '🙈'}</Text>
              </TouchableOpacity>
            </View>
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            <Text style={[styles.helperText, { color: theme.textTertiary }]}>
              Şifrenizi değiştirmek istemiyorsanız bu alanı boş bırakabilirsiniz.
            </Text>
          </View>

          {/* Biyografi */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Biyografi</Text>
              <Text style={[styles.charCount, { color: theme.textTertiary }]}>{bio.length}/200</Text>
            </View>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              value={bio}
              onChangeText={(text) => {
                if (text.length <= 200) setBio(text);
              }}
              placeholder="Kendinizi ve sevdiğiniz etkinlik türlerini kısaca anlatın..."
              placeholderTextColor={theme.textTertiary}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        {/* ─── Actions ─── */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[theme.primary, theme.secondary || Colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveBtnGradient}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>💾 Değişiklikleri Kaydet</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cancelBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => navigation.goBack()}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>Vazgeç</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 60,
  },
  backButtonText: {
    ...Typography.styles.body,
    fontWeight: '600',
  },
  topBarTitle: {
    ...Typography.styles.h5,
    fontWeight: '700',
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: Spacing['3xl'],
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: Spacing.base,
  },
  avatarHint: {
    ...Typography.styles.caption,
    marginBottom: Spacing.md,
    fontWeight: '600',
  },
  avatarPickerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
    width: '100%',
    paddingHorizontal: Spacing.base,
  },
  avatarGenderCard: {
    flex: 1,
    maxWidth: 140,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    position: 'relative',
    ...Shadows.sm,
  },
  avatarGenderCardSelected: {
    ...Shadows.primary,
  },
  avatarGenderEmoji: {
    fontSize: 48,
    marginBottom: Spacing.xs,
  },
  avatarGenderLabel: {
    ...Typography.styles.body,
    fontWeight: '600',
  },
  avatarGenderLabelSelected: {
    fontWeight: '700',
  },
  avatarCheckmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCheckmarkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  formCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.base,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputLabel: {
    ...Typography.styles.label,
    fontWeight: '600',
    marginBottom: 6,
  },
  strengthLabel: {
    ...Typography.styles.caption,
    fontWeight: '600',
    fontSize: 11,
  },
  charCount: {
    ...Typography.styles.caption,
    fontSize: 11,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    ...Typography.styles.body,
  },
  inputError: {
    borderColor: Colors.error,
  },
  passwordInputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    height: 40,
    justifyContent: 'center',
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
    paddingTop: Spacing.sm + 2,
  },
  errorText: {
    ...Typography.styles.caption,
    color: Colors.error,
    marginTop: 4,
  },
  helperText: {
    ...Typography.styles.caption,
    marginTop: 4,
    fontSize: 11,
  },
  actionSection: {
    gap: Spacing.sm,
  },
  saveBtn: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.primary,
  },
  saveBtnGradient: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    ...Typography.styles.button,
    color: '#fff',
    fontWeight: '700',
  },
  cancelBtn: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  cancelBtnText: {
    ...Typography.styles.button,
    fontWeight: '600',
  },
});

export default EditProfileScreen;
