import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { eventsService, favoritesService } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { EventCard } from '../../components/events/EventCard';
import { CategoryChip } from '../../components/categories/CategoryChip';
import { ListSkeleton } from '../../components/common/Skeleton';
import { EmptyState, ErrorState } from '../../components/common/StateViews';
import Colors from '../../constants/colors';
import { Typography, Spacing, BorderRadius } from '../../constants/typography';
import type { Event, Category, HomeStackParamList } from '../../types';

type NavProp = NativeStackNavigationProp<HomeStackParamList, 'EventList'>;
type RoutePropType = RouteProp<HomeStackParamList, 'EventList'>;

const SORT_OPTIONS = [
  { label: '📅 Tarih', value: 'date' },
  { label: '🔥 Popüler', value: 'popularity' },
  { label: '💰 Fiyat', value: 'price' },
  { label: '✨ Yeni', value: 'newest' },
];

const PAGE_LIMIT = 8;

const EventListScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const { theme, isDark } = useTheme();

  const initialCategory = route.params?.category ?? null;
  const initialTitle = route.params?.title;
  const initialSort = route.params?.sort ?? 'date';

  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [selectedSort, setSelectedSort] = useState<string>(initialSort);

  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Ref to prevent overlapping fetches
  const isFetchingRef = useRef(false);

  // Load Categories & Favorites on mount
  useEffect(() => {
    eventsService.getCategories().then(setCategories).catch(() => {});
    favoritesService
      .getFavorites()
      .then((favs) => setFavorites(new Set(favs.map((e) => e.id))))
      .catch(() => {});
  }, []);

  // Fetch Events with pagination
  const fetchEvents = useCallback(
    async (
      targetPage: number,
      categoryFilter: string | null,
      sortBy: string,
      isRefresh: boolean = false
    ) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      if (targetPage === 1 && !isRefresh) {
        setLoading(true);
      } else if (targetPage > 1) {
        setLoadingMore(true);
      }

      setError(null);

      try {
        const response = await eventsService.getEvents({
          category: categoryFilter || undefined,
          sort: sortBy,
          page: targetPage,
          limit: PAGE_LIMIT,
        });

        const newEvents = response.events;
        const meta = response.meta;

        setTotalCount(meta.total);
        setTotalPages(meta.totalPages);
        setHasMore(targetPage < meta.totalPages);
        setPage(targetPage);

        if (targetPage === 1) {
          setEvents(newEvents);
        } else {
          setEvents((prev) => {
            // Deduplicate by ID
            const existingIds = new Set(prev.map((e) => e.id));
            const uniqueIncoming = newEvents.filter((e) => !existingIds.has(e.id));
            return [...prev, ...uniqueIncoming];
          });
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Etkinlikler yüklenirken hata oluştu');
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
        isFetchingRef.current = false;
      }
    },
    []
  );

  // Initial fetch & refetch on filter change
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchEvents(1, selectedCategory, selectedSort);
  }, [selectedCategory, selectedSort, fetchEvents]);

  // Infinite scroll trigger
  const handleLoadMore = useCallback(() => {
    if (!loading && !loadingMore && hasMore && !isFetchingRef.current) {
      fetchEvents(page + 1, selectedCategory, selectedSort);
    }
  }, [loading, loadingMore, hasMore, page, selectedCategory, selectedSort, fetchEvents]);

  // Pull to refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    fetchEvents(1, selectedCategory, selectedSort, true);
  }, [selectedCategory, selectedSort, fetchEvents]);

  // Filter change handlers
  const handleCategoryChange = (categoryName: string | null) => {
    if (selectedCategory === categoryName) return;
    setSelectedCategory(categoryName);
  };

  const handleSortChange = (sortValue: string) => {
    if (selectedSort === sortValue) return;
    setSelectedSort(sortValue);
  };

  const handleEventPress = (event: Event) => {
    navigation.navigate('EventDetail', { eventId: event.id });
  };

  const handleFavoritePress = async (event: Event) => {
    const isFav = favorites.has(event.id);
    try {
      if (isFav) {
        await favoritesService.removeFavorite(event.id);
        setFavorites((prev) => {
          const next = new Set(prev);
          next.delete(event.id);
          return next;
        });
      } else {
        await favoritesService.addFavorite(event.id);
        setFavorites((prev) => new Set(prev).add(event.id));
      }
    } catch {
      // Revert if failed
    }
  };

  // Header Title
  const screenTitle =
    initialTitle ||
    (selectedCategory ? `${selectedCategory} Etkinlikleri` : 'Tüm Etkinlikler');

  // List Footer Component
  const renderFooter = () => {
    if (loadingMore) {
      return (
        <View style={styles.footerLoading}>
          <ActivityIndicator size="small" color={theme.primary} />
          <Text style={[styles.footerLoadingText, { color: theme.textSecondary }]}>Daha fazla etkinlik yükleniyor...</Text>
        </View>
      );
    }

    if (!hasMore && events.length > 0) {
      return (
        <View style={styles.endOfList}>
          <View style={[styles.endLine, { backgroundColor: theme.border }]} />
          <Text style={[styles.endText, { color: theme.textTertiary }]}>Tüm etkinlikler gösterildi ✨</Text>
          <View style={[styles.endLine, { backgroundColor: theme.border }]} />
        </View>
      );
    }

    return null;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.surface}
      />

      {/* ─── Top Bar ─── */}
      <View style={[styles.topBar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: theme.surface2, borderColor: theme.border }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.backBtnText, { color: theme.text }]}>←</Text>
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={[styles.topBarTitle, { color: theme.text }]} numberOfLines={1}>
            {screenTitle}
          </Text>
          <Text style={[styles.topBarCount, { color: theme.textSecondary }]}>
            {totalCount} etkinlik bulundu
          </Text>
        </View>

        <View style={{ width: 38 }} />
      </View>

      {/* ─── Filter & Sorting Header ─── */}
      <View style={[styles.filtersWrapper, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          <CategoryChip
            name="Tümü"
            icon="🌟"
            isSelected={selectedCategory === null}
            onPress={() => handleCategoryChange(null)}
          />

          {categories.map((cat) => (
            <CategoryChip
              key={cat.id}
              name={cat.name}
              icon={cat.icon}
              color={cat.color}
              isSelected={selectedCategory === cat.name}
              onPress={() => handleCategoryChange(cat.name)}
            />
          ))}
        </ScrollView>

        {/* Sort options horizontal pills */}
        <View style={styles.sortContainer}>
          <Text style={[styles.sortLabel, { color: theme.textTertiary }]}>Sırala:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sortScroll}
          >
            {SORT_OPTIONS.map((opt) => {
              const isActive = selectedSort === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => handleSortChange(opt.value)}
                  style={[
                    styles.sortPill,
                    {
                      backgroundColor: isActive ? theme.primaryTransparent : theme.surface2,
                      borderColor: isActive ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.sortPillText,
                      { color: isActive ? theme.primary : theme.textSecondary },
                      isActive && styles.sortPillTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* ─── Main Content List ─── */}
      {error && events.length === 0 ? (
        <ErrorState message={error} onRetry={() => fetchEvents(1, selectedCategory, selectedSort)} />
      ) : loading && events.length === 0 ? (
        <View style={{ padding: Spacing.base }}>
          <ListSkeleton count={4} />
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EventCard
              event={item}
              onPress={handleEventPress}
              onFavoritePress={handleFavoritePress}
              isFavorited={favorites.has(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <EmptyState
              title="Etkinlik Bulunamadı"
              message={
                selectedCategory
                  ? `"${selectedCategory}" kategorisinde henüz etkinlik yok.`
                  : 'Aradığınız kriterlere uygun etkinlik bulunmuyor.'
              }
              icon="🎭"
              action={
                selectedCategory
                  ? { title: 'Filtreyi Temizle', onPress: () => handleCategoryChange(null) }
                  : undefined
              }
            />
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.primary}
              colors={[theme.primary]}
            />
          }
        />
      )}
    </View>
  );
};

export default EventListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 54 : Spacing['2xl'],
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  backBtnText: {
    fontSize: 20,
    lineHeight: 22,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  topBarTitle: {
    ...Typography.styles.h4,
    fontWeight: '700',
  },
  topBarCount: {
    ...Typography.styles.caption,
    marginTop: 2,
  },
  filtersWrapper: {
    borderBottomWidth: 1,
    paddingBottom: Spacing.sm,
  },
  categoryScroll: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.xs,
  },
  sortLabel: {
    ...Typography.styles.caption,
    fontWeight: '600',
    marginRight: Spacing.sm,
  },
  sortScroll: {
    gap: Spacing.xs,
  },
  sortPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  sortPillText: {
    ...Typography.styles.caption,
  },
  sortPillTextActive: {
    fontWeight: '700',
  },
  listContent: {
    padding: Spacing.base,
    paddingBottom: Spacing['3xl'],
  },
  footerLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  footerLoadingText: {
    ...Typography.styles.caption,
  },
  endOfList: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  endLine: {
    flex: 1,
    height: 1,
  },
  endText: {
    ...Typography.styles.caption,
    paddingHorizontal: Spacing.sm,
  },
});
