import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Colors from '../../constants/colors';
import { BorderRadius, Spacing } from '../../constants/typography';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = BorderRadius.sm,
  style,
}) => {
  return (
    <View
      style={[
        {
          width: width as number,
          height,
          borderRadius,
          backgroundColor: Colors.skeleton,
          overflow: 'hidden',
        },
        style,
      ]}
    />
  );
};

// ─── Event Card Skeleton ──────────────────────────────────────────
export const EventCardSkeleton = () => (
  <View style={styles.card}>
    <Skeleton height={180} borderRadius={BorderRadius.xl} />
    <View style={{ padding: Spacing.md }}>
      <Skeleton height={20} width="70%" />
      <View style={{ height: Spacing.sm }} />
      <Skeleton height={14} width="50%" />
      <View style={{ height: Spacing.sm }} />
      <Skeleton height={14} width="40%" />
    </View>
  </View>
);

// ─── Featured Card Skeleton ───────────────────────────────────────
export const FeaturedCardSkeleton = () => (
  <View style={styles.featuredCard}>
    <Skeleton height={220} borderRadius={BorderRadius.xl} width={300} />
  </View>
);

// ─── List Skeleton ────────────────────────────────────────────────
export const ListSkeleton = ({ count = 3 }: { count?: number }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <EventCardSkeleton key={i} />
    ))}
  </>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  featuredCard: {
    marginRight: Spacing.md,
  },
});
