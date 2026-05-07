import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Shadows } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';

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

  if (isSmall) {
    return (
      <View style={[styles.container, styles.small, styles.emptySmall]}>
        <Text style={{ fontSize: 22 }}>✏️</Text>
      </View>
    );
  }

  if (existingDrawing && mode === 'view') {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[styles.container, styles.large, Shadows.small]}
        activeOpacity={0.8}
      >
        <View style={styles.drawingPreview}>
          <Text style={styles.drawingEmoji}>✏️</Text>
          <Text style={styles.drawingLabel}>You left a doodle ♥</Text>
          <Text style={styles.drawingTap}>Tap to edit</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, styles.large, styles.empty, Shadows.small]}
      activeOpacity={0.8}
    >
      <Text style={styles.emptyIcon}>✏️</Text>
      <Text style={styles.emptyTitle}>Leave a doodle</Text>
      <Text style={styles.emptySubtitle}>It'll appear on {partnerName}'s screen</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 24, overflow: 'hidden' },
  large: { width: 160, height: 160 },
  small: { width: 80, height: 80, borderRadius: 16 },
  emptySmall: {
    backgroundColor: Colors.creamDark,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  drawingPreview: {
    flex: 1,
    backgroundColor: '#FFF8F0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 4,
  },
  drawingEmoji: { fontSize: 32, marginBottom: 4 },
  drawingLabel: {
    fontSize: FontSize.sm,
    color: Colors.charcoal,
    fontFamily: FontFamily.semibold,
    textAlign: 'center',
  },
  drawingTap: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontFamily: FontFamily.regular,
  },
});
