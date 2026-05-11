import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize, FontWeight } from '../../constants/typography';
import { useCoupleStore } from '../../store/coupleStore';

const SUGGESTED = [
  { icon: '😂', title: 'Stand-up comedy', search: 'best stand up comedy 2024' },
  { icon: '🌍', title: 'Travel vlog', search: 'travel vlog romantic destinations' },
  { icon: '🎵', title: 'Live concert', search: 'live concert 2024 youtube' },
  { icon: '🧑‍🍳', title: 'Cook together', search: 'cooking together couple recipe' },
  { icon: '🌌', title: 'Relaxing nature', search: 'relaxing nature 4k ambience' },
  { icon: '🎮', title: 'Game streams', search: 'fun gameplay couple watch' },
];

export function WatchTogetherScreen() {
  const navigation = useNavigation();
  const { partner } = useCoupleStore();
  const [url, setUrl] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);

  const startSession = async () => {
    if (!url.trim()) return;
    setSyncing(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSyncing(false);
    setSessionActive(true);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.75}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Watch Together</Text>
        </View>
        <View
          style={[
            styles.syncBadge,
            sessionActive ? styles.syncBadgeActive : styles.syncBadgeIdle,
          ]}
        >
          <View
            style={[
              styles.syncDot,
              sessionActive ? styles.syncDotActive : styles.syncDotIdle,
            ]}
          />
          <Text
            style={[
              styles.syncBadgeText,
              sessionActive && styles.syncBadgeTextActive,
            ]}
          >
            {sessionActive ? 'In sync' : 'Not started'}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {sessionActive ? (
          /* ── Active session ───────────────────────────────────────── */
          <View style={styles.activeWrap}>
            <LinearGradient
              colors={['#1A0F08', '#241408', '#1A0F08']}
              style={styles.activeCard}
            >
              <View style={styles.activeGlow} />
              <Text style={styles.activeGlyph}>🎬</Text>
              <Text style={styles.activeTitle}>Watching in sync</Text>
              <Text style={styles.activeSub}>
                You and {partner?.name ?? 'your partner'} are watching together.{'\n'}
                Pause from either side and you both pause.
              </Text>

              <View style={styles.activePillRow}>
                <View style={styles.activePill}>
                  <View style={styles.activeDot} />
                  <Text style={styles.activePillText}>Live • synced</Text>
                </View>
              </View>
            </LinearGradient>

            <View style={styles.activeActions}>
              <TouchableOpacity
                style={styles.pauseBtn}
                onPress={() => {}}
                activeOpacity={0.85}
              >
                <Text style={styles.pauseBtnText}>⏸  Pause both</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.stopBtn}
                onPress={() => setSessionActive(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.stopBtnText}>End session</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* ── Setup view ───────────────────────────────────────────── */
          <>
            <View style={styles.heroBlock}>
              <Text style={styles.heroTitle}>Pick something{'\n'}to watch together</Text>
              <Text style={styles.heroSub}>
                Paste a YouTube link, or tap a suggestion below.
              </Text>
            </View>

            {/* URL input */}
            <View style={styles.urlSection}>
              <View style={styles.inputLabelRow}>
                <Text style={styles.inputLabel}>YouTube link</Text>
              </View>
              <TextInput
                value={url}
                onChangeText={setUrl}
                placeholder="https://youtube.com/watch?v=..."
                placeholderTextColor={Colors.placeholder}
                style={styles.urlInput}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={startSession}
                disabled={!url.trim() || syncing}
                activeOpacity={0.88}
                style={[
                  styles.startWrap,
                  (!url.trim() || syncing) && styles.startDisabled,
                ]}
              >
                <LinearGradient
                  colors={['#FFD470', '#FFB830', '#FF8C42']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.startGradient}
                >
                  {syncing ? (
                    <ActivityIndicator color={Colors.dark} />
                  ) : (
                    <Text style={styles.startText}>
                      Start watching with {partner?.name ?? 'partner'} →
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Suggestions */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Or try one of these</Text>
            </View>
            <View style={styles.suggestGrid}>
              {SUGGESTED.map((s) => (
                <TouchableOpacity
                  key={s.title}
                  style={styles.suggestCard}
                  onPress={() =>
                    setUrl(
                      `https://www.youtube.com/results?search_query=${encodeURIComponent(s.search)}`
                    )
                  }
                  activeOpacity={0.8}
                >
                  <Text style={styles.suggestIcon}>{s.icon}</Text>
                  <Text style={styles.suggestTitle}>{s.title}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* How it works */}
            <View style={styles.howCard}>
              <Text style={styles.howTitle}>How it works</Text>
              <View style={styles.howList}>
                {[
                  'Paste a YouTube link',
                  `Miles sends an invite to ${partner?.name ?? 'your partner'}`,
                  'When they accept, playback syncs automatically',
                  'Pause, seek, or play — you both stay in lock-step',
                ].map((step, i) => (
                  <View key={i} style={styles.howRow}>
                    <View style={styles.howNum}>
                      <Text style={styles.howNumText}>{i + 1}</Text>
                    </View>
                    <Text style={styles.howStep}>{step}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

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
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  syncBadgeIdle: {
    backgroundColor: Colors.creamDark,
    borderColor: Colors.border,
  },
  syncBadgeActive: {
    backgroundColor: 'rgba(74,222,128,0.12)',
    borderColor: 'rgba(74,222,128,0.32)',
  },
  syncDot: { width: 7, height: 7, borderRadius: 4 },
  syncDotIdle: { backgroundColor: Colors.placeholder },
  syncDotActive: { backgroundColor: Colors.success },
  syncBadgeText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
  },
  syncBadgeTextActive: { color: Colors.success },

  content: { paddingHorizontal: 16, paddingBottom: 40 },

  // Setup hero
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

  // URL input
  urlSection: { marginBottom: 32 },
  inputLabelRow: { marginBottom: 8 },
  inputLabel: {
    fontSize: FontSize.xs,
    color: Colors.charcoal,
    fontFamily: FontFamily.semibold,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  urlInput: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: FontSize.sm,
    color: Colors.charcoal,
    fontFamily: FontFamily.regular,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: 14,
  },
  startWrap: {
    borderRadius: 100,
    overflow: 'hidden',
    shadowColor: Colors.yellow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  startDisabled: { opacity: 0.4 },
  startGradient: { paddingVertical: 16, alignItems: 'center' },
  startText: {
    fontSize: FontSize.base,
    color: Colors.dark,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },

  sectionHeader: { paddingHorizontal: 4, marginBottom: 14 },
  sectionTitle: {
    fontSize: FontSize.base,
    color: Colors.charcoal,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Suggestion grid
  suggestGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 32,
  },
  suggestCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    width: '31%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#2C2C2C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  suggestIcon: { fontSize: 28 },
  suggestTitle: {
    fontSize: FontSize.xs,
    color: Colors.charcoal,
    fontFamily: FontFamily.semibold,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
    lineHeight: 14,
  },

  // How it works
  howCard: {
    backgroundColor: Colors.dark,
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  howTitle: {
    fontSize: FontSize.base,
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    marginBottom: 16,
  },
  howList: { gap: 14 },
  howRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  howNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,184,48,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,184,48,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  howNumText: {
    fontSize: FontSize.xs,
    color: Colors.yellow,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },
  howStep: {
    flex: 1,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: FontFamily.regular,
    lineHeight: 20,
  },

  // Active session
  activeWrap: { paddingTop: 24, gap: 16 },
  activeCard: {
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    gap: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,184,48,0.18)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  activeGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,184,48,0.08)',
    top: -60,
  },
  activeGlyph: { fontSize: 64 },
  activeTitle: {
    fontSize: FontSize.xl,
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.black,
    letterSpacing: -0.5,
  },
  activeSub: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: FontFamily.regular,
    textAlign: 'center',
    lineHeight: 20,
  },
  activePillRow: { marginTop: 8 },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(74,222,128,0.14)',
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.32)',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  activePillText: {
    fontSize: FontSize.xs,
    color: Colors.success,
    fontFamily: FontFamily.semibold,
    fontWeight: FontWeight.semibold,
  },

  activeActions: { gap: 10 },
  pauseBtn: {
    backgroundColor: Colors.white,
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  pauseBtnText: {
    fontSize: FontSize.base,
    color: Colors.charcoal,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },
  stopBtn: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  stopBtnText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
  },
});
