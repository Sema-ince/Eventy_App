import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { eventsService, favoritesService } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/common/Button';
import { ErrorState } from '../../components/common/StateViews';
import { Skeleton } from '../../components/common/Skeleton';
import Colors from '../../constants/colors';
import { Typography, Spacing, BorderRadius, Shadows } from '../../constants/typography';
import type { Event, HomeStackParamList } from '../../types';

type NavProp = NativeStackNavigationProp<HomeStackParamList, 'EventDetail'>;
type RoutePropType = RouteProp<HomeStackParamList, 'EventDetail'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const formatDateOnly = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

const formatTimeOnly = (dateStr: string): string =>
  new Date(dateStr).toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });

const formatPrice = (price: number, currency: string): string =>
  price === 0 ? 'Ücretsiz' : `${price.toLocaleString('tr-TR')} ${currency}`;

const EventDetailScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const { theme, isDark } = useTheme();
  const { eventId } = route.params;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const loadEvent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await eventsService.getById(eventId);
      setEvent(data);
      setIsFavorited(!!data.isFavorited);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Etkinlik yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => { loadEvent(); }, [loadEvent]);

  const tags = React.useMemo(() => {
    if (!event?.tags) return [];
    try {
      return JSON.parse(event.tags) as string[];
    } catch {
      return [];
    }
  }, [event?.tags]);

  const handleFavorite = useCallback(async () => {
    if (!event) return;
    setFavoriteLoading(true);
    try {
      if (isFavorited) {
        await favoritesService.removeFavorite(event.id);
        setIsFavorited(false);
      } else {
        await favoritesService.addFavorite(event.id);
        setIsFavorited(true);
      }
    } catch (e) {
      console.warn('Favorite toggle error:', e);
    } finally {
      setFavoriteLoading(false);
    }
  }, [event, isFavorited]);

  const handlePurchase = () => {
    if (!event) return;
    navigation.navigate('OrderConfirmation', {
      event,
      quantity,
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Skeleton height={SCREEN_HEIGHT * 0.4} borderRadius={0} />
        <View style={{ padding: Spacing.base }}>
          <Skeleton height={28} width="80%" style={{ marginBottom: Spacing.md }} />
          <Skeleton height={16} width="50%" style={{ marginBottom: Spacing.sm }} />
          <Skeleton height={16} width="60%" style={{ marginBottom: Spacing.xl }} />
          <Skeleton height={100} />
        </View>
      </View>
    );
  }

  if (error || !event) {
    return <ErrorState message={error || 'Etkinlik bulunamadı'} onRetry={loadEvent} />;
  }

  const availableSeats = event.totalSeats - event.soldSeats;
  const seatPercentage = (event.totalSeats > 0 ? (event.soldSeats / event.totalSeats) * 100 : 0);
  const isPastEvent = new Date(event.date) < new Date();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView showsVerticalScrollIndicator={false} bounces>
        {/* ─── Hero Image ─── */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: event.imageUrl }} style={styles.heroImage} resizeMode="cover" />
          <LinearGradient
            colors={['transparent', theme.background]}
            style={styles.heroGradient}
          />
          {/* Back & Favorite buttons */}
          <View style={styles.heroButtons}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.heroBtn}>
              <Text style={styles.heroBtnText}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleFavorite} style={styles.heroBtn} disabled={favoriteLoading}>
              {favoriteLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.heroBtnText}>{isFavorited ? '❤️' : '🤍'}</Text>
              )}
            </TouchableOpacity>
          </View>
          {/* Category badge */}
          <View style={[styles.catBadge, { backgroundColor: (event.category?.color || theme.primary) + '33', borderColor: (event.category?.color || theme.primary) + '66' }]}>
            <Text style={styles.catBadgeIcon}>{event.category?.icon}</Text>
            <Text style={[styles.catBadgeText, { color: event.category?.color || theme.primary }]}>{event.category?.name}</Text>
          </View>
        </View>

        {/* ─── Content ─── */}
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.text }]}>{event.title}</Text>

          {/* Past event banner */}
          {isPastEvent && (
            <View style={[styles.pastEventBanner, { backgroundColor: '#88888818', borderColor: '#88888844' }]}>
              <Text style={{ fontSize: 16 }}>🕒</Text>
              <Text style={[styles.pastEventText, { color: '#999999' }]}>Bu etkinlik sona ermiştir</Text>
            </View>
          )}

          {/* Meta cards */}
          <View style={styles.metaGrid}>
            <View style={[styles.metaCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={styles.metaCardIcon}>📅</Text>
              <Text style={[styles.metaCardLabel, { color: theme.textTertiary }]}>Tarih</Text>
              <Text style={[styles.metaCardValue, { color: theme.text }]}>{formatDateOnly(event.date)}</Text>
            </View>
            <View style={[styles.metaCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={styles.metaCardIcon}>📍</Text>
              <Text style={[styles.metaCardLabel, { color: theme.textTertiary }]}>Konum & Adres</Text>
              <Text style={[styles.metaCardValue, { color: theme.text }]} numberOfLines={2}>{event.location || event.address}</Text>
            </View>
          </View>

          {/* Distinct Time & Hours Grid */}
          <View style={styles.timeGrid}>
            <View style={[styles.timeCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={styles.timeCardIcon}>🕒</Text>
              <Text style={[styles.timeLabel, { color: theme.textTertiary }]}>Başlangıç</Text>
              <Text style={[styles.timeValue, { color: theme.text }]}>{formatTimeOnly(event.date)}</Text>
            </View>
            <View style={[styles.timeCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={styles.timeCardIcon}>🏁</Text>
              <Text style={[styles.timeLabel, { color: theme.textTertiary }]}>Bitiş</Text>
              <Text style={[styles.timeValue, { color: theme.text }]}>
                {event.endDate ? formatTimeOnly(event.endDate) : '23:30 (Tahmini)'}
              </Text>
            </View>
            <View style={[styles.timeCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={styles.timeCardIcon}>👥</Text>
              <Text style={[styles.timeLabel, { color: theme.textTertiary }]}>Kapasite</Text>
              <Text style={[styles.timeValue, { color: theme.text }]}>{event.totalSeats} Kişi</Text>
            </View>
          </View>

          {/* Organizer */}
          <View style={[styles.organizerRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.organizerAvatar, { backgroundColor: theme.primaryTransparent }]}>
              <Text style={{ fontSize: 20 }}>👤</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.organizerName, { color: theme.text }]}>{event.organizerName || 'Evently Organizasyon'}</Text>
                <Text style={styles.verifiedBadge}>✓ Onaylı</Text>
              </View>
              <Text style={[styles.organizerLabel, { color: theme.textTertiary }]}>Resmi Etkinlik Organizatörü</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>📄 Hakkında</Text>
            <Text style={[styles.description, { color: theme.textSecondary }]}>{event.description}</Text>
          </View>

          {/* Tags */}
          {tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {tags.map((tag, i) => (
                <View key={i} style={[styles.tag, { backgroundColor: theme.primaryTransparent, borderColor: theme.primary + '44' }]}>
                  <Text style={[styles.tagText, { color: theme.primary }]}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Seat Availability */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>🎟️ Koltuk Durumu</Text>
            <View style={[styles.seatBar, { backgroundColor: theme.surface2 }]}>
              <View style={[styles.seatFill, {
                width: `${seatPercentage}%` as any,
                backgroundColor: seatPercentage >= 90 ? Colors.error : seatPercentage >= 70 ? Colors.warning : Colors.success,
              }]} />
            </View>
            <Text style={[styles.seatText, { color: theme.textSecondary }]}>
              {availableSeats} koltuk mevcut / {event.totalSeats} toplam
            </Text>
          </View>

          {/* Quantity selector */}
          {event.price > 0 && (
            <View style={styles.quantitySection}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>🎫 Adet Seçin</Text>
              <View style={styles.quantityRow}>
                <TouchableOpacity
                  style={[styles.quantityBtn, { backgroundColor: theme.surface2, borderColor: theme.border }]}
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Text style={[styles.quantityBtnText, { color: theme.text }]}>−</Text>
                </TouchableOpacity>
                <Text style={[styles.quantityValue, { color: theme.text }]}>{quantity}</Text>
                <TouchableOpacity
                  style={[styles.quantityBtn, { backgroundColor: theme.surface2, borderColor: theme.border }]}
                  onPress={() => setQuantity(Math.min(availableSeats, quantity + 1))}
                >
                  <Text style={[styles.quantityBtnText, { color: theme.text }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ─── Bottom Purchase Bar ─── */}
      <View style={[styles.bottomBar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <View>
          <Text style={[styles.priceLabel, { color: theme.textTertiary }]}>Toplam Fiyat</Text>
          <Text style={[styles.price, { color: theme.accent || Colors.secondary }]}>
            {formatPrice(event.price * quantity, event.currency)}
          </Text>
        </View>
        <Button
          title={isPastEvent ? 'Geçmiş Etkinlik' : availableSeats === 0 ? 'Tükendi' : 'Bilet Al 🎫'}
          onPress={handlePurchase}
          disabled={availableSeats === 0 || isPastEvent}
          fullWidth={false}
          style={{ paddingHorizontal: Spacing['2xl'] }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroContainer: { height: SCREEN_HEIGHT * 0.42, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%' },
  heroButtons: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
  },
  heroBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBtnText: { fontSize: 20, color: '#FFFFFF' },
  catBadge: {
    position: 'absolute',
    bottom: Spacing.base,
    left: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 5,
  },
  catBadgeIcon: { fontSize: 14 },
  catBadgeText: { ...Typography.styles.label, fontWeight: '700' },
  content: { padding: Spacing.base },
  title: { ...Typography.styles.h2, fontWeight: '700', marginBottom: Spacing.base },
  metaGrid: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.base },
  metaCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
  },
  metaCardIcon: { fontSize: 22, marginBottom: 4 },
  metaCardLabel: { ...Typography.styles.caption, marginBottom: 4 },
  metaCardValue: { ...Typography.styles.bodySmall, fontWeight: '600' },
  timeGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  timeCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm + 2,
    borderWidth: 1,
    alignItems: 'center',
  },
  timeCardIcon: { fontSize: 18, marginBottom: 2 },
  timeLabel: {
    ...Typography.styles.caption,
    fontSize: 10,
    marginBottom: 2,
    textAlign: 'center',
  },
  timeValue: {
    ...Typography.styles.bodySmall,
    fontWeight: '700',
    textAlign: 'center',
  },
  verifiedBadge: {
    ...Typography.styles.caption,
    color: '#00F5A0',
    backgroundColor: '#00F5A022',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
    fontSize: 10,
    fontWeight: '700',
  },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
    marginBottom: Spacing.base,
  },
  organizerAvatar: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  organizerLabel: { ...Typography.styles.caption },
  organizerName: { ...Typography.styles.h5, fontWeight: '600' },
  section: { marginBottom: Spacing.base },
  sectionTitle: { ...Typography.styles.h5, fontWeight: '700', marginBottom: Spacing.sm },
  description: { ...Typography.styles.body, lineHeight: 24 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.base },
  tag: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
  },
  tagText: { ...Typography.styles.caption, fontWeight: '600' },
  seatBar: {
    height: 8,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  seatFill: { height: '100%', borderRadius: BorderRadius.full },
  seatText: { ...Typography.styles.bodySmall },
  quantitySection: { marginBottom: Spacing.xl },
  quantityRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.base },
  quantityBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  quantityBtnText: { ...Typography.styles.h4 },
  quantityValue: { ...Typography.styles.h3, minWidth: 40, textAlign: 'center' },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.base,
    borderTopWidth: 1,
    paddingBottom: Spacing.xl,
  },
  priceLabel: { ...Typography.styles.caption },
  price: { ...Typography.styles.h4, fontWeight: '700' },
  pastEventBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.base,
  },
  pastEventText: {
    ...Typography.styles.bodySmall,
    fontWeight: '600',
  },
});

export default EventDetailScreen;
