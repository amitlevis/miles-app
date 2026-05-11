import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize, FontWeight } from '../../constants/typography';
import { PartnerHeader } from '../../components/PartnerHeader';
import { TogetherModeBanner } from '../../components/TogetherModeBanner';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useTheme } from '../../theme/ThemeContext';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const TOGETHER_OPTIONS = [
  {
    icon: '▶',
    title: 'Watch Together',
    subtitle: 'Sync YouTube videos in real time',
    route: 'WatchTogether' as const,
    colors: ['#2A0F0A', '#3D1812'] as const,
    accent: Colors.coral,
  },
  {
    icon: '♪',
    title: 'Listen Together',
    subtitle: 'Share music & playlists in sync',
    route: 'ListenTogether' as const,
    colors: ['#1A1228', '#241838'] as const,
    accent: Colors.lavender,
  },
  {
    icon: '◆',
    title: 'Play Games',
    subtitle: '7 games built for couples',
    route: 'Games' as const,
    colors: ['#0A1E2A', '#0E2A38'] as const,
    accent: '#4A9ABF',
  },
];

const GAME_PREVIEWS = [
  { icon: '●', name: 'Couple Trivia', tag: 'Popular', accent: Colors.yellow },
  { icon: '●', name: 'Truth or Dare', tag: 'Spicy', accent: Colors.coral },
  { icon: '●', name: 'Bucket List', tag: 'Romantic', accent: '#E8A0BF' },
  { icon: '●', name: 'Would You Rather', tag: 'Daily', accent: Colors.lavender },
  { icon: '●', name: 'Story Builder', tag: 'Creative', accent: '#4ADE80' },
  { icon: '●', name: 'Drawing Battle', tag: 'Fun', accent: '#4A9ABF' },
];

export function TogetherScreen() {
  const navigation = useNavigation<Nav>();
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <TogetherModeBanner />
      <PartnerHeader />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Together</Text>
          <Text style={styles.pageSubtitle}>
            Being far apart doesn't mean you can't share moments.
          </Text>
        </View>

        {/* Main activity cards */}
        <View style={styles.optionList}>
          {TOGETHER_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.route}
              onPress={() => navigation.navigate(opt.route)}
              activeOpacity={0.85}
              style={styles.optionCard}
            >
              <LinearGradient
                colors={[...opt.colors]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.optionGradient}
              >
                {/* Icon circle */}
                <View
                  style={[
                    styles.optionIconCircle,
                    { backgroundColor: `${opt.accent}22`, borderColor: `${opt.accent}44` },
                  ]}
                >
                  <Text style={[styles.optionIcon, { color: opt.accent }]}>
                    {opt.icon}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.optionTitle}>{opt.title}</Text>
                  <Text style={styles.optionSubtitle}>{opt.subtitle}</Text>
                </View>

                <Text style={[styles.optionArrow, { color: opt.accent }]}>→</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Games grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Games</Text>
          <Text style={styles.sectionCount}>7 games</Text>
        </View>

        <View style={styles.gameGrid}>
          {GAME_PREVIEWS.map((g) => (
            <TouchableOpacity
              key={g.name}
              style={styles.gameCard}
              onPress={() => navigation.navigate('Games')}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.gameAccentDot,
                  { backgroundColor: g.accent },
                ]}
              />
              <Text style={styles.gameName}>{g.name}</Text>
              <View
                style={[
                  styles.gameTagPill,
                  { backgroundColor: `${g.accent}18`, borderColor: `${g.accent}36` },
                ]}
              >
                <Text style={[styles.gameTagText, { color: g.accent }]}>{g.tag}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Date planner CTA */}
        <TouchableOpacity
          style={styles.plannerCta}
          onPress={() => navigation.navigate('DatePlanner')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#1E1208', '#2A1A0A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.plannerCtaInner}
          >
            <View style={styles.plannerCtaLeft}>
              <Text style={styles.plannerCtaTitle}>Need a date idea?</Text>
              <Text style={styles.plannerCtaSub}>
                AI picks the perfect plan for your time zones
              </Text>
            </View>
            <View style={styles.plannerCtaArrowCircle}>
              <Text style={styles.plannerCtaArrow}>→</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.cream },
  content: { paddingBottom: 32 },

  pageHeader: {
    paddingHorizontal: 20,
    paddingTop: 28,
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: FontSize['3xl'],
    color: Colors.charcoal,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.black,
    letterSpacing: -1.5,
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
    lineHeight: 22,
  },

  optionList: { paddingHorizontal: 16, gap: 12, marginBottom: 36 },
  optionCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 18,
    elevation: 10,
  },
  optionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
  },
  optionIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIcon: {
    fontSize: 22,
    fontWeight: FontWeight.bold,
  },
  optionTitle: {
    fontSize: FontSize.md,
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },
  optionSubtitle: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.48)',
    fontFamily: FontFamily.regular,
    marginTop: 3,
  },
  optionArrow: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: FontSize.base,
    color: Colors.charcoal,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionCount: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
  },

  gameGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 32,
  },
  gameCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    width: '47%',
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#2C2C2C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  gameAccentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  gameName: {
    fontSize: FontSize.sm,
    color: Colors.charcoal,
    fontFamily: FontFamily.semibold,
    fontWeight: FontWeight.semibold,
    lineHeight: 18,
  },
  gameTagPill: {
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  gameTagText: {
    fontSize: 10,
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
  },

  plannerCta: {
    marginHorizontal: 16,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,184,48,0.18)',
    shadowColor: Colors.yellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 6,
  },
  plannerCtaInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 22,
    gap: 16,
  },
  plannerCtaLeft: { flex: 1 },
  plannerCtaTitle: {
    fontSize: FontSize.md,
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    marginBottom: 4,
  },
  plannerCtaSub: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.42)',
    fontFamily: FontFamily.regular,
    lineHeight: 18,
  },
  plannerCtaArrowCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,184,48,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,184,48,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plannerCtaArrow: {
    fontSize: FontSize.lg,
    color: Colors.yellow,
    fontWeight: FontWeight.bold,
  },
});
