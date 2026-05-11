import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize, FontWeight } from '../../constants/typography';

interface DrawingWidgetProps {
  existingDrawing?: string | null;
  partnerName: string;
  mode?: 'view' | 'draw';
  size?: 'small' | 'large';
  onPress?: () => void;
}

export function DrawingWidget({
  existingDrawing,
  partnerName,
  mode = 'view',
  size = 'large',
  onPress,
}: DrawingWidgetProps) {
  const isSmall = size === 'small';
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: 200,
      useNativeDriver: true,
      speed: 10,
      bounciness: 6,
    }).start();
  }, []);

  // ── Small variant ────────────────────────────────────────────────────────
  if (isSmall) {
    return (
      <Animated.View
        style={[
          styles.cardSmall,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={styles.emptyFillSmall}>
          <Text style={styles.smallGlyph}>✏️</Text>
        </View>
      </Animated.View>
    );
  }

  // ── Has drawing ──────────────────────────────────────────────────────────
  if (existingDrawing && mode === 'view') {
    return (
      <Animated.View
        style={[
          styles.cardLarge,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <TouchableOpacity
          onPress={onPress}
          style={styles.drawingFill}
          activeOpacity={0.85}
        >
          <View style={styles.iconRing}>
            <Text style={styles.drawingGlyph}>✏️</Text>
          </View>
          <Text style={styles.drawingLabel}>Doodle{'\n'}left ♥</Text>
          <Text style={styles.drawingTap}>tap to edit</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // ── Empty state ──────────────────────────────────────────────────────────
  return (
    <Animated.View
      style={[
        styles.cardLarge,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        style={styles.emptyFill}
        activeOpacity={0.85}
      >
        <View style={styles.iconRing}>
          <Text style={styles.emptyGlyph}>✏️</Text>
        </View>
        <Text style={styles.emptyTitle}>Doodle</Text>
        <Text style={styles.emptyHint}>→ {partnerName}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const baseCardLarge = {
  width: 164,
  height: 164,
  borderRadius: 36,
  overflow: 'hidden' as const,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.3,
  shadowRadius: 18,
  elevation: 10,
};

const baseCardSmall = {
  width: 80,
  height: 80,
  borderRadius: 20,
  overflow: 'hidden' as const,
};

const styles = StyleSheet.create({
  cardLarge: baseCardLarge,
  cardSmall: baseCardSmall,

  drawingFill: {
    flex: 1,
    backgroundColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,184,48,0.18)',
  },
  iconRing: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,184,48,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,184,48,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  drawingGlyph: { fontSize: 20 },
  drawingLabel: {
    fontSize: FontSize.sm,
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
    lineHeight: 16,
  },
  drawingTap: {
    fontSize: 10,
    color: 'rgba(255,184,48,0.7)',
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
  },

  // Empty large
  emptyFill: {
    flex: 1,
    backgroundColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderStyle: 'dashed',
  },
  emptyGlyph: { fontSize: 20, opacity: 0.6 },
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

  // Small empty
  emptyFillSmall: {
    flex: 1,
    backgroundColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  smallGlyph: { fontSize: 20, opacity: 0.55 },
});
