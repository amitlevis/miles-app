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
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize, FontWeight } from '../../constants/typography';
import { useCoupleStore } from '../../store/coupleStore';

// ─── Game definitions ────────────────────────────────────────────────────────

const TRIVIA = {
  id: 'trivia',
  icon: '🧠',
  name: 'Couple Trivia',
  tag: 'Popular',
  accent: Colors.yellow,
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
  icon: '🎭',
  name: 'Truth or Dare',
  tag: 'Spicy',
  accent: '#E8A0BF',
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
  icon: '💝',
  name: 'Bucket List',
  tag: 'Romantic',
  accent: Colors.lavenderDark,
  desc: 'Discover your shared dreams',
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
  icon: '🤔',
  name: 'Would You Rather',
  tag: 'Daily',
  accent: '#4A9ABF',
  desc: 'Spark conversations — one dilemma at a time',
  gradient: ['#4A9ABF', '#C9B8E8'] as const,
  nextLabel: 'Next one →',
  items: [
    { type: 'A', text: 'Live in a big city', optionB: 'Live in a small cozy town' },
    { type: 'A', text: 'Never be apart again', optionB: 'Visit each other 3× a year' },
    { type: 'A', text: 'Breakfast in bed', optionB: 'Sunset candlelit dinner' },
    { type: 'A', text: 'See each other in 1 week', optionB: 'Call for 4 hours right now' },
    { type: 'A', text: "Read each other's minds", optionB: "Always know each other's location" },
  ],
};

const GAMES = [TRIVIA, TRUTH_DARE, BUCKET_LIST, WOULD_RATHER];

type GameDef = (typeof GAMES)[number];

// ─── Card renderers ──────────────────────────────────────────────────────────

function TriviaCard({
  item,
  partnerName,
}: {
  item: (typeof TRIVIA)['items'][0];
  partnerName: string;
}) {
  return (
    <>
      <Text style={play.cardEmoji}>❓</Text>
      <Text style={play.cardText}>{item.text}</Text>
      <Text style={play.hint}>
        You and {partnerName} answer out loud — no peeking!
      </Text>
    </>
  );
}

function TruthDareCard({ item }: { item: (typeof TRUTH_DARE)['items'][0] }) {
  const isTruth = item.type === 'Truth';
  return (
    <>
      <View
        style={[
          play.typeBadge,
          isTruth ? play.typeBadgeTruth : play.typeBadgeDare,
        ]}
      >
        <Text style={play.typeBadgeText}>{item.type}</Text>
      </View>
      <Text style={play.cardText}>{item.text}</Text>
    </>
  );
}

function BucketCard({
  item,
  partnerName,
}: {
  item: (typeof BUCKET_LIST)['items'][0];
  partnerName: string;
}) {
  const [vote, setVote] = useState<'yes' | 'no' | null>(null);
  return (
    <>
      <Text style={play.cardEmoji}>✈️</Text>
      <Text style={play.cardText}>{item.text}</Text>
      <Text style={play.hint}>Would you do this with {partnerName}?</Text>
      <View style={play.voteRow}>
        <TouchableOpacity
          style={[
            play.voteBtn,
            play.voteBtnYes,
            vote === 'yes' && play.voteBtnActive,
          ]}
          onPress={() => setVote('yes')}
          activeOpacity={0.8}
        >
          <Text style={play.voteBtnText}>✅ Yes!</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            play.voteBtn,
            play.voteBtnNo,
            vote === 'no' && play.voteBtnActive,
          ]}
          onPress={() => setVote('no')}
          activeOpacity={0.8}
        >
          <Text style={play.voteBtnText}>❌ Pass</Text>
        </TouchableOpacity>
      </View>
      {vote && (
        <Text style={play.voteResult}>
          {vote === 'yes'
            ? '💝 Added to your shared dreams!'
            : 'Onto the next one...'}
        </Text>
      )}
    </>
  );
}

