import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Shadows } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { PartnerHeader } from '../../components/PartnerHeader';
import { useCoupleStore } from '../../store/coupleStore';
import { RootStackParamList } from '../../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const TOGETHER_OPTIONS = [
  {
    emoji: '🎬',
    title: 'Watch Together',
    subtitle: 'Sync YouTube videos in real time',
    route: 'WatchTogether' as const,
    gradient: ['#FF7A5C', '#FFB830'] as const,
  },
  {
    emoji: '🎵',
    title: 'Listen Together',
    subtitle: 'Share music & playlists in sync',
    route: 'ListenTogether' as const,
    gradient: ['#9B8AC4', '#C9B8E8'] as const,
  },
  {
    emoji: '🎮',
    title: 'Play Games',
    subtitle: '7 games built for couples',
    route: 'Games' as const,
    gradient: ['#4A9ABF', '#C9B8E8'] as const,
  },
];

const GAME_PREVIEWS = [
  { emoji: '🧠', name: 'Couple Trivia', players: '2', tag: 'Popular' },
  { emoji: '😈', name: 'Truth or Dare', players: '2', tag: 'Spicy' },
  { emoji: '💝', name: 'Bucket List', players: '2', tag: 'Romantic' },
  { emoji: '🤔', name: 'Would You Rather', players: '2', tag: 'Daily' },
  { emoji: '📖', name: 'Story Builder', players: '2', tag: 'Creative' },
  { emoji: '🎨', name: 'Drawing Battle', players: '2', tag: 'Fun' },
  { emoji: '🔮', name: 'Personality Match', players: '2', tag: 'Weekly' },
];

export function TogetherScreen() {
  const navigation = useNavigation<Nav>();
  const { partner } = useCoupleStore();

  return (
    <SafeAreaView style={styles.safe}>
      <PartnerHeader />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Together</Text>
        <Text style={styles.pageSubtitle}>
          Because being far apart doesn't mean you can't share moments.
        </Text>

        <View style={styles.mainOptions}>
          {TOGETHER_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.route}
              onPress={() => navigation.navigate(opt.route)}
              activeOpacity={0.85}
              style={[styles.optionCard, Shadows.medium]}
            >
              <LinearGradient
                colors={[...opt.gradient]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.optionGradient}
              >
                <Text style={styles.optionEmoji}>{opt.emoji}</Text>
                <View>
                  <Text style={styles.optionTitle}>{opt.title}</Text>
                  <Text style={styles.optionSubtitle}>{opt.subtitle}</Text>
                </View>
                <Text style={styles.optionArrow}>→</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Games</Text>
        <View style={styles.gameGrid}>
          {GAME_PREVIEWS.map((g) => (
            <TouchableOpacity
              key={g.name}
              style={[styles.gameCard, Shadows.small]}
              onPress={() => navigation.navigate('Games')}
              activeOpacity={0.8}
            >
              <Text style={styles.gameEmoji}>{g.emoji}</Text>
              <Text style={styles.gameName}>{g.name}</Text>
              <View style={styles.gameTag}>
                <Text style={styles.gameTagText}>{g.tag}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.datePlanner}>
          <Text style={styles.datePlannerTitle}>📅 Need date ideas?</Text>
          <Text style={styles.datePlannerSub}>
            Our AI picks the perfect virtual date based on your mood & time zones.
          </Text>
          <TouchableOpacity
            style={styles.datePlannerBtn}
            onPress={() => navigation.navigate('DatePlanner')}
            activeOpacity={0.8}
          >
            <Text style={styles.datePlannerBtnText}>Explore Date Ideas →</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.cream },
  content: { paddingBottom: 32 },
  pageTitle: {
    fontSize: FontSize['2xl'],
    color: Colors.charcoal,
    fontFamily: FontFamily.bold,
    paddingHorizontal: 20,
    paddingTop: 24,
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
    paddingHorizontal: 20,
    marginBottom: 24,
    lineHeight: 22,
  },
  mainOptions: { paddingHorizontal: 20, gap: 14, marginBottom: 32 },
  optionCard: { borderRadius: 24, overflow: 'hidden' },
  optionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  optionEmoji: { fontSize: 36 },
  optionTitle: {
    fontSize: FontSize.md,
    color: Colors.white,
    fontFamily: FontFamily.bold,
  },
  optionSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.white,
    fontFamily: FontFamily.regular,
    opacity: 0.88,
    marginTop: 2,
  },
  optionArrow: {
    fontSize: FontSize.lg,
    color: Colors.white,
    fontFamily: FontFamily.bold,
    marginLeft: 'auto',
  },
  sectionTitle: {
    fontSize: FontSize.md,
    color: Colors.charcoal,
    fontFamily: FontFamily.bold,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  gameGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 28,
  },
  gameCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 14,
    width: '46%',
    alignItems: 'center',
  },
  gameEmoji: { fontSize: 32, marginBottom: 8 },
  gameName: {
    fontSize: FontSize.sm,
    color: Colors.charcoal,
    fontFamily: FontFamily.semibold,
    textAlign: 'center',
    marginBottom: 6,
  },
  gameTag: {
    backgroundColor: Colors.yellowPale,
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  gameTagText: {
    fontSize: FontSize.xs,
    color: Colors.charcoal,
    fontFamily: FontFamily.medium,
  },
  datePlanner: {
    marginHorizontal: 20,
    backgroundColor: Colors.yellowPale,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1.5,
    borderColor: Colors.yellowLight,
  },
  datePlannerTitle: {
    fontSize: FontSize.md,
    color: Colors.charcoal,
    fontFamily: FontFamily.bold,
    marginBottom: 8,
  },
  datePlannerSub: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
    lineHeight: 20,
    marginBottom: 16,
  },
  datePlannerBtn: {
    backgroundColor: Colors.yellow,
    borderRadius: 100,
    paddingVertical: 12,
    alignItems: 'center',
    ...Shadows.yellow,
  },
  datePlannerBtnText: {
    fontSize: FontSize.base,
    color: Colors.charcoal,
    fontFamily: FontFamily.semibold,
  },
});
