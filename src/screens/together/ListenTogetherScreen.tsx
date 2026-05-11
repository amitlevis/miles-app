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

const VIBES = [
  { icon: '💫', name: 'Romantic', color: '#E8A0BF' },
  { icon: '⚡', name: 'Energetic', color: Colors.yellow },
  { icon: '🌙', name: 'Chill', color: Colors.lavender },
  { icon: '😢', name: 'Emotional', color: '#4A6FA5' },
  { icon: '🌅', name: 'Morning', color: Colors.coral },
  { icon: '🎉', name: 'Party', color: Colors.success },
];

const SUGGESTED_SONGS = [
  { title: 'A Thousand Miles', artist: 'Vanessa Carlton', icon: '🎹' },
  { title: 'I Will Always Love You', artist: 'Whitney Houston', icon: '💛' },
  { title: "Can't Help Falling in Love", artist: 'Elvis Presley', icon: '🌹' },
  { title: 'Thinking Out Loud', artist: 'Ed Sheeran', icon: '🎸' },
];

export function ListenTogetherScreen() {
  const navigation = useNavigation();
  const { partner } = useCoupleStore();
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const vibeColor =
    VIBES.find((v) => v.name === selectedVibe)?.color ?? Colors.lavender;

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
          <Text style={styles.headerTitle}>Listen Together</Text>
        </View>
        <View
          style={[
            styles.syncBadge,
            connected ? styles.syncBadgeActive : styles.syncBadgeIdle,
          ]}
        >
          <View
            style={[
              styles.syncDot,
              connected ? styles.syncDotActive : styles.syncDotIdle,
            ]}
          />
          <Text
            style={[
              styles.syncBadgeText,
              connected && styles.syncBadgeTextActive,
            ]}
          >
            {connected ? 'In sync' : 'Pick a vibe'}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {connected ? (
          /* ── Now playing ──────────────────────────────────────────── */
          <View style={styles.nowPlayingWrap}>
            <LinearGradient
              colors={['#16121A', '#1F1626', '#16121A']}
              style={styles.nowPlayingCard}
            >
              <View
                style={[
                  styles.nowPlayingGlow,
                  { backgroundColor: `${vibeColor}26` },
                ]}
              />

              {/* Album art */}
              <View style={styles.albumArtWrap}>
                <LinearGradient
                  colors={[vibeColor, `${vibeColor}88`]}
                  style={styles.albumArt}
                >
                  <Text style={styles.albumGlyph}>🎵</Text>
                </LinearGradient>
              </View>

              <Text style={styles.nowPlayingLabel}>NOW PLAYING IN SYNC</Text>
              <Text style={styles.songTitle}>A Thousand Miles</Text>
              <Text style={styles.songArtist}>Vanessa Carlton</Text>

              {/* Progress bar */}
              <View style={styles.progressWrap}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: '38%', backgroundColor: vibeColor },
                    ]}
                  />
                </View>
                <View style={styles.progressLabels}>
                  <Text style={styles.progressTime}>1:24</Text>
                  <Text style={styles.progressTime}>3:48</Text>
                </View>
              </View>

              {/* Controls */}
              <View style={styles.controls}>
                <TouchableOpacity style={styles.controlBtn} activeOpacity={0.7}>
                  <Text style={styles.controlText}>⏮</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.playBtn, { backgroundColor: vibeColor }]}
                  activeOpacity={0.85}
                >
                  <Text style={styles.playText}>⏸</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.controlBtn} activeOpacity={0.7}>
                  <Text style={styles.controlText}>⏭</Text>
                </TouchableOpacity>
              </View>

              {/* Synced with partner */}
              <View style={styles.syncedRow}>
                <View style={styles.syncedDot} />
                <Text style={styles.syncedText}>
                  In sync with {partner?.name ?? 'partner'}
                </Text>
              </View>
            </LinearGradient>

            <TouchableOpacity
              style={styles.stopBtn}
              onPress={() => setConnected(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.stopBtnText}>End session</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* ── Setup ────────────────────────────────────────────────── */
          <>
            <View style={styles.heroBlock}>
              <Text style={styles.heroTitle}>What's the{'\n'}vibe tonight?</Text>
              <Text style={styles.heroSub}>
                Pick a mood — we'll find music you'll both love.
              </Text>
            </View>

            {/* Vibe grid */}
            <View style={styles.vibeGrid}>
              {VIBES.map((v) => {
                const active = selectedVibe === v.name;
                return (
                  <TouchableOpacity
                    key={v.name}
                    style={[
                      styles.vibeCard,
                      active && {
                        borderColor: v.color,
                        backgroundColor: `${v.color}15`,
                      },
                    ]}
                    onPress={() => setSelectedVibe(v.name)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.vibeCircle,
                        { backgroundColor: `${v.color}24`, borderColor: `${v.color}48` },
                      ]}
                    >
                      <Text style={styles.vibeIcon}>{v.icon}</Text>
                    </View>
                    <Text style={[styles.vibeName, active && { color: v.color }]}>
                      {v.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Start CTA */}
            <TouchableOpacity
              onPress={() => setConnected(true)}
              disabled={!selectedVibe}
              activeOpacity={0.88}
              style={[
                styles.startWrap,
                !selectedVibe && styles.startDisabled,
              ]}
            >
              <LinearGradient
                colors={['#FFD470', '#FFB830', '#FF8C42']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.startGradient}
              >
                <Text style={styles.startText}>
                  Start listening with {partner?.name ?? 'partner'} →
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Suggested songs */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Some songs you might like</Text>
            </View>
            <View style={styles.songList}>
              {SUGGESTED_SONGS.map((s) => (
                <View key={s.title} style={styles.songRow}>
                  <View style={styles.songIcon}>
                    <Text style={styles.songIconText}>{s.icon}</Text>
                  </View>
                  <View style={styles.songInfo}>
                    <Text style={styles.songRowTitle}>{s.title}</Text>
                    <Text style={styles.songRowArtist}>{s.artist}</Text>
                  </View>
                  <TouchableOpacity style={styles.addBtn} activeOpacity={0.7}>
                    <Text style={styles.addBtnText}>+ Add</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Coming soon note */}
            <View style={styles.spotifyCard}>
              <Text style={styles.spotifyIcon}>🎧</Text>
              <View style={styles.spotifyTextWrap}>
                <Text style={styles.spotifyTitle}>Spotify & Apple Music</Text>
                <Text style={styles.spotifySub}>
                  Full library sync — coming soon
                </Text>
              </View>
              <View style={styles.spotifyChip}>
                <Text style={styles.spotifyChipText}>Soon</Text>
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

  // Hero
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

  // Vibe grid
  vibeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  vibeCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    width: '31%',
    aspectRatio: 0.95,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.border,
    shadowColor: '#2C2C2C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  vibeCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  vibeIcon: { fontSize: 22 },
  vibeName: {
    fontSize: FontSize.sm,
    color: Colors.charcoal,
    fontFamily: FontFamily.semibold,
    fontWeight: FontWeight.semibold,
  },

  // Start CTA
  startWrap: {
    borderRadius: 100,
    overflow: 'hidden',
    marginBottom: 32,
    shadowColor: Colors.yellow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  startDisabled: { opacity: 0.35 },
  startGradient: { paddingVertical: 16, alignItems: 'center' },
  startText: {
    fontSize: FontSize.base,
    color: Colors.dark,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },

  // Section
  sectionHeader: { paddingHorizontal: 4, marginBottom: 14 },
  sectionTitle: {
    fontSize: FontSize.base,
    color: Colors.charcoal,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Song list
  songList: { gap: 10, marginBottom: 24 },
  songRow: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#2C2C2C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  songIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: Colors.creamDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  songIconText: { fontSize: 22 },
  songInfo: { flex: 1 },
  songRowTitle: {
    fontSize: FontSize.base,
    color: Colors.charcoal,
    fontFamily: FontFamily.semibold,
    fontWeight: FontWeight.semibold,
  },
  songRowArtist: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: Colors.yellow,
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  addBtnText: {
    fontSize: FontSize.xs,
    color: Colors.dark,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },

  // Spotify note
  spotifyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.dark,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  spotifyIcon: { fontSize: 26 },
  spotifyTextWrap: { flex: 1 },
  spotifyTitle: {
    fontSize: FontSize.sm,
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },
  spotifySub: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.45)',
    fontFamily: FontFamily.regular,
    marginTop: 2,
  },
  spotifyChip: {
    backgroundColor: 'rgba(255,184,48,0.15)',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,184,48,0.3)',
  },
  spotifyChipText: {
    fontSize: 10,
    color: Colors.yellow,
    fontFamily: FontFamily.semibold,
    fontWeight: FontWeight.semibold,
  },

  // Now playing
  nowPlayingWrap: { paddingTop: 16, gap: 14 },
  nowPlayingCard: {
    borderRadius: 32,
    padding: 28,
    alignItems: 'center',
    gap: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.42,
    shadowRadius: 24,
    elevation: 14,
  },
  nowPlayingGlow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    top: -60,
  },
  albumArtWrap: {
    width: 180,
    height: 180,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 14,
  },
  albumArt: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  albumGlyph: { fontSize: 56 },
  nowPlayingLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.4)',
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
    letterSpacing: 2,
  },
  songTitle: {
    fontSize: FontSize.xl,
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.black,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  songArtist: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: FontFamily.regular,
  },

  progressWrap: { width: '90%', marginTop: 10 },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
  },
  progressFill: { height: 3, borderRadius: 2 },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressTime: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.35)',
    fontFamily: FontFamily.regular,
  },

  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 28,
    marginTop: 8,
  },
  controlBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlText: { fontSize: 22, color: 'rgba(255,255,255,0.7)' },
  playBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  playText: { fontSize: 22, color: Colors.white },

  syncedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    backgroundColor: 'rgba(74,222,128,0.12)',
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.3)',
  },
  syncedDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  syncedText: {
    fontSize: FontSize.xs,
    color: Colors.success,
    fontFamily: FontFamily.semibold,
    fontWeight: FontWeight.semibold,
  },

  stopBtn: { paddingVertical: 14, alignItems: 'center' },
  stopBtnText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
  },
});
