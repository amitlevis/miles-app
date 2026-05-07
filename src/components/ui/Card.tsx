import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Shadows } from '../../constants/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'yellow' | 'coral' | 'dark';
  padding?: number;
}

export function Card({ children, style, variant = 'default', padding = 20 }: CardProps) {
  return (
    <View style={[styles.base, styles[variant], Shadows.small, { padding }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  default: {
    backgroundColor: Colors.white,
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
    backgroundColor: Colors.charcoal,
  },
});
