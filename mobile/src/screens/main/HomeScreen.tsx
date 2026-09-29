import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { eventsService, favoritesService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  FeaturedEventCard,
  PopularEventCard,
  UpcomingEventCard,
  EventCard,
} from '../../components/events/EventCard';
import { CategoryChip } from '../../components/categories/CategoryChip';
import { ListSkeleton, FeaturedCardSkeleton } from '../../components/common/Skeleton';
import { ErrorState, EmptyState } from '../../components/common/StateViews';
import Colors from '../../constants/colors';
import { Typography, Spacing, BorderRadius, Shadows } from '../../constants/typography';
import type { Event, Category, HomeStackParamList } from '../../types';

type NavProp = NativeStackNavigationProp<HomeStackParamList, 'HomeScreen'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation<NavProp>();
  const { user } = useAuth();
  const { theme, isDark } = useTheme();

  const [featured, setFeatured] = useState<Event[]>([]);
  const [popular, setPopular] = useState<Event[]>([]);
  const [upcoming, setUpcoming] = useState<Event[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [searchText, setSearchText] = useState('');

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [featuredData, popularData, upcomingData, categoriesData] = await Promise.all([
        eventsService.getFeatured(),
        eventsService.getEvents({ sort: 'popularity', limit: 6 }),
        eventsService.getEvents({ sort: 'date', limit: 6 }),
        eventsService.getCategories(),
      ]);
      setFeatured(featuredData);
      setPopular(popularData.events);
      setUpcoming(upcomingData.events);
      setCategories(categoriesData);
      setLoadingFeatured(false);
      setLoadingPopular(false);
      setLoadingUpcoming(false);

      // Load favorites IDs
      try {
        const favData = await favoritesService.getFavorites();
        setFavorites(new Set(favData.map((e) => e.id)));
      } catch {
        /* not logged in or error */
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Veri yüklenemedi');
      setLoadingFeatured(false);
      setLoadingPopular(false);
    }
  }, []);

  const loadEvents = useCallback(async (category?: string | null) => {
    setLoadingEvents(true);
    try {
      const { events: data } = await eventsService.getEvents({
        category: category || undefined,
        limit: 20,
        sort: 'date',
      });
      setEvents(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Etkinlikler yüklenemedi');
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadEvents(selectedCategory);
  }, [selectedCategory, loadEvents]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadData(), loadEvents(selectedCategory)]);
    setRefreshing(false);
  }, [loadData, loadEvents, selectedCategory]);

  const handleEventPress = (event: Event) => {
    navigation.navigate('EventDetail', { eventId: event.id });
  };

  const handleFavoritePress = async (event: Event) => {
    const isFav = favorites.has(event.id);
    try {
      if (isFav) {
        await favoritesService.removeFavorite(event.id);
        setFavorites((prev) => {
          const s = new Set(prev);
          s.delete(event.id);
          return s;
        });
      } else {
        await favoritesService.addFavorite(event.id);
        setFavorites((prev) => new Set(prev).add(event.id));
      }
    } catch (e) {
      Alert.alert('Hata', e instanceof Error ? e.message : 'Bir hata oluştu');
    }
  };

  const handleSearchSubmit = () => {
    const trimmed = searchText.trim();
    navigation.getParent()?.navigate('Search', {
      screen: 'SearchScreen',
      params: { initialQuery: trimmed },
    });
  };

  if (error && !refreshing) {
    return (
      <View style={styles.container}>
        <ErrorState
          message={error}
          onRetry={() => {
            loadData();
            loadEvents(selectedCategory);
          }}
        />
      </View>
    );
  }

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi günler';
    return 'İyi akşamlar';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* ─── Header ─── */}
        <LinearGradient
          colors={[theme.surface, theme.background]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={[styles.greeting, { color: theme.textSecondary }]}>{greeting()}, 👋</Text>
              <Text style={[styles.userName, { color: theme.text }]}>{user?.name || 'Kullanıcı'}</Text>
            </View>
          </View>

          {/* Search Bar with Input & Submit */}
          <View style={[styles.searchBar, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
            <TouchableOpacity onPress={handleSearchSubmit}>
              <Text style={styles.searchIcon}>🔍</Text>
            </TouchableOpacity>
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Etkinlik, şehir veya sanatçı ara..."
              placeholderTextColor={theme.textTertiary}
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={handleSearchSubmit} style={[styles.searchSubmitBtn, { backgroundColor: theme.primary }]}>
                <Text style={styles.searchSubmitBtnText}>Ara</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        {/* ─── Featured Carousel ─── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>✨ Öne Çıkanlar</Text>
            <Text style={[styles.sectionCount, { color: theme.textTertiary }]}>{featured.length} etkinlik</Text>
          </View>

          {loadingFeatured ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.carousel}
            >
              {[1, 2, 3].map((i) => (
                <FeaturedCardSkeleton key={i} />
              ))}
            </ScrollView>
          ) : (
            <FlatList
              data={featured}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.carouselContent}
              renderItem={({ item }) => (
                <FeaturedEventCard
                  event={item}
                  onPress={handleEventPress}
                  width={SCREEN_WIDTH * 0.82}
                />
              )}
            />
          )}
        </View>

        {/* ─── Upcoming Events (⏰ Yaklaşan Etkinlikler) ─── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>⏰ Yaklaşan Etkinlikler</Text>
              <View style={styles.upcomingLiveBadge}>
                <Text style={styles.upcomingLiveBadgeText}>YAKINDA</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('EventList', {
                  sort: 'date',
                  title: '⏰ Yaklaşan Etkinlikler',
                })
              }
              activeOpacity={0.7}
            >
              <Text
                style={{
                  ...Typography.styles.bodySmall,
                  color: theme.primary,
                  fontWeight: '600',
                }}
              >
                Tümünü Gör ({upcoming.length}) →
              </Text>
            </TouchableOpacity>
          </View>

          {loadingUpcoming ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.carousel}
            >
              {[1, 2, 3].map((i) => (
                <FeaturedCardSkeleton key={i} />
              ))}
            </ScrollView>
          ) : (
            <FlatList
              data={upcoming}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => `upcoming-${item.id}`}
              contentContainerStyle={styles.carouselContent}
              renderItem={({ item }) => (
                <UpcomingEventCard
                  event={item}
                  onPress={handleEventPress}
                />
              )}
            />
          )}
        </View>

        {/* ─── Popular Events (🔥 Popüler Etkinlikler) ─── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>🔥 Popüler Etkinlikler</Text>
              <View style={styles.trendingBadge}>
                <Text style={styles.trendingBadgeText}>TREND</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('EventList', {
                  sort: 'popularity',
                  title: '🔥 Popüler Etkinlikler',
                })
              }
              activeOpacity={0.7}
            >
              <Text
                style={{
                  ...Typography.styles.bodySmall,
                  color: theme.primary,
                  fontWeight: '600',
                }}
              >
                Tümünü Gör ({popular.length}) →
              </Text>
            </TouchableOpacity>
          </View>

          {loadingPopular ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.carousel}
            >
              {[1, 2, 3].map((i) => (
                <FeaturedCardSkeleton key={i} />
              ))}
            </ScrollView>
          ) : (
            <FlatList
              data={popular}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => `popular-${item.id}`}
              contentContainerStyle={styles.carouselContent}
              renderItem={({ item, index }) => (
                <PopularEventCard
                  event={item}
                  rank={index + 1}
                  onPress={handleEventPress}
                />
              )}
            />
          )}
        </View>

        {/* ─── Category Chips ─── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>🏷️ Kategoriler</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            <CategoryChip
              name="Tümü"
              icon="🌟"
              isSelected={selectedCategory === null}
              onPress={() => setSelectedCategory(null)}
            />

            {categories.map((cat) => (
              <CategoryChip
                key={cat.id}
                name={cat.name}
                icon={cat.icon}
                color={cat.color}
                count={cat._count?.events}
                isSelected={selectedCategory === cat.name}
                onPress={() =>
                  setSelectedCategory(cat.name === selectedCategory ? null : cat.name)
                }
              />
            ))}
          </ScrollView>
        </View>

        {/* ─── Events List ─── */}
        <View style={[styles.section, { paddingBottom: Spacing['2xl'] }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {selectedCategory ? `📌 ${selectedCategory}` : '🎭 Tüm Etkinlikler'}
            </Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('EventList', {
                  category: selectedCategory ?? undefined,
                  title: selectedCategory
                    ? `${selectedCategory} Etkinlikleri`
                    : 'Tüm Etkinlikler',
                })
              }
              activeOpacity={0.7}
            >
              <Text
                style={{
                  ...Typography.styles.bodySmall,
                  color: theme.primary,
                  fontWeight: '600',
                }}
              >
                Tümünü Gör ({events.length}) →
              </Text>
            </TouchableOpacity>
          </View>

          {loadingEvents ? (
            <ListSkeleton count={3} />
          ) : events.length === 0 ? (
            <EmptyState
              title="Etkinlik Bulunamadı"
              message={`${selectedCategory || 'Bu kriterlere uygun'} etkinlik bulunmuyor.`}
              icon="📅"
              action={
                selectedCategory
                  ? { title: 'Tümünü Göster', onPress: () => setSelectedCategory(null) }
                  : undefined
              }
            />
          ) : (
            events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onPress={handleEventPress}
                onFavoritePress={handleFavoritePress}
                isFavorited={favorites.has(event.id)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* ─── Chatbot FAB ─── */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Chatbot')}
        activeOpacity={0.85}
        style={[styles.fab, { backgroundColor: theme.primary }]}
      >
        <Text style={styles.fabIcon}>💬</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  fab: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.base,
    width: 58,
    height: 58,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.primary,
    zIndex: 100,
  },
  fabIcon: {
    fontSize: 26,
  },
  header: {
    paddingTop: Spacing['3xl'],
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.base,
  },
  greeting: { ...Typography.styles.bodySmall, color: Colors.textSecondary },
  userName: { ...Typography.styles.h3, color: Colors.text, fontWeight: '700' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface2,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.base,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  searchIcon: { fontSize: 18 },
  searchInput: {
    flex: 1,
    ...Typography.styles.body,
    color: Colors.text,
    paddingVertical: 0,
  },
  searchSubmitBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
  },
  searchSubmitBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  section: { paddingHorizontal: Spacing.base, marginTop: Spacing.xl },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: { ...Typography.styles.h5, color: Colors.text, fontWeight: '700' },
  sectionCount: { ...Typography.styles.caption, color: Colors.textTertiary },
  trendingBadge: {
    backgroundColor: '#FF3B3022',
    borderColor: '#FF3B3066',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  trendingBadgeText: {
    color: '#FF3B30',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  upcomingLiveBadge: {
    backgroundColor: '#00F5A022',
    borderColor: '#00F5A066',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  upcomingLiveBadgeText: {
    color: '#00F5A0',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  carousel: { marginHorizontal: -Spacing.base },
  carouselContent: { paddingHorizontal: Spacing.base },
  categoryScroll: { marginHorizontal: -Spacing.base },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface2,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    marginLeft: Spacing.base,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 6,
  },
  categoryChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryTransparent,
  },
  categoryChipIcon: { fontSize: 16 },
  categoryChipText: { ...Typography.styles.label, color: Colors.textSecondary },
  categoryChipTextActive: { color: Colors.primary },
  categoryCount: {
    ...Typography.styles.caption,
    color: Colors.textTertiary,
    backgroundColor: Colors.surface3,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
});

export default HomeScreen;
