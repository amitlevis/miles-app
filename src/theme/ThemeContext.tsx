/**
 * App-wide theme that switches when couples toggle "We're Together" mode.
 *
 * Two palettes:
 *  - apart: cream base, dark cards (the everyday LDR theme)
 *  - together: warm coral-amber gradient base, lighter accents (intimate, in-person)
 *
 * Every screen that wants to react to the mode imports `useTheme()` and uses
 * `theme.surface`, `theme.tabBarBg`, `theme.accent`, etc. instead of raw
 * Colors. Screens that haven't been migrated yet still work — they just don't
 * shift palettes.
 */

import React, { createContext, useContext, useMemo } from 'react';
import { LayoutAnimation, Platform, UIManager } from 'react-native';
import { Colors } from '../constants/colors';
import { useCoupleStore } from '../store/coupleStore';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export type ThemeMode = 'apart' | 'together';

export interface MilesTheme {
  mode: ThemeMode;

  // Surfaces
  background: string;
  surface: string;          // card / panel
  surfaceMuted: string;     // dim secondary surface
  border: string;

  // Tab bar
  tabBarBg: string;
  tabBarBorder: string;
  tabBarActiveBg: string;
  tabBarActiveBorder: string;
  tabBarActiveText: string;
  tabBarInactiveText: string;

  // Text
  text: string;
  textSecondary: string;
  textMuted: string;

  // Accents
  accent: string;       // primary brand accent
  accentText: string;   // text color used on top of accent
  ringGlow: string;     // ambient halo color (used by hero glows)

  // Status
  partnerLabel: string;     // "your partner" vs "you two"
  distanceLabel: string;    // "miles apart" vs "0 miles together"
  pronoun: string;          // "they" vs "we"
}

const APART_THEME: MilesTheme = {
  mode: 'apart',

  background: Colors.cream,
  surface: Colors.white,
  surfaceMuted: Colors.creamDark,
  border: Colors.border,

  tabBarBg: Colors.dark,
  tabBarBorder: 'rgba(255,255,255,0.1)',
  tabBarActiveBg: 'rgba(255,184,48,0.15)',
  tabBarActiveBorder: 'rgba(255,184,48,0.25)',
  tabBarActiveText: Colors.yellow,
  tabBarInactiveText: 'rgba(255,255,255,0.35)',

  text: Colors.charcoal,
  textSecondary: Colors.textSecondary,
  textMuted: Colors.textMuted,

  accent: Colors.yellow,
  accentText: Colors.dark,
  ringGlow: 'rgba(255,184,48,0.16)',

  partnerLabel: 'your partner',
  distanceLabel: 'miles apart',
  pronoun: 'they',
};

const TOGETHER_THEME: MilesTheme = {
  mode: 'together',

  // Warmer, intimate background (a faint coral cream)
  background: '#FFF6EE',
  surface: '#FFFAF3',
  surfaceMuted: '#FBEFE0',
  border: '#F0DCC6',

  // Tab bar shifts to a warm coral-tinted dark — visually different but still readable
  tabBarBg: '#2A100A',
  tabBarBorder: 'rgba(255,184,48,0.16)',
  tabBarActiveBg: 'rgba(255,122,92,0.22)',
  tabBarActiveBorder: 'rgba(255,122,92,0.42)',
  tabBarActiveText: '#FFD470',
  tabBarInactiveText: 'rgba(255,212,170,0.5)',

  text: '#2A1810',
  textSecondary: '#7A4A30',
  textMuted: '#A88A70',

  accent: Colors.coral,
  accentText: Colors.white,
  ringGlow: 'rgba(255,122,92,0.22)',

  partnerLabel: 'us',
  distanceLabel: '0 miles · together',
  pronoun: 'we',
};

const ThemeContext = createContext<MilesTheme>(APART_THEME);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const togetherMode = useCoupleStore((s) => s.togetherMode);

  const theme = useMemo(
    () => (togetherMode ? TOGETHER_THEME : APART_THEME),
    [togetherMode]
  );

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): MilesTheme {
  return useContext(ThemeContext);
}

/**
 * Smooth cross-fade when toggling together mode. Call this just before
 * setTogetherMode(...) so the next render animates in.
 */
export function animateThemeTransition() {
  LayoutAnimation.configureNext({
    duration: 420,
    create: { type: 'easeInEaseOut', property: 'opacity' },
    update: { type: 'easeInEaseOut' },
    delete: { type: 'easeInEaseOut', property: 'opacity' },
  });
}
