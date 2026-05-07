import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Shadows } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { useCoupleStore } from '../../store/coupleStore';

// ─── Game definitions ────────────────────────────────────────────────────────

const TRIVIA = {
  id: 'trivia',
  emoji: '🧠',
  name: 'Couple Trivia',
  tag: 'Popular',
  tagColor: Colors.coral,
  desc: 'How well do you really know each other?',
  gradient: ['#FFB830', '#FF9F1C'] as const,
  nextLabel: 'Next question →',
  items: [
    { type: 'question', text: "What's your partner's biggest fear?" },
    { type: 'question', text: 'Where does your partner want to travel most?' },
    { type: 'question', text: "What's their go-to comfort food?" },
    { type: 'question', text: 'What was the first song they sent you?' },
    { type: 'question', text: "What's something they do that makes you smile instantly?" },
  ],
};

const TRUTH_DARE = {
  id: 'truthdare',
  emoji: '🎭',
  name: 'Truth or Dare',
  tag: 'Spicy',
  tagColor: '#E8A0BF',
  desc: 'LDR-safe cards — deepens your connection',
  gradient: ['#FF7A5C', '#E8A0BF'] as const,
  nextLabel: 'Next card →',
  items: [
    { type: 'Truth', text: "What's the first thing you noticed about me?" },
    { type: 'Dare', text: 'Send me a voice message saying something you love about me.' },
    { type: 'Truth', text: "What's your favorite memory of us so far?" },
    { type: 'Dare', text: 'Take a selfie right now and send it to me.' },
    { type: 'Truth', text: 'What are you most looking forward to when we finally meet again?' },
    { type: 'Dare', text: 'Sing the first line of a song that reminds you of us.' },
    { type: 'Truth', text: 'What is one thing you wish we could do together right now?' },
  ],
};

const BUCKET_LIST = {
  id: 'bucket',
  emoji: '💝',
  name: 'Bucket List',
  tag: 'Romantic',
  tagColor: Colors.lavenderDark,
  desc: 'Discover your shared dreams — double-blind',
  gradient: ['#C9B8E8', '#9B8AC4'] as const,
  nextLabel: 'Next dream →',
  items: [
    { type: 'dream', text: 'Visit Japan together 🇯🇵' },
    { type: 'dream', text: 'Learn to dance together 💃' },
    { type: 'dream', text: 'Road trip with no set destination 🚗' },
    { type: 'dream', text: 'Wake up in a cabin in the mountains 🏔️' },
    { type: 'dream', text: 'Watch a meteor shower together 🌠' },
    { type: 'dream', text: 'Cook a meal from scratch for each other 🍝' },
  ],
};

const WOULD_RATHER = {
  id: 'would',
  emoji: '🤔',
  name: 'Would You Rather',
  tag: 'Daily',
  tagColor: '#4A9ABF',
  desc: 'Spark conversations — one dilemma at a time',
  gradient: ['#4A9ABF', '#C9B8E8'] as const,
  nextLabel: 'Next one →',
  items: [
    { type: 'A', text: 'Live in a big city', optionB: 'Live in a small cozy town' },
    { type: 'A', text: 'Never be apart again', optionB: 'Visit each other 3× a year' },
    { type: 'A', text: 'Breakfast in bed', optionB: 'Sunset candlelit dinner' },
    { type: 'A', text: 'See each other in 1 week', optionB: 'Call for 4 hours right now' },
    { type: 'A', text: 'Read each other\'s minds', optionB: 'Always know each other\'s location' },
  ],
};

const GAMES = [TRIVIA, TRUTH_DARE, BUCKET_LIST, WOULD_RATHER];

type GameDef = typeof TRIVIA | typeof TRUTH_DARE | typeof BUCKET_LIST | typeof WOULD_RATHER;

// ─── Gameplay renderers ──────────────────────────────────────────────────────

function TriviaCard({ item, partnerName }: { item: typeof TRIVIA['items'][0]; partnerName: string }) {
  return (
    <>
      <Text style={play.cardEmoji}>❓</Text>
      <Text style={play.cardText}>{item.text}</Text>
      <Text style={play.hint}>Both you and {partnerName} answer out loud — no peeking!</Text>
    </>
  );
}

function TruthDareCard({ item }: { item: typeof TRUTH_DARE['items'][0] }) {
  const isTruth = item.type === 'Truth';
  return (
    <>
      <View style={[play.typeBadge, isTruth ? play.typeBadgeTruth : play.typeBadgeDare]}>
        <Text style={play.typeBadgeText}>{item.type}</Text>
      </View>
      <Text style={play.cardText}>{item.text}</Text>
    </>
  );
}

