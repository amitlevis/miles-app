import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize, FontWeight } from '../../constants/typography';

interface PhotoWidgetProps {
  photoUri: string | null;
  partnerName: string;
  tag?: 'good morning' | 'thinking of you' | 'good night' | null;
  onSendPhoto?: () => void;
  size?: 'small' | 'large';
}

const TAG_COLORS: Record<string, string> = {
  'good morning': Colors.yellow,
  'thinking of you': Colors.lavender,
  'good night': '#4A6FA5',
};

export function PhotoWidget({
  photoUri,
  partnerName,
  tag,
  onSendPhoto,
  size = 'large',
}: PhotoWidgetProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const isSmall = size === 'small';
  const dim = isSmall ? 80 : 164;
  const radius = isSmall ? 20 : 36;

  useEffect(() => {
    if (!photoUri) return;
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.94);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 12, bounciness: 5 }),
    ]).start();
  }, [photoUri]);

  if (!photoUri) {
    return (
      <TouchableOpacity
        onPress={onSendPhoto}
        activeOpacity={0.8}
        style={[styles.empty, { width: dim, height: dim, borderRadius: radius }]}
      >
        <View style={styles.emptyInner}>
          <View style={[styles.plusRing, isSmall && styles.plusRingSmall]}>
            <Text style={[styles.plusIcon, isSmall && styles.plusIconSmall]}>+</Text>
          </View>
          {!isSmall && (
            <>
              <Text style={styles.emptyTitle}>Send a photo</Text>
              <Text style={styles.emptyHint}>→ {partnerName}</Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <Animated.View
      style={[
        { width: dim, height: dim, borderRadius: radius, overflow: 'hidden' },
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Image
        source={{ uri: photoUri }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.6)']}
        style={[StyleSheet.absoluteFill, { justifyContent: 'flex-end', padding: 10 }]}
      >
        {tag && !isSmall && (
          <View
            style={[
              styles.tagPill,
              {
                backgroundColor: `${TAG_COLORS[tag]}22`,
                borderColor: `${TAG_COLORS[tag]}55`,
              },
            ]}
          >
            <Text style={[styles.tagText, { color: TAG_COLORS[tag] }]}>{tag}</Text>
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  empty: {
    backgroundColor: Colors.dark,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.38,
    shadowRadius: 18,
    elevation: 10,
  },
  emptyInner: { alignItems: 'center', gap: 6 },
  plusRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  plusRingSmall: { width: 26, height: 26, borderRadius: 13, marginBottom: 0 },
  plusIcon: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.3)',
    fontWeight: '300',
    lineHeight: 24,
  },
  plusIconSmall: { fontSize: 14, lineHeight: 17 },
  emptyTitle: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.38)',
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
  },
  emptyHint: {
    fontSize: 10,
    color: Colors.yellow,
    fontFamily: FontFamily.regular,
    opacity: 0.6,
  },
  tagPill: {
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  tagText: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
  },
});
