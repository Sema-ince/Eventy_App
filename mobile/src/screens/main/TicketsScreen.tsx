import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ticketsService } from '../../services/api';
import { TicketCard } from '../../components/tickets/TicketCard';
import { ListSkeleton } from '../../components/common/Skeleton';
import { EmptyState, ErrorState } from '../../components/common/StateViews';
import Colors from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { Typography, Spacing } from '../../constants/typography';
import type { Ticket, TicketsStackParamList } from '../../types';

type NavProp = NativeStackNavigationProp<TicketsStackParamList, 'TicketsScreen'>;

type TabType = 'active' | 'past';

const TicketsScreen = () => {
  const navigation = useNavigation<NavProp>();
  const { theme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [activeTickets, setActiveTickets] = useState<Ticket[]>([]);
  const [pastTickets, setPastTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTickets = useCallback(async () => {
    setError(null);
    try {
      const data = await ticketsService.getMyTickets();
      setActiveTickets(data.active);
      setPastTickets(data.past);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Biletler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTickets();
    setRefreshing(false);
  }, [loadTickets]);

  const displayedTickets = activeTab === 'active' ? activeTickets : pastTickets;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.surface}
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>🎫 Biletlerim</Text>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            onPress={() => setActiveTab('active')}
            style={[styles.tab, activeTab === 'active' && { borderBottomColor: theme.primary }]}
          >
            <Text style={[styles.tabText, { color: activeTab === 'active' ? theme.primary : theme.textSecondary }, activeTab === 'active' && styles.tabTextActive]}>
              Aktif ({activeTickets.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('past')}
            style={[styles.tab, activeTab === 'past' && { borderBottomColor: theme.primary }]}
          >
            <Text style={[styles.tabText, { color: activeTab === 'past' ? theme.primary : theme.textSecondary }, activeTab === 'past' && styles.tabTextActive]}>
              Geçmiş ({pastTickets.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={{ padding: Spacing.base }}>
          <ListSkeleton count={3} />
        </View>
      ) : error ? (
        <ErrorState message={error} onRetry={loadTickets} />
      ) : (
        <FlatList
          data={displayedTickets}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title={activeTab === 'active' ? 'Aktif Bilet Yok' : 'Geçmiş Bilet Yok'}
              message={
                activeTab === 'active'
                  ? 'Henüz aktif biletiniz bulunmuyor. Etkinlik detayından bilet satın alabilirsiniz.'
                  : 'Geçmiş biletiniz bulunmuyor.'
              }
              icon="🎟️"
            />
          }
          renderItem={({ item }) => (
            <TicketCard
              ticket={item}
              onPress={(t) => navigation.navigate('TicketDetail', { ticketId: t.id })}
            />
          )}
        />
      )}
    </View>
  );
};

export default TicketsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingTop: Spacing['3xl'],
    paddingHorizontal: Spacing.base,
    paddingBottom: 0,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    ...Typography.styles.h3,
    color: Colors.text,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  tabs: {
    flexDirection: 'row',
    gap: 0,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: { ...Typography.styles.label, color: Colors.textSecondary },
  tabTextActive: { color: Colors.primary, fontWeight: '700' },
  listContent: { padding: Spacing.base, paddingBottom: Spacing['3xl'] },
});
