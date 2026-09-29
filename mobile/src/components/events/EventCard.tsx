import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { Typography, BorderRadius, Spacing, Shadows } from '../../constants/typography';
import type { Event } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Helper: format price ─────────────────────────────────────────
const formatPrice = (price: number, currency: string): string => {
  if (price === 0) return 'Ücretsiz';
  return `${price.toLocaleString('tr-TR')} ${currency}`;
};

// ─── Helper: format date ──────────────────────────────────────────
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// ─── Seat Availability Badge ──────────────────────────────────────
const AvailabilityBadge = ({
  total,
  sold,
  eventDate,
}: {
  total: number;
  sold: number;
  eventDate?: string;
}) => {
  // Etkinlik tarihi geçmişse 'Geçmiş Etkinlik' göster
  if (eventDate && new Date(eventDate) < new Date()) {
    return (
      <View style={[styles.badge, { backgroundColor: '#88888822' }]}>
        <View style={[styles.badgeDot, { backgroundColor: '#888888' }]} />
        <Text style={[styles.badgeText, { color: '#888888' }]}>Geçmiş Etkinlik</Text>
      </View>
    );
  }

  const available = total - sold;
  const percentage = total > 0 ? (sold / total) * 100 : 0;
  let color = Colors.success;
  let text = 'Müsait';
  if (percentage >= 90) { color = Colors.error; text = 'Son birkaç bilet!'; }
  else if (percentage >= 70) { color = Colors.warning; text = `${available} koltuk kaldı`; }

  return (
    <View style={[styles.badge, { backgroundColor: color + '22' }]}>
      <View style={[styles.badgeDot, { backgroundColor: color }]} />
      <Text style={[styles.badgeText, { color }]}>{text}</Text>
    </View>
  );
};

// ─── Featured Event Card (for carousel) ──────────────────────────
interface FeaturedCardProps {
  event: Event;
  onPress: (event: Event) => void;
  width?: number;
}

