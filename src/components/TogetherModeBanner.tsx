/**
 * A persistent banner shown at the top of every tab when "We're together"
 * mode is active. Lets users see, at a glance, that the whole app is in
 * intimate mode — and tap to exit back to the apart view.
 */

import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/colors';
import { FontFamily, FontSize, FontWeight } from '../constants/typography';
import { useCoupleStore } from '../store/coupleStore';
import { animateThemeTransition } from '../theme/ThemeContext';

export function TogetherModeBanner() {
  const navigation = useNavigation<any>();
  const { togetherMode, setTogetherMode, partner } = useCoupleStore();
  const pulseAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (!togetherMode) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.6, duration: 1400, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [togetherMode]);

  if (!togetherMode) return null;

  const handleEnd = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    animateThemeTransition();
    setTogetherMode(false);
  };

  const goHome = () => {
    navigation.navigate('Home');
  };

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={goHome}>
      <LinearGradient
        colors={['#3D1812', '#2A100A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.banner}
      >
        <Animated.View style={[styles.dot, { opacity: pulseAnim }]} />
        <Text style={styles.text}>
          You're <Text style={styles.textBold}>together</Text>
          {partner?.name ? ` with ${partner.name}` : ''} ♥
        </Text>
        <TouchableOpacity
          onPress={handleEnd}
          activeOpacity={0.75}
          style={styles.endBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.endText}>End</Text>
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,184,48,0.18)',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.coral,
    shadowColor: Colors.coral,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  text: {
    flex: 1,
    fontSize: FontSize.sm,
    color: '#FFD9B5',
    fontFamily: FontFamily.regular,
    fontWeight: FontWeight.regular,
  },
  textBold: {
    color: Colors.yellow,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },
  endBtn: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  endText: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.78)',
    fontFamily: FontFamily.semibold,
    fontWeight: FontWeight.semibold,
  },
});
