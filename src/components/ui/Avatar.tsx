import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, ViewStyle, Animated } from 'react-native';
import { Colors } from '../../constants/colors';
import { FontFamily, FontWeight } from '../../constants/typography';

interface AvatarProps {
  name: string;
  uri?: string | null;
  size?: number;
  style?: ViewStyle;
  online?: boolean;
}

export function Avatar({ name, uri, size = 44, style, online }: AvatarProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    if (!online) return;
    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.6, duration: 1400, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1400, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOpacity, { toValue: 0, duration: 1400, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0.7, duration: 1400, useNativeDriver: true }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [online, pulseAnim, pulseOpacity]);

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const innerSize = size - (online ? 4 : 0);
  const innerRadius = innerSize / 2;

  return (
    <View style={[{ width: size, height: size }, style]}>
      {online && (
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            {
              borderRadius: size / 2,
              borderWidth: 2,
              borderColor: Colors.yellow,
              transform: [{ scale: pulseAnim }],
              opacity: pulseOpacity,
            },
          ]}
        />
      )}

      {online && (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            {
              borderRadius: size / 2,
              borderWidth: 2,
              borderColor: Colors.yellow,
            },
          ]}
        />
      )}

      <View
        style={[
          styles.inner,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerRadius,
            margin: online ? 2 : 0,
          },
        ]}
      >
        {uri ? (
          <Image
            source={{ uri }}
            style={[styles.image, { borderRadius: innerRadius }]}
          />
        ) : (
          <View
            style={[
              styles.placeholder,
              { borderRadius: innerRadius, width: '100%', height: '100%' },
            ]}
          >
            <Text style={[styles.initials, { fontSize: innerSize * 0.36 }]}>
              {initials}
            </Text>
          </View>
        )}
      </View>

      {online && (
        <View
          style={[
            styles.dot,
            {
              width: size * 0.24,
              height: size * 0.24,
              borderRadius: size * 0.12,
              bottom: 0,
              right: 0,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inner: { overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  placeholder: {
    backgroundColor: Colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: Colors.dark,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },
  dot: {
    position: 'absolute',
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.white,
  },
});
