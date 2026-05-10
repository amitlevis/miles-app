import { Platform } from 'react-native';

export const FontFamily = {
  regular: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
  medium: Platform.select({ ios: 'System', android: 'sans-serif-medium', default: 'System' }),
  semibold: Platform.select({ ios: 'System', android: 'sans-serif-medium', default: 'System' }),
  bold: Platform.select({ ios: 'System', android: 'sans-serif-bold', default: 'System' }),
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
  black: '900' as const,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  '2xl': 30,
  '3xl': 38,
  '4xl': 54,
  '5xl': 72,
};

export const LineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
};
