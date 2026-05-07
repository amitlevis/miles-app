import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { Button } from '../../components/ui/Button';
import { useCoupleStore, DEMO_USER, DEMO_PARTNER } from '../../store/coupleStore';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Welcome'> };

const { width } = Dimensions.get('window');

const FEATURES = [
  { emoji: '🌍', text: 'See exactly how far apart you are' },
  { emoji: '📸', text: "Photos appear on each other's screens" },
  { emoji: '🎬', text: 'Watch movies together in sync' },
  { emoji: '💌', text: 'Leave surprises in the Memory Jar' },
];

export function WelcomeScreen({ navigation }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const { login, linkPartner } = useCoupleStore();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleDemo = () => {
    login(DEMO_USER);
    linkPartner(DEMO_PARTNER);
  };

  return (
    <LinearGradient
      colors={['#FFF8E7', '#FFD470', '#FFB830']}
      locations={[0, 0.6, 1]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe}>
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.logoSection}>
            <Text style={styles.logoEmoji}>✈️</Text>
            <Text style={styles.appName}>Miles</Text>
            <Text style={styles.tagline}>Distance is just a number.</Text>
          </View>

          <View style={styles.features}>
            {FEATURES.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <Text style={styles.featureEmoji}>{f.emoji}</Text>
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>

          <View style={styles.actions}>
            <Button
              label="Get Started"
              size="lg"
              onPress={() => navigation.navigate('Login')}
              style={styles.primaryBtn}
            />
            <Button
              label="Try Demo"
              variant="ghost"
              size="md"
              onPress={handleDemo}
            />
          </View>

          <Text style={styles.footer}>
            Built for couples & friends who choose each other every day, across every mile.
          </Text>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingBottom: 40,
  },
  logoSection: { alignItems: 'center' },
  logoEmoji: { fontSize: 72, marginBottom: 8 },
  appName: {
    fontSize: 52,
    color: Colors.charcoal,
    fontFamily: FontFamily.bold,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: FontSize.lg,
    color: Colors.charcoal,
    fontFamily: FontFamily.regular,
    marginTop: 8,
    opacity: 0.7,
  },
  features: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 24,
    padding: 24,
    gap: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  featureEmoji: { fontSize: 26 },
  featureText: {
    fontSize: FontSize.base,
    color: Colors.charcoal,
    fontFamily: FontFamily.medium,
    flex: 1,
  },
  actions: { gap: 12, alignItems: 'center' },
  primaryBtn: { width: '100%' },
  footer: {
    fontSize: FontSize.sm,
    color: Colors.charcoal,
    fontFamily: FontFamily.regular,
    textAlign: 'center',
    opacity: 0.55,
    lineHeight: 20,
  },
});