function BucketCard({ item, partnerName }: { item: typeof BUCKET_LIST['items'][0]; partnerName: string }) {
  const [myVote, setMyVote] = useState<'yes' | 'no' | null>(null);
  return (
    <>
      <Text style={play.cardEmoji}>✈️</Text>
      <Text style={play.cardText}>{item.text}</Text>
      <Text style={play.hint}>Would you do this with {partnerName}?</Text>
      <View style={play.voteRow}>
        <TouchableOpacity
          style={[play.voteBtn, play.voteBtnYes, myVote === 'yes' && play.voteBtnActive]}
          onPress={() => setMyVote('yes')}
          activeOpacity={0.8}
        >
          <Text style={play.voteBtnText}>✅ Yes!</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[play.voteBtn, play.voteBtnNo, myVote === 'no' && play.voteBtnActive]}
          onPress={() => setMyVote('no')}
          activeOpacity={0.8}
        >
          <Text style={play.voteBtnText}>❌ Pass</Text>
        </TouchableOpacity>
      </View>
      {myVote && (
        <Text style={play.voteResult}>
          {myVote === 'yes' ? '💝 Added to your shared dreams!' : 'Onto the next one...'}
        </Text>
      )}
    </>
  );
}

function WouldRatherCard({ item }: { item: typeof WOULD_RATHER['items'][0] }) {
  const [choice, setChoice] = useState<'A' | 'B' | null>(null);
  const optA = item.text;
  const optB = (item as any).optionB as string;
  return (
    <>
      <Text style={play.wouldLabel}>Would you rather…</Text>
      <TouchableOpacity
        style={[play.wouldOption, choice === 'A' && play.wouldOptionChosen]}
        onPress={() => setChoice('A')}
        activeOpacity={0.85}
      >
        <Text style={play.wouldOptionText}>{optA}</Text>
      </TouchableOpacity>
      <Text style={play.wouldOr}>or</Text>
      <TouchableOpacity
        style={[play.wouldOption, choice === 'B' && play.wouldOptionChosen]}
        onPress={() => setChoice('B')}
        activeOpacity={0.85}
      >
        <Text style={play.wouldOptionText}>{optB}</Text>
      </TouchableOpacity>
      {choice && <Text style={play.voteResult}>You chose: {choice === 'A' ? optA : optB} ✨</Text>}
    </>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export function GamesScreen() {
  const navigation = useNavigation();
  const { partner } = useCoupleStore();
  const [activeGame, setActiveGame] = useState<GameDef | null>(null);
  const [idx, setIdx] = useState(0);

  const partnerName = partner?.name ?? 'your partner';

  if (activeGame) {
    const item = activeGame.items[idx % activeGame.items.length];
    const progress = ((idx % activeGame.items.length) + 1) / activeGame.items.length;

    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { setActiveGame(null); setIdx(0); }}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{activeGame.name}</Text>
          <Text style={styles.counter}>{(idx % activeGame.items.length) + 1}/{activeGame.items.length}</Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
        </View>

        <ScrollView contentContainerStyle={styles.playContent}>
          <LinearGradient
            colors={[...activeGame.gradient]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.playCard, Shadows.yellow]}
          >
            {activeGame.id === 'trivia' && <TriviaCard item={item as any} partnerName={partnerName} />}
            {activeGame.id === 'truthdare' && <TruthDareCard item={item as any} />}
            {activeGame.id === 'bucket' && <BucketCard item={item as any} partnerName={partnerName} />}
            {activeGame.id === 'would' && <WouldRatherCard item={item as any} />}
          </LinearGradient>

          <TouchableOpacity
            style={styles.nextBtn}
            onPress={() => setIdx((i) => i + 1)}
            activeOpacity={0.85}
          >
            <Text style={styles.nextBtnText}>{activeGame.nextLabel}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Games</Text>
        <View style={{ width: 48 }} />
      </View>
      <ScrollView contentContainerStyle={styles.listContent}>
        <Text style={styles.subtitle}>Play with {partnerName}</Text>
        <View style={styles.gameList}>
          {GAMES.map((g) => (
            <TouchableOpacity
              key={g.id}
              onPress={() => { setActiveGame(g); setIdx(0); }}
              activeOpacity={0.88}
              style={Shadows.medium}
            >
              <LinearGradient
                colors={[...g.gradient]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gameCard}
              >
                <Text style={styles.gameEmoji}>{g.emoji}</Text>
                <View style={styles.gameInfo}>
                  <View style={styles.gameTopRow}>
                    <Text style={styles.gameName}>{g.name}</Text>
                    <View style={[styles.tagBadge, { backgroundColor: g.tagColor + '55' }]}>
                      <Text style={styles.tagText}>{g.tag}</Text>
                    </View>
                  </View>
                  <Text style={styles.gameDesc}>{g.desc}</Text>
                  <Text style={styles.gameCount}>{g.items.length} cards</Text>
                </View>
                <Text style={styles.playArrow}>▶</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonTitle}>Coming soon</Text>
          <View style={styles.comingSoonGrid}>
            {['📖 Story Builder', '🎨 Drawing Battle', '🔮 Personality Match'].map((g) => (
              <View key={g} style={styles.comingSoonPill}>
                <Text style={styles.comingSoonText}>{g}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.cream },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  backText: { fontSize: FontSize.base, color: Colors.charcoal, fontFamily: FontFamily.medium, minWidth: 48 },
  title: { flex: 1, fontSize: FontSize.md, color: Colors.charcoal, fontFamily: FontFamily.bold, textAlign: 'center' },
  counter: { fontSize: FontSize.sm, color: Colors.textMuted, fontFamily: FontFamily.medium, minWidth: 48, textAlign: 'right' },
  progressTrack: { height: 3, backgroundColor: Colors.border },
  progressFill: { height: 3, backgroundColor: Colors.yellow },

  listContent: { padding: 20, paddingBottom: 40 },
  subtitle: { fontSize: FontSize.base, color: Colors.textSecondary, fontFamily: FontFamily.regular, marginBottom: 20 },
  gameList: { gap: 14, marginBottom: 32 },
  gameCard: { borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
  gameEmoji: { fontSize: 40 },
  gameInfo: { flex: 1, gap: 3 },
  gameTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  gameName: { fontSize: FontSize.base, color: Colors.white, fontFamily: FontFamily.bold },
  tagBadge: { borderRadius: 100, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontSize: FontSize.xs, color: Colors.white, fontFamily: FontFamily.semibold },
  gameDesc: { fontSize: FontSize.sm, color: Colors.white, fontFamily: FontFamily.regular, opacity: 0.9 },
  gameCount: { fontSize: FontSize.xs, color: Colors.white, fontFamily: FontFamily.medium, opacity: 0.7, marginTop: 2 },
  playArrow: { fontSize: FontSize.xl, color: Colors.white, opacity: 0.8 },
  comingSoon: { backgroundColor: Colors.creamDark, borderRadius: 20, padding: 20, gap: 14 },
  comingSoonTitle: { fontSize: FontSize.sm, color: Colors.textMuted, fontFamily: FontFamily.semibold },
  comingSoonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  comingSoonPill: {
    backgroundColor: Colors.white,
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  comingSoonText: { fontSize: FontSize.sm, color: Colors.charcoal, fontFamily: FontFamily.medium },

  playContent: { padding: 24, alignItems: 'center', gap: 20 },
  playCard: {
    width: '100%',
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    gap: 16,
    minHeight: 240,
    justifyContent: 'center',
  },
  nextBtn: {
    backgroundColor: Colors.charcoal,
    borderRadius: 100,
    paddingVertical: 16,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
    ...Shadows.small,
  },
  nextBtnText: { fontSize: FontSize.base, color: Colors.white, fontFamily: FontFamily.semibold },
});

const play = StyleSheet.create({
  cardEmoji: { fontSize: 52, marginBottom: 4 },
  cardText: { fontSize: FontSize.lg, color: Colors.white, fontFamily: FontFamily.bold, textAlign: 'center', lineHeight: 30 },
  hint: { fontSize: FontSize.sm, color: Colors.white, fontFamily: FontFamily.regular, opacity: 0.8, textAlign: 'center' },
  typeBadge: { borderRadius: 100, paddingHorizontal: 20, paddingVertical: 8, marginBottom: 8 },
  typeBadgeTruth: { backgroundColor: 'rgba(255,255,255,0.3)' },
  typeBadgeDare: { backgroundColor: 'rgba(0,0,0,0.2)' },
  typeBadgeText: { fontSize: FontSize.base, color: Colors.white, fontFamily: FontFamily.bold, letterSpacing: 1 },
  voteRow: { flexDirection: 'row', gap: 12, marginTop: 8, width: '100%' },
  voteBtn: {
    flex: 1, borderRadius: 16, paddingVertical: 14,
    alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)',
  },
  voteBtnYes: { backgroundColor: 'rgba(255,255,255,0.15)' },
  voteBtnNo: { backgroundColor: 'rgba(0,0,0,0.1)' },
  voteBtnActive: { backgroundColor: 'rgba(255,255,255,0.35)', borderColor: Colors.white },
  voteBtnText: { fontSize: FontSize.base, color: Colors.white, fontFamily: FontFamily.semibold },
  voteResult: { fontSize: FontSize.sm, color: Colors.white, fontFamily: FontFamily.medium, opacity: 0.9 },
  wouldLabel: { fontSize: FontSize.base, color: Colors.white, fontFamily: FontFamily.medium, opacity: 0.8, marginBottom: 4 },
  wouldOption: {
    width: '100%', borderRadius: 18, padding: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
  },
  wouldOptionChosen: { backgroundColor: 'rgba(255,255,255,0.4)', borderColor: Colors.white },
  wouldOptionText: { fontSize: FontSize.base, color: Colors.white, fontFamily: FontFamily.bold, textAlign: 'center' },
  wouldOr: { fontSize: FontSize.sm, color: Colors.white, fontFamily: FontFamily.regular, opacity: 0.7 },
});
