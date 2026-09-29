import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  StatusBar,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { favoritesService } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { EventCard } from '../../components/events/EventCard';
import { ListSkeleton } from '../../components/common/Skeleton';
import { EmptyState, ErrorState } from '../../components/common/StateViews';
import Colors from '../../constants/colors';
import { Typography, Spacing } from '../../constants/typography';
import type { Event, FavoritesStackParamList } from '../../types';

type NavProp = NativeStackNavigationProp<FavoritesStackParamList, 'FavoritesScreen'>;

const FavoritesScreen = () => {
  const navigation = useNavigation<NavProp>();
  const { theme, isDark } = useTheme();
  const [favorites, setFavorites] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFavorites = useCallback(async () => {
    setError(null);
    try {
      const data = await favoritesService.getFavorites();
      setFavorites(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Favoriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadFavorites(); }, [loadFavorites]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  }, [loadFavorites]);

  const handleRemoveFavorite = async (event: Event) => {
    Alert.alert(
      'Favoriden Çıkar',
      `"${event.title}" favorilerinizden çıkarılsın mı?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkar',
          style: 'destructive',
          onPress: async () => {
            try {
              await favoritesService.removeFavorite(event.id);
              setFavorites((prev) => prev.filter((e) => e.id !== event.id));
            } catch (e) {
              Alert.alert('Hata', e instanceof Error ? e.message : 'Bir hata oluştu');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.surface}
      />
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>❤️ Favorilerim</Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          {favorites.length} etkinlik kayıtlı
        </Text>
      </View>

      {loading ? (
        <View style={{ padding: Spacing.base }}>
          <ListSkeleton count={3} />
        </View>
      ) : error ? (
        <ErrorState message={error} onRetry={loadFavorites} />
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
          }
          ListEmptyComponent={
            <EmptyState
              title="Favori Yok"
              message="Etkinlik detay sayfasından ❤️ butonuna basarak favorilerine ekleyebilirsin."
              icon="❤️"
            />
          }
          renderItem={({ item }) => (
            <EventCard
              event={item}
              onPress={(e) => navigation.navigate('EventDetail', { eventId: e.id })}
              onFavoritePress={handleRemoveFavorite}
              isFavorited={true}
            />
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: Spacing['3xl'],
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl,
    borderBottomWidth: 1,
  },
  headerTitle: { ...Typography.styles.h3, fontWeight: '700' },
  headerSubtitle: { ...Typography.styles.bodySmall, marginTop: 4 },
  listContent: { padding: Spacing.base, paddingBottom: Spacing['3xl'] },
});

export default FavoritesScreen;
