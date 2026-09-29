import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Colors from '../../constants/colors';
import { Typography, BorderRadius, Spacing, Shadows } from '../../constants/typography';
import Button from './Button';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Bir şeyler ters gitti.',
  onRetry,
}) => (
  <View style={styles.container}>
    <Text style={styles.icon}>😕</Text>
    <Text style={styles.title}>Hata</Text>
    <Text style={styles.message}>{message}</Text>
    {onRetry && (
      <Button
        title="Tekrar Dene"
        onPress={onRetry}
        variant="outline"
        size="sm"
        fullWidth={false}
        style={{ marginTop: Spacing.base }}
      />
    )}
  </View>
);

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: string;
  action?: { title: string; onPress: () => void };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Sonuç Bulunamadı',
  message = 'Aradığınız kriterlere uygun içerik bulunamadı.',
  icon = '🔍',
  action,
}) => (
  <View style={styles.container}>
    <Text style={styles.icon}>{icon}</Text>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.message}>{message}</Text>
    {action && (
      <Button
        title={action.title}
        onPress={action.onPress}
        variant="primary"
        size="sm"
        fullWidth={false}
        style={{ marginTop: Spacing.base }}
      />
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing['3xl'],
  },
  icon: {
    fontSize: 64,
    marginBottom: Spacing.base,
  },
  title: {
    ...Typography.styles.h4,
    color: Colors.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  message: {
    ...Typography.styles.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