function WouldRatherCard({ item }: { item: (typeof WOULD_RATHER)['items'][0] }) {
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
      <Text style={play.wouldOr}>OR</Text>
      <TouchableOpacity
        style={[play.wouldOption, choice === 'B' && play.wouldOptionChosen]}
        onPress={() => setChoice('B')}
        activeOpacity={0.85}
      >
        <Text style={play.wouldOptionText}>{optB}</Text>
      </TouchableOpacity>
      {choice && (
        <Text style={play.voteResult}>
          You chose: {choice === 'A' ? optA : optB} ✨
        </Text>
      )}
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

  // ── Active game view ──────────────────────────────────────────────────────
  if (activeGame) {
    const item = activeGame.items[idx % activeGame.items.length];
    const progress =
      ((idx % activeGame.items.length) + 1) / activeGame.items.length;

    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              setActiveGame(null);
              setIdx(0);
            }}
            style={styles.backBtn}
            activeOpacity={0.75}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{activeGame.name}</Text>
          </View>
          <Text style={styles.counterText}>
            {(idx % activeGame.items.length) + 1}/{activeGame.items.length}
          </Text>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[styles.progressFill, { width: `${progress * 100}%` as any }]}
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.playContent}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={[...activeGame.gradient]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.playCard}
          >
            {activeGame.id === 'trivia' && (
              <TriviaCard item={item as any} partnerName={partnerName} />
            )}
            {activeGame.id === 'truthdare' && (
              <TruthDareCard item={item as any} />
            )}
            {activeGame.id === 'bucket' && (
              <BucketCard item={item as any} partnerName={partnerName} />
            )}
            {activeGame.id === 'would' && <WouldRatherCard item={item as any} />}
          </LinearGradient>

          <TouchableOpacity
            style={styles.nextBtn}
            onPress={() => setIdx((i) => i + 1)}
            activeOpacity={0.88}
          >
            <Text style={styles.nextBtnText}>{activeGame.nextLabel}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Game list view ────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.75}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Games</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroBlock}>
          <Text style={styles.heroTitle}>Play with{'\n'}{partnerName}</Text>
          <Text style={styles.heroSub}>
            Bite-size games to spark conversation, daydream, and learn each other better.
          </Text>
        </View>

        <View style={styles.gameList}>
          {GAMES.map((g) => (
            <TouchableOpacity
              key={g.id}
              onPress={() => {
                setActiveGame(g);
                setIdx(0);
              }}
              activeOpacity={0.85}
              style={styles.gameCard}
            >
              <View
                style={[
                  styles.gameIconBox,
                  {
                    backgroundColor: `${g.accent}1F`,
                    borderColor: `${g.accent}44`,
                  },
                ]}
              >
                <Text style={styles.gameIcon}>{g.icon}</Text>
              </View>

              <View style={styles.gameInfo}>
                <View style={styles.gameTopRow}>
                  <Text style={styles.gameName}>{g.name}</Text>
                  <View
                    style={[
                      styles.tagPill,
                      {
                        backgroundColor: `${g.accent}18`,
                        borderColor: `${g.accent}40`,
                      },
                    ]}
                  >
                    <Text style={[styles.tagText, { color: g.accent }]}>
                      {g.tag}
                    </Text>
                  </View>
                </View>
                <Text style={styles.gameDesc}>{g.desc}</Text>
                <Text style={styles.gameCount}>{g.items.length} cards</Text>
              </View>

              <Text style={styles.playArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Coming soon */}
        <View style={styles.comingSoonCard}>
          <Text style={styles.comingSoonLabel}>COMING SOON</Text>
          <View style={styles.comingSoonGrid}>
            {[
              { icon: '📖', name: 'Story Builder' },
              { icon: '🎨', name: 'Drawing Battle' },
              { icon: '🔮', name: 'Personality Match' },
            ].map((g) => (
              <View key={g.name} style={styles.comingSoonPill}>
                <Text style={styles.comingSoonPillIcon}>{g.icon}</Text>
                <Text style={styles.comingSoonPillText}>{g.name}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.cream },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.cream,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  backIcon: { fontSize: FontSize.lg, color: Colors.charcoal },
  headerCenter: { flex: 1 },
  headerTitle: {
    fontSize: FontSize.md,
    color: Colors.charcoal,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },
  counterText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontFamily: FontFamily.semibold,
    fontWeight: FontWeight.semibold,
    minWidth: 44,
    textAlign: 'right',
  },

  // Progress bar (active game)
  progressTrack: {
    height: 3,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 3,
    backgroundColor: Colors.yellow,
    borderRadius: 2,
  },

  // Hero
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  heroBlock: { paddingTop: 24, paddingHorizontal: 4, marginBottom: 24 },
  heroTitle: {
    fontSize: FontSize['2xl'],
    color: Colors.charcoal,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.black,
    letterSpacing: -1,
    lineHeight: FontSize['2xl'] * 1.15,
    marginBottom: 8,
  },
  heroSub: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
    lineHeight: 22,
  },

  // Game list
  gameList: { gap: 12, marginBottom: 32 },
  gameCard: {
    backgroundColor: Colors.white,
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#2C2C2C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  gameIconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  gameIcon: { fontSize: 26 },
  gameInfo: { flex: 1, gap: 4 },
  gameTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  gameName: {
    fontSize: FontSize.base,
    color: Colors.charcoal,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },
  tagPill: {
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 10,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },
  gameDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
  },
  gameCount: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
    marginTop: 2,
  },
  playArrow: {
    fontSize: FontSize.lg,
    color: Colors.textMuted,
    fontWeight: FontWeight.bold,
  },

  // Coming soon
  comingSoonCard: {
    backgroundColor: Colors.dark,
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    gap: 14,
  },
  comingSoonLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.35)',
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
    letterSpacing: 2,
  },
  comingSoonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  comingSoonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  comingSoonPillIcon: { fontSize: 14 },
  comingSoonPillText: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.55)',
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
  },

  // Active game
  playContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    alignItems: 'center',
    gap: 20,
  },
  playCard: {
    width: '100%',
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    gap: 18,
    minHeight: 280,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 20,
    elevation: 12,
  },
  nextBtn: {
    backgroundColor: Colors.dark,
    borderRadius: 100,
    paddingVertical: 16,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  nextBtnText: {
    fontSize: FontSize.base,
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },
});

