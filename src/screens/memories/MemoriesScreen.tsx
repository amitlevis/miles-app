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
import { Colors, Shadows } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { PartnerHeader } from '../../components/PartnerHeader';
import { DrawingCanvas } from '../../components/DrawingCanvas';
import { Button } from '../../components/ui/Button';
import { useCoupleStore } from '../../store/coupleStore';
import { RootStackParamList } from '../../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const MOCK_MEMORIES = [
  { id: '1', type: 'photo', emoji: '📸', label: 'Good morning photo', date: 'Today' },
  { id: '2', type: 'drawing', emoji: '✏️', label: 'Little doodle', date: 'Yesterday' },
  { id: '3', type: 'photo', emoji: '📸', label: 'Thinking of you', date: 'Mar 24' },
  { id: '4', type: 'voice', emoji: '🎙️', label: 'Voice message', date: 'Mar 23' },
];

const JOURNAL_PROMPTS = [
  "What's your favorite memory of your first conversation?",
  'Describe the moment you realized this person was special.',
  "What's something you can't wait to do together in person?",
  "What's a small thing your partner does that makes you smile?",
];

export function MemoriesScreen() {
  const navigation = useNavigation<Nav>();
  const { partner } = useCoupleStore();
  const [activeTab, setActiveTab] = useState<'all' | 'photos' | 'drawings' | 'journal'>('all');
  const [showSketch, setShowSketch] = useState(false);
  const [hasDoodle, setHasDoodle] = useState(false);

  const todayPrompt = JOURNAL_PROMPTS[new Date().getDay() % JOURNAL_PROMPTS.length];

  return (
    <SafeAreaView style={styles.safe}>
      <PartnerHeader />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Memories</Text>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
          style={styles.tabsScroll}
        >
          {(['all', 'photos', 'drawings', 'journal'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tab, activeTab === t && styles.tabActive]}
              onPress={() => setActiveTab(t)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>
                {t === 'all' ? 'All' : t === 'photos' ? '📸 Photos' : t === 'drawings' ? '✏️ Drawings' : '📔 Journal'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Memory Jar */}
        <TouchableOpacity
          style={[styles.memoryJar, Shadows.yellow]}
          onPress={() => navigation.navigate('MemoryJar')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#FFD470', '#FFB830']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.memoryJarGradient}
          >
            <Text style={styles.memoryJarEmoji}>🫙</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.memoryJarTitle}>Memory Jar</Text>
              <Text style={styles.memoryJarSub}>
                3 surprises from {partner?.name ?? 'your partner'} waiting
              </Text>
            </View>
            <View style={styles.memoryJarBadge}>
              <Text style={styles.memoryJarBadgeText}>3</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Couple's Journal */}
        {(activeTab === 'all' || activeTab === 'journal') && (
          <View style={[styles.journalCard, Shadows.small]}>
            <Text style={styles.journalTitle}>📔 Today's Journal Prompt</Text>
            <Text style={styles.journalPrompt}>"{todayPrompt}"</Text>
            <Text style={styles.journalHint}>
              Write your answer — {partner?.name ?? 'your partner'} sees it at midnight.
            </Text>
            <TouchableOpacity style={styles.journalWriteBtn} activeOpacity={0.8}>
              <Text style={styles.journalWriteBtnText}>Write my answer →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* SketchPresence — opens full-screen modal so drawing works */}
        {(activeTab === 'all' || activeTab === 'drawings') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SketchPresence ✏️</Text>
            <TouchableOpacity
              style={[styles.sketchCta, Shadows.small]}
              onPress={() => setShowSketch(true)}
              activeOpacity={0.85}
            >
              {hasDoodle ? (
                <>
                  <Text style={styles.sketchCtaEmoji}>✏️</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sketchCtaTitle}>You left a doodle for {partner?.name ?? 'them'} ♥</Text>
                    <Text style={styles.sketchCtaSub}>Tap to draw another</Text>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.sketchCtaEmoji}>✏️</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sketchCtaTitle}>Draw something for {partner?.name ?? 'them'}</Text>
                    <Text style={styles.sketchCtaSub}>It'll appear on their home screen — with colors, brush sizes & eraser</Text>
                  </View>
                  <Text style={styles.sketchArrow}>→</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Photos / all memories */}
        {(activeTab === 'all' || activeTab === 'photos') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shared moments</Text>
            <View style={styles.memoryGrid}>
              {MOCK_MEMORIES.filter(
                (m) => activeTab === 'all' || m.type === activeTab.slice(0, -1)
              ).map((m) => (
                <View key={m.id} style={[styles.memoryCard, Shadows.small]}>
                  <View style={styles.memoryIcon}>
                    <Text style={{ fontSize: 28 }}>{m.emoji}</Text>
                  </View>
                  <Text style={styles.memoryLabel}>{m.label}</Text>
                  <Text style={styles.memoryDate}>{m.date}</Text>
                </View>
              ))}
              <TouchableOpacity style={[styles.memoryCard, styles.addCard, Shadows.small]} activeOpacity={0.8}>
                <Text style={styles.addCardIcon}>+</Text>
                <Text style={styles.memoryLabel}>Add photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Habit Streaks */}
        <View style={[styles.streakCard, Shadows.small]}>
          <Text style={styles.streakTitle}>🔥 Habit Streaks</Text>
          <Text style={styles.streakSub}>Build shared rituals together</Text>
          <View style={styles.streakList}>
            {[
              { emoji: '☕', name: 'Morning coffee', streak: 12, done: true },
              { emoji: '🚶', name: 'Daily walk', streak: 5, done: false },
              { emoji: '😴', name: 'Good night ritual', streak: 23, done: true },
            ].map((h) => (
              <View key={h.name} style={styles.streakRow}>
                <Text style={styles.streakEmoji}>{h.emoji}</Text>
                <View style={styles.streakInfo}>
                  <Text style={styles.streakName}>{h.name}</Text>
                  <Text style={styles.streakCount}>🔥 {h.streak} day streak</Text>
                </View>
                <View style={[styles.streakDot, h.done && styles.streakDotDone]} />
              </View>
            ))}
          </View>
          <Button label="+ Add habit" variant="ghost" size="sm" onPress={() => {}} />
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Full-screen drawing modal — no ScrollView interference */}
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
  pageTitle: {
    fontSize: FontSize['2xl'],
    color: Colors.charcoal,
    fontFamily: FontFamily.bold,
    paddingHorizontal: 20,
    paddingTop: 24,
    marginBottom: 16,
  },
  tabsScroll: { marginBottom: 20 },
  tabs: { paddingHorizontal: 20, gap: 8 },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 100,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  tabActive: { backgroundColor: Colors.yellow, borderColor: Colors.yellow },
  tabText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontFamily: FontFamily.medium },
  tabTextActive: { color: Colors.charcoal, fontFamily: FontFamily.bold },

  memoryJar: { marginHorizontal: 20, borderRadius: 24, overflow: 'hidden', marginBottom: 20 },
  memoryJarGradient: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 16 },
  memoryJarEmoji: { fontSize: 40 },
  memoryJarTitle: { fontSize: FontSize.base, color: Colors.charcoal, fontFamily: FontFamily.bold },
  memoryJarSub: { fontSize: FontSize.sm, color: Colors.charcoal, fontFamily: FontFamily.regular, opacity: 0.75, marginTop: 2 },
  memoryJarBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memoryJarBadgeText: { fontSize: FontSize.base, color: Colors.white, fontFamily: FontFamily.bold },

  journalCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    gap: 10,
    marginBottom: 24,
  },
  journalTitle: { fontSize: FontSize.base, color: Colors.charcoal, fontFamily: FontFamily.bold },
  journalPrompt: {
    fontSize: FontSize.md,
    color: Colors.charcoal,
    fontFamily: FontFamily.medium,
    lineHeight: 26,
    fontStyle: 'italic',
  },
  journalHint: { fontSize: FontSize.sm, color: Colors.textMuted, fontFamily: FontFamily.regular },
  journalWriteBtn: {
    backgroundColor: Colors.yellowPale,
    borderRadius: 100,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.yellow,
  },
  journalWriteBtnText: { fontSize: FontSize.base, color: Colors.charcoal, fontFamily: FontFamily.semibold },

  section: { paddingHorizontal: 20, marginBottom: 28 },
  sectionTitle: { fontSize: FontSize.md, color: Colors.charcoal, fontFamily: FontFamily.bold, marginBottom: 14 },

  sketchCta: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  sketchCtaEmoji: { fontSize: 32 },
  sketchCtaTitle: { fontSize: FontSize.base, color: Colors.charcoal, fontFamily: FontFamily.semibold },
  sketchCtaSub: { fontSize: FontSize.sm, color: Colors.textSecondary, fontFamily: FontFamily.regular, marginTop: 2 },
  sketchArrow: { fontSize: FontSize.lg, color: Colors.textMuted },

  memoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  memoryCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    width: '46%',
    gap: 8,
  },
  addCard: { borderWidth: 1.5, borderColor: Colors.border, borderStyle: 'dashed' },
  memoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.yellowPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCardIcon: { fontSize: 28, color: Colors.placeholder },
  memoryLabel: { fontSize: FontSize.sm, color: Colors.charcoal, fontFamily: FontFamily.medium, textAlign: 'center' },
  memoryDate: { fontSize: FontSize.xs, color: Colors.textMuted, fontFamily: FontFamily.regular },

  streakCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 20,
    gap: 14,
  },
  streakTitle: { fontSize: FontSize.base, color: Colors.charcoal, fontFamily: FontFamily.bold },
  streakSub: { fontSize: FontSize.sm, color: Colors.textSecondary, fontFamily: FontFamily.regular, marginTop: -8 },
  streakList: { gap: 12 },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  streakEmoji: { fontSize: 24 },
  streakInfo: { flex: 1 },
  streakName: { fontSize: FontSize.base, color: Colors.charcoal, fontFamily: FontFamily.medium },
  streakCount: { fontSize: FontSize.sm, color: Colors.textSecondary, fontFamily: FontFamily.regular },
  streakDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.border,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  streakDotDone: { backgroundColor: Colors.success, borderColor: Colors.success },
});
