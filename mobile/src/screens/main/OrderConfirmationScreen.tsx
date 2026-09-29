import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { ticketsService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/common/Button';
import Colors from '../../constants/colors';
import { Typography, Spacing, BorderRadius, Shadows } from '../../constants/typography';
import type { Event, Ticket, HomeStackParamList } from '../../types';

type NavProp = NativeStackNavigationProp<HomeStackParamList, 'OrderConfirmation'>;
type RoutePropType = RouteProp<HomeStackParamList, 'OrderConfirmation'>;

const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const formatPrice = (price: number, currency: string = 'TRY'): string =>
  price === 0 ? 'Ücretsiz' : `${price.toLocaleString('tr-TR')} ${currency}`;

const OrderConfirmationScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const { user } = useAuth();
  const { theme, isDark } = useTheme();

  const { event, quantity: initialQuantity } = route.params;

  const [quantity, setQuantity] = useState(initialQuantity);
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [purchasedTicket, setPurchasedTicket] = useState<Ticket | null>(null);

  const availableSeats = event.totalSeats - event.soldSeats;
  const totalPrice = event.price * quantity;

  const handleConfirmPurchase = async () => {
    if (!acceptedTerms) {
      Alert.alert('Uyarı', 'Lütfen etkinlik kurallarını ve bilet sözleşmesini onaylayın.');
      return;
    }

    setLoading(true);
    try {
      const ticket = await ticketsService.purchaseTicket(event.id, quantity);
      setPurchasedTicket(ticket);
    } catch (e) {
      Alert.alert(
        'Satın Alma Başarısız',
        e instanceof Error ? e.message : 'Bilet satın alınamadı. Lütfen tekrar deneyin.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoToTicket = () => {
    if (!purchasedTicket) return;
    const ticketId = purchasedTicket.id;
    setPurchasedTicket(null);
    navigation.replace('TicketDetail', { ticketId });
  };

  const handleGoHome = () => {
    setPurchasedTicket(null);
    navigation.popToTop();
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
          <Text style={[styles.topBarTitle, { color: theme.text }]}>Sipariş Onayı</Text>
          <Text style={[styles.topBarSub, { color: theme.textSecondary }]}>Satın alma adımını tamamlayın</Text>
        </View>

        <View style={[styles.stepBadge, { backgroundColor: theme.primaryTransparent, borderColor: theme.primary }]}>
          <Text style={[styles.stepBadgeText, { color: theme.primary }]}>Son Adım</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ─── 1. Event Summary Card ─── */}
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.eventRow}>
            <Image
              source={{ uri: event.imageUrl }}
              style={styles.eventThumb}
              resizeMode="cover"
            />
            <View style={styles.eventInfo}>
              <View
                style={[
                  styles.categoryPill,
                  { backgroundColor: (event.category?.color || Colors.primary) + '22' },
                ]}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    { color: event.category?.color || Colors.primary },
                  ]}
                >
                  {event.category?.icon} {event.category?.name}
                </Text>
              </View>

              <Text style={[styles.eventTitle, { color: theme.text }]} numberOfLines={2}>
                {event.title}
              </Text>

              <Text style={[styles.eventMetaText, { color: theme.textSecondary }]}>📅 {formatDate(event.date)}</Text>
              <Text style={[styles.eventMetaText, { color: theme.textSecondary }]} numberOfLines={1}>
                📍 {event.address || event.location}
              </Text>
            </View>
          </View>
        </View>

        {/* ─── 2. Ticket Quantity & Price Breakdown ─── */}
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.cardSectionTitle, { color: theme.text }]}>🎫 Bilet Bilgileri</Text>

          <View style={styles.quantityRow}>
            <View>
              <Text style={[styles.quantityLabel, { color: theme.text }]}>Standart Bilet</Text>
              <Text style={[styles.quantitySub, { color: theme.textTertiary }]}>
                Birim Fiyat: {formatPrice(event.price, event.currency)}
              </Text>
            </View>

            <View style={[styles.counterRow, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
              <TouchableOpacity
                style={[styles.counterBtn, { backgroundColor: theme.surface }, quantity <= 1 && styles.counterBtnDisabled]}
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >
                <Text style={[styles.counterBtnText, { color: theme.text }]}>−</Text>
              </TouchableOpacity>

              <Text style={[styles.counterValue, { color: theme.text }]}>{quantity}</Text>

              <TouchableOpacity
                style={[styles.counterBtn, { backgroundColor: theme.surface }, quantity >= availableSeats && styles.counterBtnDisabled]}
                onPress={() => setQuantity((q) => Math.min(availableSeats, q + 1))}
                disabled={quantity >= availableSeats}
              >
                <Text style={[styles.counterBtnText, { color: theme.text }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Bilet Adedi</Text>
            <Text style={[styles.summaryValue, { color: theme.text }]}>{quantity} Adet</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Birim Fiyat</Text>
            <Text style={[styles.summaryValue, { color: theme.text }]}>
              {formatPrice(event.price, event.currency)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Hizmet Bedeli / KDV</Text>
            <Text style={[styles.summaryValue, { color: Colors.success }]}>
              Dahil (%0 Ek Ücret)
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: theme.text }]}>Toplam Ödenecek:</Text>
            <Text style={styles.totalValue}>
              {formatPrice(totalPrice, event.currency)}
            </Text>
          </View>
        </View>

        {/* ─── 3. Attendee / User Details Card ─── */}
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.cardSectionTitle, { color: theme.text }]}>👤 Bilet Sahibi Bilgileri</Text>

          <View style={styles.userRow}>
            <View style={[styles.userAvatar, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
              <Text style={{ fontSize: 20 }}>👤</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.userName, { color: theme.text }]}>{user?.name || 'Kullanıcı'}</Text>
              <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{user?.email || 'Giriş yapılmamış'}</Text>
            </View>
          </View>

          <View style={[styles.noticeBox, { backgroundColor: theme.surface2 }]}>
            <Text style={styles.noticeIcon}>ℹ️</Text>
            <Text style={[styles.noticeText, { color: theme.textSecondary }]}>
              Biletiniz onaylanığında adınıza özel QR kod ve dijital bilet numarası
              otomatik oluşturularak "Biletlerim" sekmesine eklenecektir.
            </Text>
          </View>
        </View>

        {/* ─── 4. Terms & Conditions Checkbox ─── */}
        <TouchableOpacity
          style={styles.termsRow}
          onPress={() => setAcceptedTerms((v) => !v)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, { borderColor: theme.border }, acceptedTerms && styles.checkboxChecked]}>
            {acceptedTerms && <Text style={styles.checkIcon}>✓</Text>}
          </View>
          <Text style={[styles.termsText, { color: theme.textTertiary }]}>
            Etkinlik kurallarını, dijital bilet sözleşmesini ve iptal/iade koşullarını okudum,
            kabul ediyorum.
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ─── Bottom CTA Bar ─── */}
      <View style={[styles.bottomBar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <View style={styles.bottomBarPrice}>
          <Text style={[styles.bottomBarLabel, { color: theme.textTertiary }]}>Toplam Tutar</Text>
          <Text style={styles.bottomBarTotal}>
            {formatPrice(totalPrice, event.currency)}
          </Text>
        </View>

        <Button
          title="Onayla & Satın Al 🎉"
          onPress={handleConfirmPurchase}
          loading={loading}
          disabled={loading || !acceptedTerms}
          fullWidth={false}
          style={styles.submitBtn}
        />
      </View>

      {/* ─── Success Modal ─── */}
      <Modal
        visible={!!purchasedTicket}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={[Colors.primary + '33', Colors.surface]}
              style={styles.modalHeaderGrad}
            >
              <Text style={styles.modalEmoji}>🎉</Text>
              <Text style={styles.modalTitle}>Biletiniz Hazır!</Text>
              <Text style={styles.modalSubtitle}>
                Satın alma işlemi başarıyla gerçekleşti.
              </Text>
            </LinearGradient>

            <View style={styles.modalBody}>
              <View style={styles.ticketSummaryBox}>
                <Text style={styles.ticketSummaryEventTitle} numberOfLines={2}>
                  {event.title}
                </Text>
                <Text style={styles.ticketSummaryNumber}>
                  Bilet No: #{purchasedTicket?.ticketNumber}
                </Text>
                <Text style={styles.ticketSummaryDate}>
                  📅 {formatDate(event.date)}
                </Text>
                <Text style={styles.ticketSummaryQty}>
                  🎫 {purchasedTicket?.quantity} Adet Bilet
                </Text>
              </View>

              <Button
                title="Bileti Görüntüle 🎫"
                onPress={handleGoToTicket}
                style={{ marginBottom: Spacing.sm }}
              />

              <TouchableOpacity
                onPress={handleGoHome}
                style={styles.modalSecondaryBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.modalSecondaryBtnText}>Ana Sayfaya Dön</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default OrderConfirmationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing['2xl'],
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  backBtnText: {
    fontSize: 20,
    color: Colors.text,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  topBarTitle: {
    ...Typography.styles.h4,
    color: Colors.text,
    fontWeight: '700',
  },
  topBarSub: {
    ...Typography.styles.caption,
    color: Colors.textSecondary,
    fontSize: 11,
  },
  stepBadge: {
    backgroundColor: Colors.primary + '22',
    borderColor: Colors.primary,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
  },
  stepBadgeText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: Spacing['3xl'],
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  cardSectionTitle: {
    ...Typography.styles.label,
    color: Colors.text,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  eventRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  eventThumb: {
    width: 90,
    height: 100,
    borderRadius: BorderRadius.lg,
  },
  eventInfo: {
    flex: 1,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    marginBottom: 4,
  },
  categoryPillText: {
    fontSize: 10,
    fontWeight: '600',
  },
  eventTitle: {
    ...Typography.styles.label,
    color: Colors.text,
    fontWeight: '700',
    marginBottom: 4,
  },
  eventMetaText: {
    ...Typography.styles.caption,
    color: Colors.textSecondary,
    fontSize: 11,
    marginBottom: 2,
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  quantityLabel: {
    ...Typography.styles.body,
    color: Colors.text,
    fontWeight: '600',
  },
  quantitySub: {
    ...Typography.styles.caption,
    color: Colors.textTertiary,
    fontSize: 11,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 3,
  },
  counterBtn: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnDisabled: {
    opacity: 0.4,
  },
  counterBtnText: {
    fontSize: 18,
    color: Colors.text,
    fontWeight: '700',
  },
  counterValue: {
    ...Typography.styles.body,
    fontWeight: '700',
    color: Colors.text,
    paddingHorizontal: Spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  summaryLabel: {
    ...Typography.styles.bodySmall,
    color: Colors.textSecondary,
  },
  summaryValue: {
    ...Typography.styles.bodySmall,
    color: Colors.text,
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  totalLabel: {
    ...Typography.styles.body,
    color: Colors.text,
    fontWeight: '700',
  },
  totalValue: {
    ...Typography.styles.h4,
    color: Colors.secondary,
    fontWeight: '800',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  userName: {
    ...Typography.styles.body,
    color: Colors.text,
    fontWeight: '700',
  },
  userEmail: {
    ...Typography.styles.caption,
    color: Colors.textSecondary,
  },
  noticeBox: {
    flexDirection: 'row',
    backgroundColor: Colors.surface2,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  noticeIcon: {
    fontSize: 16,
  },
  noticeText: {
    ...Typography.styles.caption,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkIcon: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  termsText: {
    ...Typography.styles.caption,
    color: Colors.textTertiary,
    flex: 1,
    lineHeight: 16,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  bottomBarPrice: {
    flex: 1,
  },
  bottomBarLabel: {
    ...Typography.styles.caption,
    color: Colors.textTertiary,
    fontSize: 10,
  },
  bottomBarTotal: {
    ...Typography.styles.h4,
    color: Colors.secondary,
    fontWeight: '800',
  },
  submitBtn: {
    paddingHorizontal: Spacing.xl,
  },

  // ─ Modal ─
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.lg,
  },
  modalHeaderGrad: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.base,
  },
  modalEmoji: {
    fontSize: 44,
    marginBottom: Spacing.xs,
  },
  modalTitle: {
    ...Typography.styles.h3,
    color: Colors.text,
    fontWeight: '800',
    marginBottom: 4,
  },
  modalSubtitle: {
    ...Typography.styles.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  modalBody: {
    padding: Spacing.base,
  },
  ticketSummaryBox: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ticketSummaryEventTitle: {
    ...Typography.styles.body,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  ticketSummaryNumber: {
    ...Typography.styles.caption,
    color: Colors.primary,
    fontWeight: '700',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  ticketSummaryDate: {
    ...Typography.styles.caption,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  ticketSummaryQty: {
    ...Typography.styles.caption,
    color: Colors.secondary,
    fontWeight: '600',
  },
  modalSecondaryBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  modalSecondaryBtnText: {
    ...Typography.styles.bodySmall,
    color: Colors.textTertiary,
  },
});
