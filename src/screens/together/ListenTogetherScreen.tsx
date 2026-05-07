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
import { Button } from '../../components/ui/Button';
import { useCoupleStore } from '../../store/coupleStore';

const VIBES = [
  { emoji: '💫', name: 'Romantic', color: '#E8A0BF' },
  { emoji: '⚡', name: 'Energetic', color: '#FFB830' },
  { emoji: '🌙', name: 'Chill', color: '#9B8AC4' },
  { emoji: '😢', name: 'Emotional', color: '#4A6FA5' },
  { emoji: '🌅', name: 'Morning', color: '#FF7A5C' },
  { emoji: '🎉', name: 'Party', color: '#5CB85C' },
];

const SUGGESTED_SONGS = [
  { title: 'A Thousand Miles', artist: 'Vanessa Carlton', emoji: '🎹' },
  { title: 'I Will Always Love You', artist: 'Whitney Houston', emoji: '💛' },
  { title: 'Can\'t Help Falling in Love', artist: 'Elvis Presley', emoji: '🌹' },
  { title: 'Thinking Out Loud', artist: 'Ed Sheeran', emoji: '🎸' },
];

export function ListenTogetherScreen() {
  const navigation = useNavigation();
  const { partner } = useCoupleStore();
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Listen Together</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {connected ? (
          <View style={styles.nowPlaying}>
            <LinearGradient
              colors={['#9B8AC4', '#C9B8E8']}
              style={styles.albumArt}
            >
              <Text style={{ fontSize: 64 }}>🎵</Text>
            </LinearGradient>
            <Text style={styles.nowPlayingLabel}>Now playing in sync</Text>
            <Text style={styles.songTitle}>A Thousand Miles</Text>
            <Text style={styles.songArtist}>Vanessa Carlton</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '38%' }]} />
            </View>
            <View style={styles.controls}>
              <TouchableOpacity style={styles.controlBtn}>
                <Text style={styles.controlText}>⏮</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.controlBtn, styles.playBtn]}>
                <Text style={styles.playText}>⏸</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlBtn}>
                <Text style={styles.controlText}>⏭</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.syncLabel}>🔄 In sync with {partner?.name}</Text>
            <Button
              label="Stop session"
              variant="ghost"
              onPress={() => setConnected(false)}
              style={{ marginTop: 12 }}
            />
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Pick a vibe</Text>
            <View style={styles.vibeGrid}>
              {VIBES.map((v) => (
                <TouchableOpacity
                  key={v.name}
                  style={[
                    styles.vibeCard,
                    Shadows.small,
                    selectedVibe === v.name && { borderColor: v.color, borderWidth: 2.5 },
                  ]}
                  onPress={() => setSelectedVibe(v.name)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.vibeCircle, { backgroundColor: v.color + '33' }]}>
                    <Text style={styles.vibeEmoji}>{v.emoji}</Text>
                  </View>
                  <Text style={styles.vibeName}>{v.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              label={`Start listening with ${partner?.name ?? 'partner'}`}
              onPress={() => setConnected(true)}
              disabled={!selectedVibe}
              style={styles.startBtn}
            />

            <Text style={styles.sectionTitle}>Suggested songs</Text>
            <View style={styles.songList}>
              {SUGGESTED_SONGS.map((s) => (
                <View key={s.title} style={[styles.songRow, Shadows.small]}>
                  <View style={styles.songIcon}>
                    <Text style={{ fontSize: 24 }}>{s.emoji}</Text>
                  </View>
                  <View style={styles.songInfo}>
                    <Text style={styles.songTitle2}>{s.title}</Text>
                    <Text style={styles.songArtist2}>{s.artist}</Text>
                  </View>
                  <TouchableOpacity style={styles.addBtn}>
                    <Text style={styles.addBtnText}>+ Add</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <View style={styles.spotifyNote}>
              <Text style={styles.spotifyNoteText}>
                🎧 Connect Spotify or Apple Music for full library access (coming soon)
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

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
  backText: { fontSize: FontSize.xl, color: Colors.charcoal, marginRight: 16 },
  title: { fontSize: FontSize.md, color: Colors.charcoal, fontFamily: FontFamily.bold, flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  sectionTitle: {
    fontSize: FontSize.md, color: Colors.charcoal,
    fontFamily: FontFamily.bold, marginBottom: 14, marginTop: 8,
  },
  vibeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  vibeCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    width: '30%',
    alignItems: 'center',
    padding: 14,
    gap: 8,
  },
  vibeCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  vibeEmoji: { fontSize: 24 },
  vibeName: { fontSize: FontSize.sm, color: Colors.charcoal, fontFamily: FontFamily.medium },
  startBtn: { marginBottom: 32 },
  songList: { gap: 10, marginBottom: 20 },
  songRow: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  songIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: Colors.yellowPale,
    alignItems: 'center', justifyContent: 'center',
  },
  songInfo: { flex: 1 },
  songTitle2: { fontSize: FontSize.base, color: Colors.charcoal, fontFamily: FontFamily.semibold },
  songArtist2: { fontSize: FontSize.sm, color: Colors.textSecondary, fontFamily: FontFamily.regular },
  addBtn: {
    backgroundColor: Colors.yellowPale, borderRadius: 100,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  addBtnText: { fontSize: FontSize.sm, color: Colors.charcoal, fontFamily: FontFamily.medium },
  spotifyNote: {
    backgroundColor: Colors.creamDark, borderRadius: 16, padding: 16,
  },
  spotifyNoteText: {
    fontSize: FontSize.sm, color: Colors.textSecondary,
    fontFamily: FontFamily.regular, textAlign: 'center',
  },
  nowPlaying: { alignItems: 'center', paddingTop: 20, gap: 10 },
  albumArt: {
    width: 200, height: 200, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16, ...Shadows.medium,
  },
  nowPlayingLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, fontFamily: FontFamily.regular },
  songTitle: { fontSize: FontSize.xl, color: Colors.charcoal, fontFamily: FontFamily.bold },
  songArtist: { fontSize: FontSize.base, color: Colors.textSecondary, fontFamily: FontFamily.regular },
  progressBar: {
    width: '80%', height: 4, backgroundColor: Colors.border,
    borderRadius: 2, marginTop: 4,
  },
  progressFill: { height: 4, backgroundColor: Colors.lavenderDark, borderRadius: 2 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 24, marginTop: 8 },
  controlBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  controlText: { fontSize: 24, color: Colors.charcoal },
  playBtn: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: Colors.lavenderDark, ...Shadows.medium,
  },
  playText: { fontSize: 24, color: Colors.white },
  syncLabel: { fontSize: FontSize.sm, color: Colors.success, fontFamily: FontFamily.medium, marginTop: 4 },
});
