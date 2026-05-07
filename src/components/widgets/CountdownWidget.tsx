import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Shadows } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { daysUntil } from '../../utils/timeZone';

interface CountdownWidgetProps {
  reunionDate: Date | null;
  togetherMode: boolean;
  partnerName: string;
  size?: 'small' | 'large';
  onPress?: () => void;
}

export function CountdownWidget({
  reunionDate,
  togetherMode,
  partnerName,
  size = 'large',
  onPress,
}: CountdownWidgetProps) {
  const [days, setDays] = useState(reunionDate ? daysUntil(reunionDate) : null);
  const isSmall = size === 'small';

  useEffect(() => {
    if (!reunionDate || togetherMode) return;
    const interval = setInterval(() => setDays(daysUntil(reunionDate)), 60_000);
    return () => clearInterval(interval);
  }, [reunionDate, togetherMode]);

  if (togetherMode) {
    return (
      <LinearGradient
        colors={['#FFD470', '#FF7A5C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.container, isSmall ? styles.small : styles.large, Shadows.yellow]}
      >
        <Text style={[styles.togetherEmoji, isSmall && { fontSize: 24 }]}>🫶</Text>
        {!isSmall && (
          <>
            <Text style={styles.togetherLabel}>Together</Text>
            <Text style={styles.togetherSub}>Right now ♥</Text>
          </>
        )}
      </LinearGradient>
    );
  }

  if (!reunionDate || days === null) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[styles.container, isSmall ? styles.small : styles.large, styles.empty, Shadows.small]}
        activeOpacity={0.75}
      >
        <Text style={[styles.emptyIcon, isSmall && { fontSize: 22 }]}>📅</Text>
        {!isSmall && <Text style={styles.emptyLabel}>Set a reunion date</Text>}
      </TouchableOpacity>
    );
  }

  return (
    <LinearGradient
      colors={['#C9B8E8', '#9B8AC4']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, isSmall ? styles.small : styles.large, Shadows.medium]}
    >
      <Text style={[styles.daysNumber, isSmall && styles.daysNumberSmall]}>{days}</Text>
      <Text style={[styles.daysLabel, isSmall && styles.daysLabelSmall]}>
        {isSmall ? 'days' : `day${days !== 1 ? 's' : ''} until`}
      </Text>
      {!isSmall && (
        <Text style={styles.partnerName}>seeing {partnerName}</Text>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  large: { width: 160, height: 160, padding: 16 },
  small: { width: 80, height: 80, padding: 8, borderRadius: 16 },
  togetherEmoji: { fontSize: 42, marginBottom: 4 },
  togetherLabel: {
    fontSize: FontSize.lg,
    color: Colors.white,
    fontFamily: FontFamily.bold,
  },
  togetherSub: {
    fontSize: FontSize.sm,
    color: Colors.white,
    fontFamily: FontFamily.medium,
    marginTop: 2,
    opacity: 0.9,
  },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontFamily: FontFamily.medium,
    textAlign: 'center',
  },
  empty: {
    backgroundColor: Colors.creamDark,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  daysNumber: {
    fontSize: FontSize['3xl'],
    color: Colors.white,
    fontFamily: FontFamily.bold,
    lineHeight: 44,
  },
  daysNumberSmall: { fontSize: FontSize.xl, lineHeight: 28 },
  daysLabel: {
    fontSize: FontSize.sm,
    color: Colors.white,
    fontFamily: FontFamily.medium,
    opacity: 0.9,
  },
  daysLabelSmall: { fontSize: FontSize.xs },
  partnerName: {
    fontSize: FontSize.sm,
    color: Colors.white,
    fontFamily: FontFamily.regular,
    opacity: 0.85,
    marginTop: 4,
  },
});
