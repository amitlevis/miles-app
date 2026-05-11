/**
 * One-time welcome overlay shown on first launch after couple-linking.
 * Three swipeable cards walk the user through the core mechanics:
 *  1. Send a vibe (mood ring)
 *  2. Reunion countdown & widgets
 *  3. Together mode toggle
 *
 * Dismissable; flips `hasSeenOnboarding` in the couple store so it never
 * appears again for this user.
 */

import React, { useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';
import { FontFamily, FontSize, FontWeight } from '../constants/typography';
import { useCoupleStore } from '../store/coupleStore';

const { width } = Dimensions.get('window');

interface Step {
  icon: string;
  title: string;
  body: string;
  hint: string;
}

const STEPS: Step[] = [
  {
    icon: '✦',
    title: 'Send a vibe',
    body: 'Tap any emoji in the ring on your home screen to instantly let your partner know how you feel.',
    hint: 'They feel it on their phone right away.',
  },
  {
    icon: '◎',
    title: 'See your distance & reunion',
    body: 'The dark widgets on Home show how far apart you are and the days left until you reunite.',
    hint: 'Tap the countdown widget to set or change the date.',
  },
  {
    icon: '🫶',
    title: '"We\'re together" mode',
    body: "When you're physically together, tap the button on Home. The whole app transforms to celebrate the moment.",
    hint: 'Distance hides. Tab bar shifts. Just you two.',
  },
];

export function OnboardingOverlay() {
  const { hasSeenOnboarding, isLinked, setHasSeenOnboarding, partner } =
    useCoupleStore();
  const [step, setStep] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isLinked && !hasSeenOnboarding) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [isLinked, hasSeenOnboarding]);

  if (!isLinked || hasSeenOnboarding) return null;

  const goToStep = (i: number) => {
    setStep(i);
    scrollRef.current?.scrollTo({ x: i * width, animated: true });
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const i = Math.round(x / width);
    if (i !== step) setStep(i);
  };

  const dismiss = () => setHasSeenOnboarding(true);

  const isLast = step === STEPS.length - 1;

  return (
    <Modal visible transparent animationType="fade">
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={['#0B0A09', '#16120D', '#231A0F', '#0B0A09']}
          locations={[0, 0.3, 0.7, 1]}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Glow */}
        <View style={styles.glow} pointerEvents="none">
          <LinearGradient
            colors={['rgba(255,184,48,0.2)', 'transparent']}
            style={{ flex: 1, borderRadius: 600 }}
          />
        </View>

        {/* Skip */}
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={dismiss}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <View style={styles.welcomeHeader}>
          <Text style={styles.welcomeTitle}>
            Welcome to Miles,{'\n'}
            <Text style={styles.welcomeTitleAccent}>
              you & {partner?.name ?? 'them'} ♥
            </Text>
          </Text>
          <Text style={styles.welcomeSub}>
            Here's how to get the most out of the app.
          </Text>
        </View>

        {/* Swipeable cards */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          style={styles.scroller}
        >
          {STEPS.map((s, i) => (
            <View key={i} style={styles.cardWrap}>
              <View style={styles.card}>
                <View style={styles.iconCircle}>
                  <Text style={styles.icon}>{s.icon}</Text>
                </View>
                <Text style={styles.stepLabel}>
                  STEP {i + 1} OF {STEPS.length}
                </Text>
                <Text style={styles.cardTitle}>{s.title}</Text>
                <Text style={styles.cardBody}>{s.body}</Text>
                <View style={styles.hintRow}>
                  <View style={styles.hintDot} />
                  <Text style={styles.hintText}>{s.hint}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Dots */}
        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => goToStep(i)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <View
                style={[
                  styles.dot,
                  i === step && styles.dotActive,
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* CTA */}
        <View style={styles.ctaWrap}>
          {!isLast ? (
            <TouchableOpacity
              onPress={() => goToStep(step + 1)}
              activeOpacity={0.88}
              style={styles.ctaBtn}
            >
              <LinearGradient
                colors={['#FFD470', '#FFB830', '#FF8C42']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <Text style={styles.ctaText}>Next →</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={dismiss}
              activeOpacity={0.88}
              style={styles.ctaBtn}
            >
              <LinearGradient
                colors={['#FFD470', '#FFB830', '#FF8C42']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <Text style={styles.ctaText}>Let's go ♥</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#0B0A09',
  },
  glow: {
    position: 'absolute',
    top: -150,
    left: -100,
    width: 500,
    height: 500,
  },
  skipBtn: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  skipText: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.45)',
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
  },

  welcomeHeader: {
    paddingHorizontal: 28,
    paddingTop: 110,
    paddingBottom: 30,
  },
  welcomeTitle: {
    fontSize: FontSize['2xl'],
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.black,
    letterSpacing: -1,
    lineHeight: FontSize['2xl'] * 1.18,
    marginBottom: 8,
  },
  welcomeTitleAccent: {
    color: Colors.yellow,
  },
  welcomeSub: {
    fontSize: FontSize.base,
    color: 'rgba(255,255,255,0.45)',
    fontFamily: FontFamily.regular,
    lineHeight: 22,
  },

  scroller: { flex: 1 },
  cardWrap: {
    width,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 28,
    padding: 28,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,184,48,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,184,48,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  icon: {
    fontSize: 22,
    color: Colors.yellow,
  },
  stepLabel: {
    fontSize: 10,
    color: 'rgba(255,184,48,0.7)',
    fontFamily: FontFamily.semibold,
    fontWeight: FontWeight.semibold,
    letterSpacing: 2,
  },
  cardTitle: {
    fontSize: FontSize.xl,
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.black,
    letterSpacing: -0.5,
  },
  cardBody: {
    fontSize: FontSize.base,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: FontFamily.regular,
    lineHeight: 24,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  hintDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.coral,
  },
  hintText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: 'rgba(255,212,170,0.7)',
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
    fontStyle: 'italic',
  },

  dots: {
    flexDirection: 'row',
    gap: 8,
    alignSelf: 'center',
    marginVertical: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.yellow,
  },

  ctaWrap: {
    paddingHorizontal: 28,
    paddingBottom: 44,
  },
  ctaBtn: {
    borderRadius: 100,
    overflow: 'hidden',
    shadowColor: Colors.yellow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 10,
  },
  ctaGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: FontSize.md,
    color: Colors.dark,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },
});
