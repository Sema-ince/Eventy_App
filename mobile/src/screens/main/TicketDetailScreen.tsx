import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Image,
  Dimensions,
  TouchableOpacity,
  Modal,
  Share,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import QRCode from 'react-native-qrcode-svg';
import { ticketsService } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { Skeleton } from '../../components/common/Skeleton';
import { ErrorState } from '../../components/common/StateViews';
import Colors from '../../constants/colors';
import { Typography, Spacing, BorderRadius, Shadows } from '../../constants/typography';
import { LinearGradient } from 'expo-linear-gradient';
import type { Ticket, TicketsStackParamList } from '../../types';

type NavProp = NativeStackNavigationProp<TicketsStackParamList, 'TicketDetail'>;
type RouteType = RouteProp<TicketsStackParamList, 'TicketDetail'>;

interface DecodedQrPayload {
  ticketNumber?: string;
  event?: {
    id?: string;
    title?: string;
    date?: string;
    location?: string;
  };
  attendee?: {
    id?: string;
    name?: string;
    email?: string;
  };
  quantity?: number;
  issuedAt?: string;
  verifyUrl?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
  ACTIVE: { label: 'Aktif Bilet', color: Colors.success, icon: '✅' },
  USED: { label: 'Kullanıldı', color: Colors.textTertiary, icon: '✔️' },
  CANCELLED: { label: 'İptal Edildi', color: Colors.error, icon: '❌' },
  EXPIRED: { label: 'Süresi Doldu', color: Colors.warning, icon: '⚠️' },
};

const TicketDetailScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteType>();
  const { theme, isDark } = useTheme();
  const { ticketId } = route.params;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);

  const loadTicket = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ticketsService.getTicketById(ticketId);
      setTicket(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Bilet yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => { loadTicket(); }, [loadTicket]);

  const decodedQr = useMemo<DecodedQrPayload | null>(() => {
    if (!ticket?.qrCode) return null;
    try {
      return JSON.parse(ticket.qrCode);
    } catch {
      return null;
    }
  }, [ticket?.qrCode]);

  const handleShareQrData = useCallback(async () => {
    if (!ticket) return;
    try {
      await Share.share({
        title: `Bilet: ${ticket.ticketNumber}`,
        message: ticket.qrCode,
      });
    } catch (err) {
      console.warn('Share error:', err);
    }
  }, [ticket]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={{ padding: Spacing.base, paddingTop: Spacing['3xl'] }}>
          <Skeleton height={300} style={{ marginBottom: Spacing.md }} />
          <Skeleton height={200} />
        </View>
      </View>
    );
  }

  if (error || !ticket) {
    return <ErrorState message={error || 'Bilet bulunamadı'} onRetry={loadTicket} />;
  }

  const status = statusConfig[ticket.status] || statusConfig.ACTIVE;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.surface}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Back button */}
        <View style={[styles.topBar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 60 }}>
            <Text style={[styles.backBtn, { color: theme.primary }]}>← Geri</Text>
          </TouchableOpacity>
          <Text style={[styles.topBarTitle, { color: theme.text }]}>Bilet Detayı</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* ─── Ticket Card ─── */}
        <View style={[styles.ticketCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {/* Event Image */}
          <Image
            source={{ uri: ticket.event.imageUrl }}
            style={styles.eventImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', theme.surface]}
            style={styles.imageGradient}
          />

          {/* Status banner */}
          <View style={[styles.statusBanner, { backgroundColor: status.color }]}>
            <Text style={styles.statusText}>{status.icon} {status.label}</Text>
          </View>

          {/* Event info */}
          <View style={styles.eventInfo}>
            <View style={[styles.categoryBadge, { backgroundColor: (ticket.event.category?.color || theme.primary) + '33' }]}>
              <Text style={styles.catIcon}>{ticket.event.category?.icon}</Text>
              <Text style={[styles.catText, { color: ticket.event.category?.color || theme.primary }]}>
                {ticket.event.category?.name}
              </Text>
            </View>
            <Text style={[styles.eventTitle, { color: theme.text }]}>{ticket.event.title}</Text>
            <Text style={[styles.eventMeta, { color: theme.textSecondary }]}>📅 {formatDate(ticket.event.date)}</Text>
            <Text style={[styles.eventMeta, { color: theme.textSecondary }]}>📍 {ticket.event.location || ticket.event.address}</Text>
          </View>

          {/* Dashed divider */}
          <View style={styles.dashedDivider}>
            <View style={[styles.dashedLine, { borderColor: theme.border }]} />
            <View style={[styles.cutCircle, { left: -16, backgroundColor: theme.background }]} />
            <View style={[styles.cutCircle, { right: -16, backgroundColor: theme.background }]} />
          </View>

          {/* QR Code section */}
          <View style={styles.qrSection}>
            <Text style={[styles.qrLabel, { color: theme.text }]}>🔍 Giriş QR Kodu</Text>
            <View style={styles.qrContainer}>
              <QRCode
                value={ticket.qrCode}
                size={SCREEN_WIDTH * 0.55}
                backgroundColor="#FFFFFF"
                color="#000000"
              />
            </View>
            <Text style={[styles.ticketNumberText, { color: theme.textSecondary }]}>
              {ticket.ticketNumber}
            </Text>
            <Text style={[styles.scanHint, { color: theme.textTertiary }]}>
              Etkinlik girişinde bu QR kodu okutunuz
            </Text>

            {/* View QR Payload Details Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.inspectBtn, { backgroundColor: theme.surface2, borderColor: theme.border }]}
              onPress={() => setShowQrModal(true)}
            >
              <Text style={[styles.inspectBtnText, { color: theme.primary }]}>📋 QR Kod Detaylarını Gör</Text>
            </TouchableOpacity>
          </View>

          {/* Dashed divider */}
          <View style={styles.dashedDivider}>
            <View style={[styles.dashedLine, { borderColor: theme.border }]} />
            <View style={[styles.cutCircle, { left: -16, backgroundColor: theme.background }]} />
            <View style={[styles.cutCircle, { right: -16, backgroundColor: theme.background }]} />
          </View>

          {/* Ticket details */}
          <View style={styles.detailsSection}>
            <View style={[styles.detailRow, { borderBottomColor: theme.border }]}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Katılımcı</Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>{ticket.user?.name || decodedQr?.attendee?.name || 'Bilinmiyor'}</Text>
            </View>
            <View style={[styles.detailRow, { borderBottomColor: theme.border }]}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Adet</Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>{ticket.quantity} bilet</Text>
            </View>
            <View style={[styles.detailRow, { borderBottomColor: theme.border }]}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Toplam Ücret</Text>
              <Text style={[styles.detailValue, { color: theme.accent || Colors.secondary, fontWeight: '700' }]}>
                {ticket.totalPrice.toLocaleString('tr-TR')} TRY
              </Text>
            </View>
            <View style={[styles.detailRow, { borderBottomColor: theme.border }]}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Satın Alma Tarihi</Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>{formatDate(ticket.purchasedAt)}</Text>
            </View>
            <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Organizatör</Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>{ticket.event.organizerName || 'Evently'}</Text>
            </View>
          </View>
        </View>

        {/* Disclaimer */}
        <Text style={[styles.disclaimer, { color: theme.textTertiary }]}>
          ⚠️ Bu bilet kişiye özeldir ve devredilemez. Yalnızca bir kez kullanılabilir.
        </Text>
      </ScrollView>

      {/* ─── QR Code Inspection Modal ─── */}
      <Modal
        visible={showQrModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowQrModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <View>
                <Text style={[styles.modalTitle, { color: theme.text }]}>QR Kod Dijital Verisi</Text>
                <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>Kriptografik Bilet & Katılımcı Kimliği</Text>
              </View>
              <TouchableOpacity onPress={() => setShowQrModal(false)} style={[styles.modalCloseBtn, { backgroundColor: theme.surface2 }]}>
                <Text style={[styles.modalCloseText, { color: theme.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
              <View style={[styles.modalDataBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <View style={[styles.modalRow, { borderBottomColor: theme.border }]}>
                  <Text style={[styles.modalRowKey, { color: theme.textSecondary }]}>Bilet No:</Text>
                  <Text style={[styles.modalRowValHighlight, { color: theme.primary }]}>{ticket.ticketNumber}</Text>
                </View>
                <View style={[styles.modalRow, { borderBottomColor: theme.border }]}>
                  <Text style={[styles.modalRowKey, { color: theme.textSecondary }]}>Etkinlik:</Text>
                  <Text style={[styles.modalRowVal, { color: theme.text }]}>{decodedQr?.event?.title || ticket.event.title}</Text>
                </View>
                <View style={[styles.modalRow, { borderBottomColor: theme.border }]}>
                  <Text style={[styles.modalRowKey, { color: theme.textSecondary }]}>Tarih & Saat:</Text>
                  <Text style={[styles.modalRowVal, { color: theme.text }]}>{formatDate(decodedQr?.event?.date || ticket.event.date)}</Text>
                </View>
                <View style={[styles.modalRow, { borderBottomColor: theme.border }]}>
                  <Text style={[styles.modalRowKey, { color: theme.textSecondary }]}>Konum:</Text>
                  <Text style={[styles.modalRowVal, { color: theme.text }]}>{decodedQr?.event?.location || ticket.event.location || ticket.event.address}</Text>
                </View>
                <View style={[styles.modalRow, { borderBottomColor: theme.border }]}>
                  <Text style={[styles.modalRowKey, { color: theme.textSecondary }]}>Katılımcı:</Text>
                  <Text style={[styles.modalRowVal, { color: theme.text }]}>
                    {decodedQr?.attendee?.name || ticket.user?.name || 'Kayıtlı Kullanıcı'}
                    {decodedQr?.attendee?.email ? ` (${decodedQr.attendee.email})` : ''}
                  </Text>
                </View>
                <View style={[styles.modalRow, { borderBottomColor: theme.border }]}>
                  <Text style={[styles.modalRowKey, { color: theme.textSecondary }]}>Adet / Kapasite:</Text>
                  <Text style={[styles.modalRowVal, { color: theme.text }]}>{decodedQr?.quantity || ticket.quantity} Kişilik</Text>
                </View>
                <View style={[styles.modalRow, { borderBottomWidth: 0 }]}>
                  <Text style={[styles.modalRowKey, { color: theme.textSecondary }]}>Doğrulama URL:</Text>
                  <Text style={[styles.modalRowVal, { color: theme.primary }]} numberOfLines={1}>
                    {decodedQr?.verifyUrl || `https://evently.app/verify/${ticket.ticketNumber}`}
                  </Text>
                </View>
              </View>

              {/* Raw JSON section */}
              <Text style={[styles.rawJsonHeader, { color: theme.textSecondary }]}>Ham QR Verisi (JSON Payload)</Text>
              <View style={[styles.rawJsonBox, { backgroundColor: isDark ? '#0a0d14' : '#F4F4F8', borderColor: theme.border }]}>
                <Text style={[styles.rawJsonText, { color: isDark ? '#38bdf8' : '#0284c7' }]}>
                  {JSON.stringify(decodedQr || { qr: ticket.qrCode }, null, 2)}
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.shareBtn, { backgroundColor: theme.primary }]}
                onPress={handleShareQrData}
              >
                <Text style={styles.shareBtnText}>📤 Paylaş / Kopyala</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.closeBtn, { backgroundColor: theme.background, borderColor: theme.border }]}
                onPress={() => setShowQrModal(false)}
              >
                <Text style={[styles.closeBtnText, { color: theme.textSecondary }]}>Kapat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: Spacing['3xl'] },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  backBtn: { ...Typography.styles.body, fontWeight: '600' },
  topBarTitle: { ...Typography.styles.h5, fontWeight: '700' },
  ticketCard: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing.base,
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    ...Shadows.lg,
    borderWidth: 1,
  },
  eventImage: { width: '100%', height: 160 },
  imageGradient: { position: 'absolute', top: 100, left: 0, right: 0, height: 80 },
  statusBanner: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: BorderRadius.md,
  },
  statusText: { ...Typography.styles.label, color: '#fff', fontWeight: '700' },
  eventInfo: { padding: Spacing.base },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 5,
    marginBottom: Spacing.sm,
  },
  catIcon: { fontSize: 14 },
  catText: { ...Typography.styles.caption, fontWeight: '700' },
  eventTitle: { ...Typography.styles.h4, fontWeight: '700', marginBottom: Spacing.sm },
  eventMeta: { ...Typography.styles.bodySmall, marginBottom: 4 },
  dashedDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    position: 'relative',
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginHorizontal: Spacing.base,
  },
  cutCircle: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  qrSection: { alignItems: 'center', padding: Spacing.xl },
  qrLabel: { ...Typography.styles.h5, fontWeight: '700', marginBottom: Spacing.md },
  qrContainer: {
    padding: Spacing.base,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    ...Shadows.md,
  },
  ticketNumberText: {
    ...Typography.styles.label,
    fontFamily: 'monospace',
    marginTop: Spacing.md,
    letterSpacing: 2,
    fontWeight: '700',
  },
  scanHint: {
    ...Typography.styles.caption,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  inspectBtn: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  inspectBtnText: {
    ...Typography.styles.label,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    padding: Spacing.lg,
    paddingBottom: Spacing['2xl'],
    borderTopWidth: 1,
    ...Shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.base,
    borderBottomWidth: 1,
    paddingBottom: Spacing.sm,
  },
  modalTitle: {
    ...Typography.styles.h4,
    fontWeight: '700',
  },
  modalSubtitle: {
    ...Typography.styles.caption,
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalDataBox: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    borderWidth: 1,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  modalRowKey: {
    ...Typography.styles.bodySmall,
    fontWeight: '500',
    flex: 1,
  },
  modalRowVal: {
    ...Typography.styles.bodySmall,
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  modalRowValHighlight: {
    ...Typography.styles.bodySmall,
    fontWeight: '700',
    fontFamily: 'monospace',
    flex: 2,
    textAlign: 'right',
  },
  rawJsonHeader: {
    ...Typography.styles.label,
    fontWeight: '700',
    marginBottom: Spacing.xs,
    marginTop: Spacing.xs,
  },
  rawJsonBox: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.base,
  },
  rawJsonText: {
    fontFamily: 'monospace',
    fontSize: 11,
    lineHeight: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  shareBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtnText: {
    ...Typography.styles.button,
    color: '#fff',
    fontWeight: '700',
  },
  closeBtn: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    ...Typography.styles.button,
    fontWeight: '600',
  },
  detailsSection: { padding: Spacing.base },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  detailLabel: { ...Typography.styles.bodySmall },
  detailValue: { ...Typography.styles.bodySmall, fontWeight: '600' },
  disclaimer: {
    ...Typography.styles.caption,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.base,
  },
});

export default TicketDetailScreen;
