import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Shadows } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { formatDistance } from '../../utils/distance';

interface DistanceMeterWidgetProps {
  miles: number;
  isApproaching?: boolean;
  size?: 'small' | 'large';
}

export function DistanceMeterWidget({
  miles,
  isApproaching = false,
  size = 'large',
}: DistanceMeterWidgetProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isApproaching) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
    return () => pulseAnim.stopAnimation();
  }, [isApproaching, pulseAnim]);

  const isSmall = size === 'small';

  return (
    <Animated.View style={[isApproaching && { transform: [{ scale: pulseAnim }] }]}>
      <LinearGradient
        colors={isApproaching ? ['#FF7A5C', '#FFB830'] : ['#FFB830', '#FFD470']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.container, isSmall ? styles.small : styles.large, Shadows.yellow]}
      >
        <Text style={[styles.icon, isSmall && styles.iconSmall]}>
          {isApproaching ? '✈️' : '🌍'}
        </Text>
        <Text style={[styles.label, isSmall && styles.labelSmall]}>
          {isApproaching ? 'Getting closer...' : 'Apart by'}
        </Text>
        <Text style={[styles.distance, isSmall && styles.distanceSmall]}>
          {formatDistance(miles)}
        </Text>
        {isApproaching && (
          <Text style={styles.approachingLabel}>On the way ♥</Text>
        )}
      </LinearGradient>
    </Animated.View>
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
  icon: { fontSize: 32, marginBottom: 6 },
  iconSmall: { fontSize: 18, marginBottom: 2 },
  label: {
    fontSize: FontSize.xs,
    color: Colors.white,
    fontFamily: FontFamily.medium,
    opacity: 0.9,
    textAlign: 'center',
  },
  labelSmall: { fontSize: 9 },
  distance: {
    fontSize: FontSize.md,
    color: Colors.white,
    fontFamily: FontFamily.bold,
    textAlign: 'center',
    marginTop: 2,
  },
  distanceSmall: { fontSize: FontSize.xs },
  approachingLabel: {
    fontSize: FontSize.xs,
    color: Colors.white,
    fontFamily: FontFamily.medium,
    marginTop: 4,
    opacity: 0.85,
  },
});
