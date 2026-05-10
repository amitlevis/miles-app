import React, { useRef } from 'react';
import {
  Animated,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { FontSize, FontFamily, FontWeight } from '../../constants/typography';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'coral' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.955,
      useNativeDriver: true,
      speed: 60,
      bounciness: 3,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 60,
      bounciness: 3,
    }).start();
  };

  const sizeStyle = SIZE_STYLES[size];
  const labelSizeStyle = LABEL_SIZES[size];

  if (variant === 'primary') {
    return (
      <Animated.View
        style={[
          styles.primaryShadow,
          { transform: [{ scale: scaleAnim }] },
          (disabled || loading) && styles.disabled,
          style,
        ]}
      >
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
          disabled={disabled || loading}
          style={styles.overflow}
        >
          <LinearGradient
            colors={['#FFD470', '#FFB830', '#FF8C42']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.base, sizeStyle]}
          >
            {loading ? (
              <ActivityIndicator color={Colors.dark} />
            ) : (
              <Text style={[styles.labelBase, styles.labelDark, labelSizeStyle, textStyle]}>
                {label}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        disabled={disabled || loading}
        style={[
          styles.base,
          sizeStyle,
          VARIANT_STYLES[variant],
          (disabled || loading) && styles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === 'ghost' ? Colors.yellow : Colors.charcoal}
          />
        ) : (
          <Text style={[styles.labelBase, LABEL_COLORS[variant], labelSizeStyle, textStyle]}>
            {label}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const SIZE_STYLES: Record<string, ViewStyle> = {
  sm: { paddingHorizontal: 20, paddingVertical: 10 },
  md: { paddingHorizontal: 28, paddingVertical: 14 },
  lg: { paddingHorizontal: 36, paddingVertical: 18 },
};

const LABEL_SIZES: Record<string, TextStyle> = {
  sm: { fontSize: FontSize.sm },
  md: { fontSize: FontSize.base },
  lg: { fontSize: FontSize.md },
};

const VARIANT_STYLES: Record<string, ViewStyle> = {
  secondary: {
    backgroundColor: Colors.creamDark,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 100,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderRadius: 100,
  },
  coral: {
    backgroundColor: Colors.coral,
    borderRadius: 100,
    shadowColor: Colors.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  dark: {
    backgroundColor: Colors.dark,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
  },
};

const LABEL_COLORS: Record<string, TextStyle> = {
  secondary: { color: Colors.charcoal },
  ghost: { color: Colors.yellow },
  coral: { color: Colors.white },
  dark: { color: Colors.white },
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overflow: {
    borderRadius: 100,
    overflow: 'hidden',
  },
  primaryShadow: {
    borderRadius: 100,
    shadowColor: Colors.yellow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.42,
    shadowRadius: 18,
    elevation: 10,
  },
  disabled: { opacity: 0.45 },
  labelBase: {
    fontFamily: FontFamily.semibold,
    fontWeight: FontWeight.semibold,
  },
  labelDark: { color: Colors.dark },
});