export const FeaturedEventCard: React.FC<FeaturedCardProps> = ({
  event,
  onPress,
  width = SCREEN_WIDTH * 0.82,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress(event)}
      style={[styles.featuredCard, { width }]}
    >
      <Image
        source={{ uri: event.imageUrl }}
        style={styles.featuredImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(13, 13, 26, 0.95)']}
        style={styles.featuredGradient}
      />

      <View style={styles.featuredContent}>
        {/* Category Chip */}
        <View style={[styles.categoryChip, { backgroundColor: event.category?.color + '33' }]}>
          <Text style={styles.categoryChipIcon}>{event.category?.icon}</Text>
          <Text style={[styles.categoryChipText, { color: event.category?.color }]}>
            {event.category?.name}
          </Text>
        </View>

        {/* Title */}
        <Text style={styles.featuredTitle} numberOfLines={2}>
          {event.title}
        </Text>

        {/* Meta row */}
        <View style={styles.featuredMeta}>
          <Text style={styles.featuredMetaText}>📅 {formatDate(event.date)}</Text>
          <Text style={styles.featuredMetaDot}>·</Text>
          <Text style={styles.featuredMetaText} numberOfLines={1}>📍 {event.location}</Text>
        </View>

        {/* Footer */}
        <View style={styles.featuredFooter}>
          <View>
            <Text style={styles.priceLabel}>Başlayan fiyatlarla</Text>
            <Text style={styles.priceValue}>{formatPrice(event.price, event.currency)}</Text>
          </View>
          <AvailabilityBadge total={event.totalSeats} sold={event.soldSeats} eventDate={event.date} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── Popular Event Card (for trending carousel) ───────────────────
interface PopularCardProps {
  event: Event;
  rank: number;
  onPress: (event: Event) => void;
  width?: number;
}

export const PopularEventCard: React.FC<PopularCardProps> = ({
  event,
  rank,
  onPress,
  width = 230,
}) => {
  const { theme } = useTheme();
  const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
  const rankColor = rank <= 3 ? rankColors[rank - 1] : Colors.primary;

  return (
    <TouchableOpacity
      style={[styles.popularCard, { width, backgroundColor: theme.surface, borderColor: theme.border }]}
      onPress={() => onPress(event)}
      activeOpacity={0.88}
    >
      <View style={styles.popularImageContainer}>
        <Image source={{ uri: event.imageUrl }} style={styles.popularImage} resizeMode="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(13, 13, 26, 0.9)']}
          style={styles.popularGradient}
        />

        {/* Rank Badge */}
        <View style={[styles.rankBadge, { backgroundColor: rankColor }]}>
          <Text style={styles.rankBadgeText}>#{rank}</Text>
        </View>

        {/* Category Pill */}
        <View
          style={[
            styles.popularCategoryBadge,
            { backgroundColor: (event.category?.color || Colors.primary) + '55' },
          ]}
        >
          <Text style={styles.popularCategoryBadgeText}>
            {event.category?.icon} {event.category?.name}
          </Text>
        </View>

        {/* Price */}
        <View style={styles.popularPriceTag}>
          <Text style={styles.popularPriceText}>{formatPrice(event.price, event.currency)}</Text>
        </View>
      </View>

      <View style={[styles.popularContent, { backgroundColor: theme.surface }]}>
        <Text style={[styles.popularTitle, { color: theme.text }]} numberOfLines={2}>
          {event.title}
        </Text>

        <View style={styles.popularMeta}>
          <Text style={[styles.popularMetaText, { color: theme.textSecondary }]}>📅 {formatDate(event.date)}</Text>
        </View>

        <View style={styles.popularMeta}>
          <Text style={[styles.popularMetaText, { color: theme.textSecondary }]} numberOfLines={1}>
            📍 {event.location}
          </Text>
        </View>

        <View style={[styles.popularFooter, { borderTopColor: theme.border }]}>
          <Text style={[styles.soldBadgeText, { color: theme.accent }]}>
            🔥 {event.soldSeats} bilet satıldı
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── Upcoming Event Card (⏰ Yaklaşan Etkinlikler) ──────────────────
interface UpcomingCardProps {
  event: Event;
  onPress: (event: Event) => void;
  width?: number;
}

export const UpcomingEventCard: React.FC<UpcomingCardProps> = ({
  event,
  onPress,
  width = 230,
}) => {
  const { theme } = useTheme();
  const dateObj = new Date(event.date);
  const day = dateObj.getDate();
  const month = dateObj.toLocaleDateString('tr-TR', { month: 'short' }).toUpperCase();
  const weekday = dateObj.toLocaleDateString('tr-TR', { weekday: 'short' });
  const time = dateObj.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  const now = new Date();
  const diffDays = Math.ceil((dateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  let badgeLabel = `${diffDays} gün`;
  let badgeColor: string = Colors.primary;
  if (diffDays <= 0) {
    badgeLabel = 'Bugün';
    badgeColor = Colors.error;
  } else if (diffDays === 1) {
    badgeLabel = 'Yarın';
    badgeColor = Colors.warning;
  } else if (diffDays <= 7) {
    badgeLabel = 'Bu Hafta';
    badgeColor = Colors.secondary;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => onPress(event)}
      style={[styles.upcomingCard, { width, backgroundColor: theme.surface, borderColor: theme.border }]}
    >
      <View style={styles.upcomingImageContainer}>
        <Image
          source={{ uri: event.imageUrl }}
          style={styles.upcomingImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(13, 13, 26, 0.9)']}
          style={StyleSheet.absoluteFill}
        />

        {/* Date Calendar Badge */}
        <View style={styles.upcomingDateBadge}>
          <Text style={styles.upcomingDayText}>{day}</Text>
          <Text style={styles.upcomingMonthText}>{month}</Text>
        </View>

        {/* Countdown Badge */}
        <View style={[styles.upcomingCountdownBadge, { backgroundColor: badgeColor }]}>
          <Text style={styles.upcomingCountdownText}>{badgeLabel}</Text>
        </View>

        {/* Price tag */}
        <View style={styles.upcomingPriceTag}>
          <Text style={styles.upcomingPriceText}>{formatPrice(event.price, event.currency)}</Text>
        </View>
      </View>

      <View style={styles.upcomingContent}>
        <Text style={[styles.upcomingTitle, { color: theme.text }]} numberOfLines={1}>
          {event.title}
        </Text>
        <View style={styles.upcomingMeta}>
          <Text style={[styles.upcomingMetaText, { color: theme.textSecondary }]}>🕒 {weekday}, {time}</Text>
        </View>
        <View style={styles.upcomingMeta}>
          <Text style={[styles.upcomingMetaText, { color: theme.textSecondary }]} numberOfLines={1}>
            📍 {event.location || event.address}
          </Text>
        </View>
        <View style={[styles.upcomingFooter, { borderTopColor: theme.border }]}>
          <Text
            style={[
              styles.upcomingCategoryText,
              { color: event.category?.color || Colors.primaryLight },
            ]}
          >
            {event.category?.icon} {event.category?.name}
          </Text>
          <Text style={[styles.upcomingSeatsText, { color: theme.textTertiary }]}>
            {event.totalSeats - event.soldSeats} boş
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── Regular Event Card (for list) ───────────────────────────────
interface EventCardProps {
  event: Event;
  onPress: (event: Event) => void;
  onFavoritePress?: (event: Event) => void;
  isFavorited?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onPress,
  onFavoritePress,
  isFavorited = false,
}) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      onPress={() => onPress(event)}
      activeOpacity={0.9}
      style={[styles.card, { backgroundColor: theme.surface }]}
    >
      <View style={styles.cardImageContainer}>
        <Image
          source={{ uri: event.imageUrl }}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.5)']}
          style={styles.cardImageGradient}
        />
        {/* Category Badge */}
        <View style={[styles.cardCategoryBadge, { backgroundColor: event.category?.color + '33' }]}>
          <Text style={styles.categoryChipIcon}>{event.category?.icon}</Text>
        </View>
        {/* Favorite Button */}
        {onFavoritePress && (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => onFavoritePress(event)}
            activeOpacity={0.8}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.favoriteIcon}>{isFavorited ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        )}
        {/* Price tag */}
        <View style={styles.priceTag}>
          <Text style={styles.priceTagText}>{formatPrice(event.price, event.currency)}</Text>
        </View>
      </View>

      <View style={[styles.cardContent, { backgroundColor: theme.surface }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={2}>{event.title}</Text>
        <View style={styles.cardMeta}>
          <Text style={[styles.cardMetaText, { color: theme.textSecondary }]}>📅 {formatDate(event.date)}</Text>
        </View>
        <View style={styles.cardMeta}>
          <Text style={[styles.cardMetaText, { color: theme.textSecondary }]} numberOfLines={1}>📍 {event.address}</Text>
        </View>
        <View style={styles.cardFooter}>
          <Text style={[styles.organizerText, { color: theme.textTertiary }]}>👤 {event.organizerName}</Text>
          <AvailabilityBadge total={event.totalSeats} sold={event.soldSeats} eventDate={event.date} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // ─ Featured Card ─
  featuredCard: {
    height: 240,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
    marginRight: Spacing.md,
    ...Shadows.lg,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  featuredGradient: {
    ...StyleSheet.absoluteFill,
  },
  featuredContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: Spacing.base,
  },
  featuredTitle: {
    ...Typography.styles.h4,
    color: Colors.text,
    fontWeight: '700',
    marginBottom: Spacing.xs,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  featuredMetaText: {
    ...Typography.styles.caption,
    color: Colors.textSecondary,
  },
  featuredMetaDot: {
    color: Colors.textTertiary,
    marginHorizontal: Spacing.xs,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceLabel: {
    ...Typography.styles.caption,
    color: Colors.textTertiary,
    fontSize: 10,
  },
  priceValue: {
    ...Typography.styles.h5,
    color: Colors.secondary,
    fontWeight: '700',
  },

  // ─ Category Chip ─
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    gap: 4,
    marginBottom: Spacing.xs,
  },
  categoryChipIcon: { fontSize: 12 },
  categoryChipText: { ...Typography.styles.caption, fontWeight: '600' },

  // ─ Badge ─
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { ...Typography.styles.caption, fontWeight: '600' },

  // ─ Upcoming Card ─
  upcomingCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.md,
    ...Shadows.md,
  },
  upcomingImageContainer: {
    height: 125,
    position: 'relative',
  },
  upcomingImage: {
    width: '100%',
    height: '100%',
  },
  upcomingDateBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: 'rgba(15, 15, 25, 0.88)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  upcomingDayText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
    lineHeight: 18,
  },
  upcomingMonthText: {
    color: Colors.primaryLight,
    fontWeight: '700',
    fontSize: 9,
    letterSpacing: 0.5,
  },
  upcomingCountdownBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
  },
  upcomingCountdownText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 10,
  },
  upcomingPriceTag: {
    position: 'absolute',
    bottom: Spacing.xs,
    right: Spacing.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  upcomingPriceText: {
    color: Colors.accent,
    fontSize: 11,
    fontWeight: '700',
  },
  upcomingContent: {
    padding: Spacing.sm,
  },
  upcomingTitle: {
    ...Typography.styles.body,
    fontWeight: '700',
    color: Colors.text,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  upcomingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  upcomingMetaText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  upcomingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  upcomingCategoryText: {
    fontSize: 10,
    fontWeight: '700',
  },
  upcomingSeatsText: {
    fontSize: 10,
    color: Colors.textTertiary,
  },

  // ─ Popular Card ─
  popularCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.md,
    ...Shadows.md,
  },
  popularImageContainer: {
    height: 130,
    position: 'relative',
  },
  popularImage: {
    width: '100%',
    height: '100%',
  },
  popularGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  },
  rankBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 12,
  },
  popularCategoryBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
  },
  popularCategoryBadgeText: {
    ...Typography.styles.caption,
    color: '#fff',
    fontWeight: '600',
    fontSize: 10,
  },
  popularPriceTag: {
    position: 'absolute',
    bottom: Spacing.xs,
    right: Spacing.xs,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  popularPriceText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  popularContent: {
    padding: Spacing.sm,
  },
  popularTitle: {
    ...Typography.styles.body,
    fontWeight: '700',
    color: Colors.text,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  popularMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  popularMetaText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  popularFooter: {
    marginTop: 6,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  soldBadgeText: {
    fontSize: 11,
    color: Colors.accent,
    fontWeight: '600',
  },

  // ─ Regular Card ─
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    ...Shadows.md,
  },
  cardImageContainer: {
    height: 180,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
  },
  cardCategoryBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    padding: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  favoriteButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: Spacing.xs,
    borderRadius: BorderRadius.full,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteIcon: { fontSize: 18 },
  priceTag: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
  },
  priceTagText: {
    ...Typography.styles.caption,
    color: '#fff',
    fontWeight: '700',
  },
  cardContent: {
    padding: Spacing.md,
  },
  cardTitle: {
    ...Typography.styles.h5,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  cardMetaText: {
    ...Typography.styles.bodySmall,
    color: Colors.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  organizerText: {
    ...Typography.styles.caption,
    color: Colors.textTertiary,
    flex: 1,
    marginRight: Spacing.sm,
  },
});
