import React from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Colors from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { Typography, Spacing, BorderRadius } from '../../constants/typography';

export interface CategoryChipProps {
  name: string;
  icon: string;
  color?: string;
  count?: number;
  isSelected: boolean;
  onPress: () => void;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({
  name,
  icon,
  color = Colors.primary,
  count,
  isSelected,
  onPress,
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: theme.surface2,
          borderColor: theme.border,
        },
        isSelected && {
          borderColor: color,
          backgroundColor: color + '22',
        },
      ]}
    >
      <Text style={styles.chipIcon}>{icon}</Text>
      <Text
        style={[
          styles.chipText,
          { color: theme.textSecondary },
          isSelected && { color, fontWeight: '700' },
        ]}
      >
        {name}
      </Text>
      {count !== undefined && (
        <View
          style={[
            styles.countBadge,
            { backgroundColor: theme.surface3 },
            isSelected && { backgroundColor: color + '33' },
          ]}
        >
          <Text
            style={[
              styles.countText,
              { color: theme.textTertiary },
              isSelected && { color, fontWeight: '700' },
            ]}
          >
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default CategoryChip;

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    marginRight: Spacing.sm,
    borderWidth: 1.5,
    gap: 6,
  },
  chipIcon: {
    fontSize: 15,
  },
  chipText: {
    ...Typography.styles.bodySmall,
    fontWeight: '500',
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
  },
  countText: {
    ...Typography.styles.caption,
    fontSize: 10,
  },
});
