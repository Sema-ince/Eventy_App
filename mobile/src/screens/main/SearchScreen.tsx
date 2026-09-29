import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { eventsService, favoritesService } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { EventCard } from '../../components/events/EventCard';
import { ListSkeleton } from '../../components/common/Skeleton';
import { EmptyState, ErrorState } from '../../components/common/StateViews';
import { Typography, Spacing, BorderRadius } from '../../constants/typography';
import type { Event, SearchStackParamList } from '../../types';

type NavProp = NativeStackNavigationProp<SearchStackParamList, 'SearchScreen'>;
type RoutePropType = RouteProp<SearchStackParamList, 'SearchScreen'>;

const SearchScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const { theme, isDark } = useTheme();
  const initialQuery = route.params?.initialQuery ?? '';

  const [query, setQuery] = useState(initialQuery);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [hasSearched, setHasSearched] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Load favorites on mount
    favoritesService.getFavorites().then((f) => setFavorites(new Set(f.map((e) => e.id)))).catch(() => {});
  }, []);

  // If navigated with an initial query, trigger search
  useEffect(() => {
    if (route.params?.initialQuery) {
      setQuery(route.params.initialQuery);
      search(route.params.initialQuery);
    }
  }, [route.params?.initialQuery]);

  const search = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setEvents([]);
        setHasSearched(false);
        return;
      }
      setLoading(true);
      setError(null);
      setHasSearched(true);
      try {
        const { events: data } = await eventsService.getEvents({
          search: searchQuery.trim(),
          sort: 'date',
          limit: 50,
        });
        setEvents(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Arama yapılamadı');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleQueryChange = (text: string) => {
    setQuery(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => search(text), 500);
  };

  const handleFavoritePress = async (event: Event) => {
    const isFav = favorites.has(event.id);
    try {
      if (isFav) {
        await favoritesService.removeFavorite(event.id);
        setFavorites((prev) => { const s = new Set(prev); s.delete(event.id); return s; });
      } else {
        await favoritesService.addFavorite(event.id);
        setFavorites((prev) => new Set(prev).add(event.id));
      }
    } catch (e) {
      Alert.alert('Hata', e instanceof Error ? e.message : 'Bir hata oluştu');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.surface}
      />

      {/* ─── Search Header ─── */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        {/* Title row with magnifying glass icon */}
        <View style={styles.titleRow}>
          <View style={[styles.titleIconContainer, { backgroundColor: theme.primaryTransparent }]}>
            <Text style={[styles.titleIcon, { color: theme.primary }]}>⌕</Text>
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Keşfet</Text>
            <Text style={[styles.headerSubtitle, { color: theme.textTertiary }]}>
              Etkinlik, şehir veya kategori ara
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
          <Text style={[styles.searchIcon, { color: theme.primary }]}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Etkinlik, şehir veya sanatçı..."
            placeholderTextColor={theme.textTertiary}
            value={query}
            onChangeText={handleQueryChange}
            autoFocus={false}
            returnKeyType="search"
            onSubmitEditing={() => search(query)}
            selectionColor={theme.primary}
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => { setQuery(''); setEvents([]); setHasSearched(false); }}
            >
              <Text style={[styles.clearIcon, { color: theme.textTertiary }]}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ─── Results ─── */}
      <ScrollView
        style={styles.results}
        contentContainerStyle={styles.resultsContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {loading ? (
          <ListSkeleton count={4} />
        ) : error ? (
          <ErrorState message={error} onRetry={() => search(query)} />
        ) : !hasSearched ? (
          <EmptyState
            title="Ne arıyorsun?"
            message="Etkinlik adı, şehir, kategori veya sanatçı adıyla arama yapabilirsin."
            icon="🎯"
          />
        ) : events.length === 0 ? (
          <EmptyState
            title="Sonuç Bulunamadı"
            message={`"${query}" için etkinlik bulunamadı. Farklı bir arama deneyin.`}
            icon="🔭"
          />
        ) : (
          <>
            <Text style={[styles.resultCount, { color: theme.textSecondary }]}>
              {events.length} sonuç bulundu
            </Text>
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onPress={(e) => navigation.navigate('EventDetail', { eventId: e.id })}
                onFavoritePress={handleFavoritePress}
                isFavorited={favorites.has(event.id)}
              />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: Spacing['3xl'],
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.base,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  titleIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleIcon: {
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 30,
  },
  headerTitle: {
    ...Typography.styles.h3,
    fontWeight: '800',
    lineHeight: 24,
  },
  headerSubtitle: {
    ...Typography.styles.caption,
    marginTop: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.base,
    borderWidth: 1.5,
    gap: Spacing.sm,
  },
  searchIcon: { fontSize: 17 },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    ...Typography.styles.body,
  },
  clearIcon: { fontSize: 16, padding: 4 },
  results: { flex: 1 },
  resultsContent: { padding: Spacing.base, paddingBottom: Spacing['3xl'] },
  resultCount: {
    ...Typography.styles.bodySmall,
    marginBottom: Spacing.md,
  },
});

export default SearchScreen;