const play = StyleSheet.create({
  cardEmoji: { fontSize: 52, marginBottom: 4 },
  cardText: {
    fontSize: FontSize.lg,
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
    lineHeight: 30,
  },
  hint: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.78)',
    fontFamily: FontFamily.regular,
    textAlign: 'center',
  },
  typeBadge: {
    borderRadius: 100,
    paddingHorizontal: 22,
    paddingVertical: 8,
    marginBottom: 8,
  },
  typeBadgeTruth: { backgroundColor: 'rgba(255,255,255,0.28)' },
  typeBadgeDare: { backgroundColor: 'rgba(0,0,0,0.22)' },
  typeBadgeText: {
    fontSize: FontSize.base,
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    letterSpacing: 1.2,
  },
  voteRow: { flexDirection: 'row', gap: 12, marginTop: 8, width: '100%' },
  voteBtn: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  voteBtnYes: { backgroundColor: 'rgba(255,255,255,0.14)' },
  voteBtnNo: { backgroundColor: 'rgba(0,0,0,0.12)' },
  voteBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.36)',
    borderColor: Colors.white,
  },
  voteBtnText: {
    fontSize: FontSize.base,
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },
  voteResult: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.92)',
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
  },
  wouldLabel: {
    fontSize: FontSize.base,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
    marginBottom: 4,
  },
  wouldOption: {
    width: '100%',
    borderRadius: 18,
    padding: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.32)',
    alignItems: 'center',
  },
  wouldOptionChosen: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderColor: Colors.white,
  },
  wouldOptionText: {
    fontSize: FontSize.base,
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
  },
  wouldOr: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    letterSpacing: 1.5,
  },
});
