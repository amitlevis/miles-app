import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize, FontWeight } from '../../constants/typography';
import { formatDistance } from '../../utils/distance';

interface DistanceMeterWidgetProps {
  miles: number;
  isApproaching?: boolean;
  size?: 'small' | 'large';
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const MAX_DISTANCE = 12450;

export function DistanceMeterWidget({
  miles,
  isApproaching = false,
  size = 'large',
}: DistanceMeterWidgetProps) {
  const arcAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;
  const scaleAnim = useRef(new Animated.Value(0.88)).current;

  const isSmall = size === 'small';
  const containerSize = isSmall ? 80 : 164;
  const radius = isSmall ? 28 : 60;
  const strokeWidth = isSmall ? 3 : 5;
  const cx = containerSize / 2;
  const cy = containerSize / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(Math.max(miles, 1) / MAX_DISTANCE, 1);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(arcAnim, {
        toValue: pct,
        duration: 1400,
        delay: 300,
        useNativeDriver: false,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: 100,
        useNativeDriver: true,
        speed: 10,
        bounciness: 6,
      }),
    ]).start();

    if (isApproaching) {
      const glowLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0.4, duration: 900, useNativeDriver: true }),
        ])
      );
      glowLoop.start();
      return () => glowLoop.stop();
    }
  }, [miles, isApproaching]);

  const strokeDashoffset = arcAnim.interpolate({
    inputRange: [0, pct > 0 ? pct : 0.001],
    outputRange: [circumference, circumference * (1 - pct)],
    extrapolate: 'clamp',
  });

  const arcColor = isApproaching ? Colors.coral : Colors.yellow;

  return (
    <Animated.View
      style={[
        isSmall ? styles.cardSmall : styles.cardLarge,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Svg
        width={containerSize}
        height={containerSize}
        style={StyleSheet.absoluteFill}
      >
        <G rotation="-90" origin={`${cx},${cy}`}>
          <Circle
            cx={cx}
            cy={cy}
            r={radius}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <AnimatedCircle
            cx={cx}
            cy={cy}
            r={radius}
            stroke={arcColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </G>
      </Svg>

      {!isSmall ? (
        <View style={styles.textCenter}>
          <Text style={styles.labelSmallCap}>
            {isApproaching ? 'getting closer' : 'apart by'}
          </Text>
          <Text style={styles.distanceLarge}>{formatDistance(miles)}</Text>
          {isApproaching && (
            <Animated.Text style={[styles.approachTag, { opacity: glowAnim }]}>
              on the way ♥
            </Animated.Text>
          )}
        </View>
      ) : (
        <View style={styles.textCenterSmall}>
          <Text style={styles.distanceSmall}>
            {miles >= 1000 ? `${Math.round(miles / 100) / 10}k` : miles}
          </Text>
          <Text style={styles.milesLabel}>mi</Text>
        </View>
      )}
    </Animated.View>
  );
}

const baseCard: object = {
  backgroundColor: Colors.dark,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.07)',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.38,
  shadowRadius: 18,
  elevation: 10,
};

const styles = StyleSheet.create({
  cardLarge: {
    ...baseCard,
    width: 164,
    height: 164,
    borderRadius: 36,
  },
  cardSmall: {
    ...baseCard,
    width: 80,
    height: 80,
    borderRadius: 20,
  },
  textCenter: {
    alignItems: 'center',
  },
  labelSmallCap: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.35)',
    fontFamily: FontFamily.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 3,
  },
  distanceLarge: {
    fontSize: FontSize.md,
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5,
  },
  approachTag: {
    fontSize: 9,
    color: Colors.coral,
    fontFamily: FontFamily.medium,
    marginTop: 3,
    letterSpacing: 0.3,
  },
  textCenterSmall: { alignItems: 'center' },
  distanceSmall: {
    fontSize: FontSize.sm,
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    lineHeight: 17,
  },
  milesLabel: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.35)',
    fontFamily: FontFamily.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
