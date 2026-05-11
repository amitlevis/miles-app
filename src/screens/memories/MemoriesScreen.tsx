import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize, FontWeight } from '../../constants/typography';
import { PartnerHeader } from '../../components/PartnerHeader';
import { TogetherModeBanner } from '../../components/TogetherModeBanner';
import { DrawingCanvas } from '../../components/DrawingCanvas';
import { useCoupleStore } from '../../store/coupleStore';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useTheme } from '../../theme/ThemeContext';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const MOCK_MEMORIES = [
  { id: '1', type: 'photo', icon: '📸', label: 'Good morning photo', date: 'Today' },
  { id: '2', type: 'drawing', icon: '✏️', label: 'Little doodle', date: 'Yesterday' },
  { id: '3', type: 'photo', icon: '📸', label: 'Thinking of you', date: 'Mar 24' },
  { id: '4', type: 'voice', icon: '🎙️', label: 'Voice message', date: 'Mar 23' },
];

const JOURNAL_PROMPTS = [
  "What's your favorite memory of your first conversation?",
  'Describe the moment you realized this person was special.',
  "What's something you can't wait to do together in person?",
  "What's a small thing your partner does that makes you smile?",
];

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'photos', label: 'Photos' },
  { key: 'drawings', label: 'Drawings' },
  { key: 'journal', label: 'Journal' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export function MemoriesScreen() {
  const navigation = useNavigation<Nav>();
  const theme = useTheme();
  const { partner } = useCoupleStore();
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [showSketch, setShowSketch] = useState(false);
  const [hasDoodle, setHasDoodle] = useState(false);

  const todayPrompt = JOURNAL_PROMPTS[new Date().getDay() % JOURNAL_PROMPTS.length];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <TogetherModeBanner />
      <PartnerHeader />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Page header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Memories</Text>
          <Text style={styles.pageSubtitle}>
            Everything you've shared with {partner?.name ?? 'them'}.
          </Text>
        </View>

        {/* Filter pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
        >
          {TABS.map((t) => {
            const active = activeTab === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                style={[styles.tab, active && styles.tabActive]}
                onPress={() => setActiveTab(t.key)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Memory Jar CTA */}
        <TouchableOpacity
          style={styles.jarCta}
          onPress={() => navigation.navigate('MemoryJar')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#1A1208', '#241A0A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.jarCtaInner}
          >
            <View style={styles.jarGlow} />
            <Text style={styles.jarGlyph}>🫙</Text>
            <View style={styles.jarTextWrap}>
              <Text style={styles.jarTitle}>Memory Jar</Text>
              <Text style={styles.jarSub}>
                3 surprises from {partner?.name ?? 'your partner'}
              </Text>
            </View>
            <View style={styles.jarBadge}>
              <Text style={styles.jarBadgeText}>3</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Daily Journal Prompt */}
        {(activeTab === 'all' || activeTab === 'journal') && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today's prompt</Text>
            </View>
            <View style={styles.journalCard}>
              <View style={styles.journalAccent} />
              <Text style={styles.journalQuote}>“{todayPrompt}”</Text>
              <Text style={styles.journalHint}>
                Write your answer — {partner?.name ?? 'they'} sees it at midnight.
              </Text>
              <TouchableOpacity
                style={styles.journalWriteBtn}
                activeOpacity={0.85}
              >
                <Text style={styles.journalWriteBtnText}>Write my answer →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* SketchPresence */}
        {(activeTab === 'all' || activeTab === 'drawings') && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Sketch for {partner?.name ?? 'them'}</Text>
            </View>
            <TouchableOpacity
              style={styles.sketchCta}
              onPress={() => setShowSketch(true)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#1A1208', '#241A0A']}
                style={styles.sketchCtaInner}
              >
                <View style={styles.sketchIconCircle}>
                  <Text style={styles.sketchIcon}>✏️</Text>
                </View>
                <View style={styles.sketchTextWrap}>
                  {hasDoodle ? (
                    <>
                      <Text style={styles.sketchTitle}>
                        Doodle left for {partner?.name ?? 'them'} ♥
                      </Text>
                      <Text style={styles.sketchSub}>Tap to draw another</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.sketchTitle}>Draw something</Text>
                      <Text style={styles.sketchSub}>
                        Brush, colors, eraser — appears on their screen
                      </Text>
                    </>
                  )}
                </View>
                <Text style={styles.sketchArrow}>→</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Shared moments grid */}
        {(activeTab === 'all' || activeTab === 'photos') && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Shared moments</Text>
              <Text style={styles.sectionCount}>{MOCK_MEMORIES.length} items</Text>
            </View>
            <View style={styles.memoryGrid}>
              {MOCK_MEMORIES.filter(
                (m) => activeTab === 'all' || m.type === activeTab.slice(0, -1)
              ).map((m) => (
                <View key={m.id} style={styles.memoryCard}>
                  <View style={styles.memoryIconBox}>
                    <Text style={styles.memoryIcon}>{m.icon}</Text>
                  </View>
                  <Text style={styles.memoryLabel}>{m.label}</Text>
                  <Text style={styles.memoryDate}>{m.date}</Text>
                </View>
              ))}
              <TouchableOpacity
                style={[styles.memoryCard, styles.addCard]}
                activeOpacity={0.8}
              >
                <View style={styles.addPlusRing}>
                  <Text style={styles.addPlusIcon}>+</Text>
                </View>
                <Text style={styles.addCardLabel}>Add photo</Text>
                <Text style={styles.addCardSub}>From camera or library</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Habit Streaks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Habit streaks</Text>
          </View>
          <View style={styles.streakCard}>
            <Text style={styles.streakIntro}>
              Build small rituals together — even from afar.
            </Text>
            <View style={styles.streakList}>
              {[
                { icon: '☕', name: 'Morning coffee together', streak: 12, done: true },
                { icon: '🚶', name: 'Daily walk check-in', streak: 5, done: false },
                { icon: '😴', name: 'Good night ritual', streak: 23, done: true },
              ].map((h) => (
                <View key={h.name} style={styles.streakRow}>
                  <View style={styles.streakIconBox}>
                    <Text style={styles.streakIcon}>{h.icon}</Text>
                  </View>
                  <View style={styles.streakInfo}>
                    <Text style={styles.streakName}>{h.name}</Text>
                    <Text style={styles.streakCount}>🔥 {h.streak} day streak</Text>
                  </View>
                  <View
                    style={[
                      styles.streakStatus,
                      h.done ? styles.streakStatusDone : styles.streakStatusPending,
                    ]}
                  >
                    {h.done && <View style={styles.streakStatusInner} />}
                  </View>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.addHabitBtn} activeOpacity={0.85}>
              <Text style={styles.addHabitText}>+ Add a habit</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <Modal visible={showSketch} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white }}>
          <DrawingCanvas
            partnerName={partner?.name ?? 'them'}
            onSend={(paths) => {
              setHasDoodle(paths.length > 0);
              setShowSketch(false);
            }}
            onClose={() => setShowSketch(false)}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.cream },
  content: { paddingBottom: 32 },

  pageHeader: { paddingHorizontal: 20, paddingTop: 28, marginBottom: 20 },
  pageTitle: {
    fontSize: FontSize['3xl'],
    color: Colors.charcoal,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.black,
    letterSpacing: -1.5,
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
  },

  // Filter tabs
  tabsRow: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 8,
    marginBottom: 16,
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 100,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabActive: {
    backgroundColor: Colors.dark,
    borderColor: Colors.dark,
  },
  tabText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
  },
  tabTextActive: {
    color: Colors.white,
    fontFamily: FontFamily.semibold,
    fontWeight: FontWeight.semibold,
  },

  // Jar CTA
  jarCta: {
    marginHorizontal: 16,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,184,48,0.18)',
    shadowColor: Colors.yellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 6,
  },
  jarCtaInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
    position: 'relative',
  },
  jarGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,184,48,0.08)',
    top: -40,
    left: -20,
  },
  jarGlyph: { fontSize: 38 },
  jarTextWrap: { flex: 1 },
  jarTitle: {
    fontSize: FontSize.md,
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },
  jarSub: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.45)',
    fontFamily: FontFamily.regular,
    marginTop: 3,
  },
  jarBadge: {
    minWidth: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.coral,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    shadowColor: Colors.coral,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  jarBadgeText: {
    fontSize: FontSize.sm,
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },

  // Section header
  section: { marginBottom: 28 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

  // Journal card
  journalCard: {
    marginHorizontal: 16,
    backgroundColor: Colors.white,
    borderRadius: 22,
    padding: 22,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    shadowColor: '#2C2C2C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  journalAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: Colors.yellow,
  },
  journalQuote: {
    fontSize: FontSize.md,
    color: Colors.charcoal,
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
    fontStyle: 'italic',
    lineHeight: 26,
    paddingLeft: 8,
  },
  journalHint: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
    paddingLeft: 8,
  },
  journalWriteBtn: {
    backgroundColor: Colors.yellow,
    borderRadius: 100,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: Colors.yellow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  journalWriteBtnText: {
    fontSize: FontSize.base,
    color: Colors.dark,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },

  // Sketch CTA
  sketchCta: {
    marginHorizontal: 16,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 7,
  },
  sketchCtaInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
  },
  sketchIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,184,48,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,184,48,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sketchIcon: { fontSize: 22 },
  sketchTextWrap: { flex: 1 },
  sketchTitle: {
    fontSize: FontSize.base,
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },
  sketchSub: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.42)',
    fontFamily: FontFamily.regular,
    marginTop: 3,
  },
  sketchArrow: {
    fontSize: FontSize.lg,
    color: 'rgba(255,184,48,0.7)',
  },

  // Memory grid
  memoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  memoryCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    width: '47%',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#2C2C2C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  memoryIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.creamDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memoryIcon: { fontSize: 24 },
  memoryLabel: {
    fontSize: FontSize.sm,
    color: Colors.charcoal,
    fontFamily: FontFamily.semibold,
    fontWeight: FontWeight.semibold,
    lineHeight: 18,
  },
  memoryDate: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontFamily: FontFamily.regular,
  },
  addCard: {
    backgroundColor: 'rgba(255,184,48,0.06)',
    borderColor: 'rgba(255,184,48,0.2)',
    borderStyle: 'dashed',
  },
  addPlusRing: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,184,48,0.35)',
    backgroundColor: 'rgba(255,184,48,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPlusIcon: {
    fontSize: 26,
    color: Colors.yellow,
    fontWeight: '300',
    lineHeight: 30,
  },
  addCardLabel: {
    fontSize: FontSize.sm,
    color: Colors.charcoal,
    fontFamily: FontFamily.semibold,
    fontWeight: FontWeight.semibold,
  },
  addCardSub: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontFamily: FontFamily.regular,
  },

  // Habit streaks
  streakCard: {
    marginHorizontal: 16,
    backgroundColor: Colors.white,
    borderRadius: 22,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#2C2C2C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  streakIntro: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
    lineHeight: 18,
  },
  streakList: { gap: 12 },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  streakIconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: Colors.creamDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakIcon: { fontSize: 22 },
  streakInfo: { flex: 1 },
  streakName: {
    fontSize: FontSize.sm,
    color: Colors.charcoal,
    fontFamily: FontFamily.semibold,
    fontWeight: FontWeight.semibold,
  },
  streakCount: {
    fontSize: FontSize.xs,
    color: Colors.coral,
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
    marginTop: 2,
  },
  streakStatus: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakStatusDone: {
    borderColor: Colors.success,
    backgroundColor: 'rgba(74,222,128,0.18)',
  },
  streakStatusPending: {
    borderColor: Colors.border,
    backgroundColor: Colors.cream,
  },
  streakStatusInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  addHabitBtn: {
    backgroundColor: Colors.creamDark,
    borderRadius: 100,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addHabitText: {
    fontSize: FontSize.sm,
    color: Colors.charcoal,
    fontFamily: FontFamily.semibold,
    fontWeight: FontWeight.semibold,
  },
});
