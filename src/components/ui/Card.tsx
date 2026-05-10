import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'yellow' | 'coral' | 'dark' | 'glass' | 'warm';
  padding?: number;
  radius?: number;
}

export function Card({
  children,
  style,
  variant = 'default',
  padding = 20,
  radius = 24,
}: CardProps) {
  return (
    <View
      style={[
        styles.base,
        VARIANT_STYLES[variant],
        { padding, borderRadius: radius },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const VARIANT_STYLES: Record<string, ViewStyle> = {
  default: {
    backgroundColor: Colors.white,
    shadowColor: '#2C2C2C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  yellow: {
    backgroundColor: Colors.yellowPale,
    borderWidth: 1,
    borderColor: Colors.yellowLight,
  },
  coral: {
    backgroundColor: '#FFF0EC',
    borderWidth: 1,
    borderColor: Colors.coralLight,
  },
  dark: {
    backgroundColor: Colors.dark,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.38,
    shadowRadius: 20,
    elevation: 10,
  },
  glass: {
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  warm: {
    backgroundColor: Colors.creamDark,
    borderWidth: 1,
    borderColor: Colors.border,
  },
};

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});
