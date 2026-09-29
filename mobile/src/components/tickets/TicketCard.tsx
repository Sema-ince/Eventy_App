import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import Colors from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { Typography, Spacing, BorderRadius, Shadows } from '../../constants/typography';
import type { Ticket } from '../../types';

export interface TicketCardProps {
  ticket: Ticket;
  onPress: (ticket: Ticket) => void;
}

const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
  ACTIVE: { label: 'Aktif', color: Colors.success, icon: '✅' },
  USED: { label: 'Kullanıldı', color: Colors.textTertiary, icon: '✔️' },
  CANCELLED: { label: 'İptal', color: Colors.error, icon: '❌' },
  EXPIRED: { label: 'Süresi Doldu', color: Colors.warning, icon: '⚠️' },
};

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, onPress }) => {
  const { theme } = useTheme();
  const status = statusConfig[ticket.status] || statusConfig.ACTIVE;

  return (
    <TouchableOpacity
      onPress={() => onPress(ticket)}
      style={[styles.ticketCard, { backgroundColor: theme.surface }]}
      activeOpacity={0.85}
    >
      {/* Left accent bar */}
      <View style={[styles.ticketAccent, { backgroundColor: status.color }]} />

      {/* Ticket Image */}
      <View style={styles.ticketImage}>
        <Image
          source={{ uri: ticket.event.imageUrl }}
          style={styles.ticketImg}
          resizeMode="cover"
        />
      </View>

      {/* Ticket Content */}
      <View style={styles.ticketContent}>
        <View style={styles.ticketHeader}>
          <Text style={[styles.ticketTitle, { color: theme.text }]} numberOfLines={2}>
            {ticket.event.title}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: status.color + '22' }]}>
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.icon} {status.label}
            </Text>
          </View>
        </View>

        <Text style={[styles.ticketMeta, { color: theme.textSecondary }]}>📅 {formatDate(ticket.event.date)}</Text>
        <Text style={[styles.ticketMeta, { color: theme.textSecondary }]} numberOfLines={1}>
          📍 {ticket.event.location}
        </Text>

        <View style={styles.ticketFooter}>
          <View>
            <Text style={[styles.ticketNumber, { color: theme.textTertiary }]}>#{ticket.ticketNumber}</Text>
            <Text style={styles.ticketQty}>
              {ticket.quantity} bilet · {ticket.totalPrice.toLocaleString('tr-TR')} TRY
            </Text>
          </View>
          <View style={[styles.qrPreview, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
            <Text style={[styles.qrPreviewIcon, { color: theme.textSecondary }]}>▦</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default TicketCard;

const styles = StyleSheet.create({
  ticketCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    overflow: 'hidden',
    ...Shadows.md,
  },
  ticketAccent: {
    width: 4,
  },
  ticketImage: {
    width: 95,
    height: 115,
  },
  ticketImg: {
    width: '100%',
    height: '100%',
  },
  ticketContent: {
    flex: 1,
    padding: Spacing.md,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  ticketTitle: {
    ...Typography.styles.label,
    color: Colors.text,
    flex: 1,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    ...Typography.styles.caption,
    fontWeight: '700',
    fontSize: 10,
  },
  ticketMeta: {
    ...Typography.styles.caption,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: Spacing.xs,
  },
  ticketNumber: {
    ...Typography.styles.caption,
    color: Colors.textTertiary,
    fontSize: 10,
  },
  ticketQty: {
    ...Typography.styles.caption,
    color: Colors.secondary,
    fontWeight: '600',
  },
  qrPreview: {
    width: 36,
    height: 36,
    backgroundColor: Colors.surface2,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  qrPreviewIcon: {
    fontSize: 20,
    color: Colors.textSecondary,
  },
});
