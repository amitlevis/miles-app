import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize, FontWeight } from '../../constants/typography';
import { useCoupleStore, DEMO_USER, DEMO_PARTNER } from '../../store/coupleStore';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Welcome'> };

const { width, height } = Dimensions.get('window');

const FEATURES = [
  { icon: '✦', text: 'Real-time distance, beautifully visualized' },
  { icon: '✦', text: 'Photos appear instantly on their screen' },
  { icon: '✦', text: 'Watch movies in perfect sync' },
  { icon: '✦', text: 'Memory Jar — surprises to open anytime' },
];

const STARS = Array.from({ length: 32 }, (_, i) => ({
  x: Math.sin(i * 137.5 * (Math.PI / 180)) * width * 0.5 + width * 0.5,
  y: Math.cos(i * 137.5 * (Math.PI / 180)) * height * 0.4 + height * 0.35,
  size: (i % 3) + 1,
  opacity: 0.08 + (i % 4) * 0.06,
}));

export function WelcomeScreen({ navigation }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(48)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const { login, linkPartner } = useCoupleStore();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 900, delay: 80, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, delay: 200, useNativeDriver: true, speed: 8, bounciness: 8 }),
    ]).start();

    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 3200, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.5, duration: 3200, useNativeDriver: true }),
      ])
    );
    glowLoop.start();
    return () => glowLoop.stop();
  }, []);

  const handleDemo = () => {
    login(DEMO_USER);
    linkPartner(DEMO_PARTNER);
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#0B0A09', '#16120D', '#231A0F', '#0B0A09']}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Ambient golden glow */}
      <Animated.View
        style={[styles.glowBlob, { opacity: glowAnim }]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={[
            'rgba(255,184,48,0.22)',
            'rgba(255,122,92,0.1)',
            'transparent',
          ]}
          style={{ flex: 1, borderRadius: width }}
        />
      </Animated.View>

      {/* Star field */}
      {STARS.map((s, i) => (
        <View
          key={i}
          style={[
            styles.star,
            {
              left: s.x,
              top: s.y,
              width: s.size,
              height: s.size,
              opacity: s.opacity,
            },
          ]}
        />
      ))}

      <SafeAreaView style={styles.safe}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Logo */}
          <View style={styles.logoSection}>
            <Animated.View
              style={[styles.logoOrb, { transform: [{ scale: logoScale }] }]}
            >
              <LinearGradient
                colors={['rgba(255,212,112,0.2)', 'rgba(255,184,48,0.08)']}
                style={styles.logoOrbInner}
              >
                <Text style={styles.logoGlyph}>✈</Text>
              </LinearGradient>
            </Animated.View>
            <Text style={styles.appName}>miles</Text>
            <Text style={styles.tagline}>Distance is just a number.</Text>
          </View>

          {/* Feature list */}
          <View style={styles.featureList}>
            {FEATURES.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <Text style={styles.featureIcon}>{f.icon}</Text>
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.87}
            >
              <LinearGradient
                colors={['#FFD470', '#FFB830', '#FF8C42']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryBtnInner}
              >
                <Text style={styles.primaryBtnText}>Get Started</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.ghostBtn}
              onPress={handleDemo}
              activeOpacity={0.7}
            >
              <Text style={styles.ghostBtnText}>Try Demo</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>
            For couples & friends who choose each other{'\n'}across every mile.
          </Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B0A09' },
  safe: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'space-between',
    paddingTop: 44,
    paddingBottom: 44,
  },
  glowBlob: {
    position: 'absolute',
    top: -height * 0.12,
    left: -width * 0.18,
    width: width * 1.36,
    height: height * 0.72,
  },
  star: {
    position: 'absolute',
    borderRadius: 2,
    backgroundColor: '#FFFDF5',
  },

  logoSection: { alignItems: 'center', gap: 14 },
  logoOrb: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    borderColor: 'rgba(255,184,48,0.2)',
    overflow: 'hidden',
    marginBottom: 4,
  },
  logoOrbInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlyph: {
    fontSize: 38,
    color: Colors.yellow,
  },
  appName: {
    fontSize: FontSize['4xl'],
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.black,
    letterSpacing: -3,
    lineHeight: FontSize['4xl'] * 1.05,
  },
  tagline: {
    fontSize: FontSize.base,
    color: 'rgba(255,255,255,0.38)',
    fontFamily: FontFamily.regular,
    letterSpacing: 0.4,
  },

  featureList: { gap: 10 },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  featureIcon: {
    fontSize: 10,
    color: Colors.yellow,
    opacity: 0.8,
    width: 14,
    textAlign: 'center',
  },
  featureText: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.68)',
    fontFamily: FontFamily.regular,
    flex: 1,
    lineHeight: 20,
  },

  actions: { gap: 12, alignItems: 'center' },
  primaryBtn: {
    width: '100%',
    borderRadius: 100,
    overflow: 'hidden',
    shadowColor: Colors.yellow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.48,
    shadowRadius: 20,
    elevation: 12,
  },
  primaryBtnInner: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: FontSize.md,
    color: Colors.dark,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.2,
  },
  ghostBtn: {
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  ghostBtnText: {
    fontSize: FontSize.base,
    color: 'rgba(255,255,255,0.38)',
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
  },

  footer: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.2)',
    fontFamily: FontFamily.regular,
    textAlign: 'center',
    lineHeight: 18,
  },
});
