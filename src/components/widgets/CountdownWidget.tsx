import React, { useEffect, useRef, useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize, FontWeight } from '../../constants/typography';
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
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: 150,
      useNativeDriver: true,
      speed: 10,
      bounciness: 6,
    }).start();
  }, []);

  useEffect(() => {
    if (!reunionDate || togetherMode) return;
    const interval = setInterval(() => setDays(daysUntil(reunionDate)), 60_000);
    return () => clearInterval(interval);
  }, [reunionDate, togetherMode]);

  // ── Together mode — coral/gold gradient ─────────────────────────────────
  if (togetherMode) {
    return (
      <Animated.View
        style={[
          isSmall ? styles.cardSmall : styles.cardLarge,
          styles.shadowCoral,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <LinearGradient
          colors={['#FFD470', '#FF8C42', '#FF7A5C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientFill}
        >
          <Text style={isSmall ? styles.togetherIconSmall : styles.togetherIcon}>
            🫶
          </Text>
          {!isSmall && (
            <>
              <Text style={styles.togetherLabel}>together</Text>
              <Text style={styles.togetherSub}>right now ♥</Text>
            </>
          )}
        </LinearGradient>
      </Animated.View>
    );
  }

  // ── Empty state ──────────────────────────────────────────────────────────
  if (!reunionDate || days === null) {
    return (
      <Animated.View
        style={[
          isSmall ? styles.cardSmall : styles.cardLarge,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <TouchableOpacity
          onPress={onPress}
          style={[styles.emptyFill, isSmall && styles.emptyFillSmall]}
          activeOpacity={0.85}
        >
          {!isSmall ? (
            <>
              <View style={styles.emptyIconWrap}>
                <Text style={styles.emptyIcon}>＋</Text>
              </View>
              <Text style={styles.emptyTitle}>Set reunion</Text>
              <Text style={styles.emptyHint}>tap to add date</Text>
            </>
          ) : (
            <Text style={styles.emptyIconSmall}>＋</Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // ── Countdown ────────────────────────────────────────────────────────────
  return (
    <Animated.View
      style={[
        isSmall ? styles.cardSmall : styles.cardLarge,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={onPress ? 0.85 : 1}
        style={styles.darkFill}
      >
        {!isSmall ? (
          <>
            <Text style={styles.countLabel}>days until</Text>
            <Text style={styles.daysNumber}>{days}</Text>
            <Text style={styles.partnerLabel}>seeing {partnerName}</Text>
          </>
        ) : (
          <View style={styles.smallContent}>
            <Text style={styles.daysNumberSmall}>{days}</Text>
            <Text style={styles.daysLabelSmall}>days</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const baseCardLarge = {
  width: 164,
  height: 164,
  borderRadius: 36,
  overflow: 'hidden' as const,
};

const baseCardSmall = {
  width: 80,
  height: 80,
  borderRadius: 20,
  overflow: 'hidden' as const,
};

const styles = StyleSheet.create({
  cardLarge: {
    ...baseCardLarge,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 18,
    elevation: 10,
  },
  cardSmall: {
    ...baseCardSmall,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 6,
  },
  shadowCoral: {
    shadowColor: Colors.coral,
    shadowOpacity: 0.36,
  },

  gradientFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
  },
  darkFill: {
    flex: 1,
    backgroundColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },

  // Together mode
  togetherIcon: { fontSize: 36, marginBottom: 4 },
  togetherIconSmall: { fontSize: 22 },
  togetherLabel: {
    fontSize: FontSize.md,
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.black,
    letterSpacing: -0.3,
  },
  togetherSub: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
    marginTop: 2,
  },

  // Countdown
  countLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.4)',
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  daysNumber: {
    fontSize: 52,
    color: Colors.yellow,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.black,
    letterSpacing: -2,
    lineHeight: 56,
  },
  partnerLabel: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.55)',
    fontFamily: FontFamily.regular,
    marginTop: 4,
  },
  smallContent: { alignItems: 'center' },
  daysNumberSmall: {
    fontSize: FontSize.lg,
    color: Colors.yellow,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.black,
    letterSpacing: -0.5,
    lineHeight: 22,
  },
  daysLabelSmall: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.4)',
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 2,
  },

  // Empty state
  emptyFill: {
    flex: 1,
    backgroundColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderStyle: 'dashed',
    padding: 14,
    gap: 4,
  },
  emptyFillSmall: { padding: 0 },
  emptyIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyIcon: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.3)',
    fontWeight: '300',
    lineHeight: 24,
  },
  emptyIconSmall: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.3)',
    fontWeight: '300',
  },
  emptyTitle: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.4)',
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
  },
  emptyHint: {
    fontSize: 10,
    color: Colors.yellow,
    fontFamily: FontFamily.regular,
    opacity: 0.6,
  },
});
