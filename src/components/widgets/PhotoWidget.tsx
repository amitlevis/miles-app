import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Colors, Shadows } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';

interface PhotoWidgetProps {
  photoUri: string | null;
  partnerName: string;
  tag?: 'good morning' | 'thinking of you' | 'good night' | null;
  onSendPhoto?: () => void;
  size?: 'small' | 'large';
}

const TAG_EMOJIS: Record<string, string> = {
  'good morning': '☀️',
  'thinking of you': '💭',
  'good night': '🌙',
};

export function PhotoWidget({
  photoUri,
  partnerName,
  tag,
  onSendPhoto,
  size = 'large',
}: PhotoWidgetProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isSmall = size === 'small';

  useEffect(() => {
    if (!photoUri) return;
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [photoUri, fadeAnim]);

  if (!photoUri) {
    return (
      <TouchableOpacity
        onPress={onSendPhoto}
        style={[styles.container, isSmall ? styles.small : styles.large, styles.empty, Shadows.small]}
        activeOpacity={0.8}
      >
        <Text style={[styles.emptyIcon, isSmall && { fontSize: 22 }]}>📷</Text>
        {!isSmall && (
          <>
            <Text style={styles.emptyTitle}>Send a photo</Text>
            <Text style={styles.emptySubtitle}>It'll appear on {partnerName}'s screen</Text>
          </>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        isSmall ? styles.small : styles.large,
        Shadows.medium,
        { opacity: fadeAnim },
      ]}
    >
      <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />
      {tag && !isSmall && (
        <View style={styles.tagBadge}>
          <Text style={styles.tagText}>
            {TAG_EMOJIS[tag]} {tag}
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  large: { width: 160, height: 160 },
  small: { width: 80, height: 80, borderRadius: 16 },
  photo: { width: '100%', height: '100%' },
  empty: {
    backgroundColor: Colors.creamDark,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyTitle: {
    fontSize: FontSize.sm,
    color: Colors.charcoal,
    fontFamily: FontFamily.semibold,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontFamily: FontFamily.regular,
    textAlign: 'center',
    marginTop: 4,
  },
  tagBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: FontSize.xs,
    color: Colors.white,
    fontFamily: FontFamily.medium,
  },
});
