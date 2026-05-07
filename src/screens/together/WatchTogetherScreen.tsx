import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Shadows } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { Button } from '../../components/ui/Button';
import { useCoupleStore } from '../../store/coupleStore';

const SUGGESTED = [
  { emoji: '😂', title: 'Stand-up comedy', search: 'best stand up comedy 2024' },
  { emoji: '🌍', title: 'Travel vlog', search: 'travel vlog romantic destinations' },
  { emoji: '🎵', title: 'Live concert', search: 'live concert 2024 youtube' },
  { emoji: '🧑‍🍳', title: 'Cook together', search: 'cooking together couple recipe' },
  { emoji: '🌌', title: 'Relaxing nature', search: 'relaxing nature 4k ambience' },
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Watch Together</Text>
        <View style={styles.syncBadge}>
          <View style={[styles.syncDot, sessionActive && styles.syncDotActive]} />
          <Text style={styles.syncText}>{sessionActive ? 'In sync' : 'Not started'}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {sessionActive ? (
          <View style={styles.sessionActive}>
            <Text style={styles.sessionEmoji}>🎬</Text>
            <Text style={styles.sessionTitle}>Watching in sync</Text>
            <Text style={styles.sessionSub}>
              You and {partner?.name} are synced. If one of you pauses, both pause.
            </Text>
            <View style={styles.syncControls}>
              <Button label="⏸ Pause both" variant="secondary" onPress={() => {}} />
              <Button label="Stop session" variant="ghost" onPress={() => setSessionActive(false)} />
            </View>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Paste a YouTube link</Text>
            <View style={styles.urlRow}>
              <TextInput
                value={url}
                onChangeText={setUrl}
                placeholder="https://youtube.com/watch?v=..."
                placeholderTextColor={Colors.placeholder}
                style={styles.urlInput}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <Button
              label={syncing ? 'Syncing...' : `Start watching with ${partner?.name ?? 'partner'}`}
              loading={syncing}
              onPress={startSession}
              disabled={!url.trim()}
              style={styles.startBtn}
            />

            <Text style={styles.sectionTitle}>Suggestions</Text>
            <View style={styles.suggestions}>
              {SUGGESTED.map((s) => (
                <TouchableOpacity
                  key={s.title}
                  style={[styles.suggestionCard, Shadows.small]}
                  onPress={() => setUrl(`https://www.youtube.com/results?search_query=${encodeURIComponent(s.search)}`)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.suggestionEmoji}>{s.emoji}</Text>
                  <Text style={styles.suggestionTitle}>{s.title}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.howItWorks}>
              <Text style={styles.howTitle}>How it works</Text>
              <Text style={styles.howText}>
                1. Paste a YouTube link{'\n'}
                2. Miles sends an invite to {partner?.name ?? 'your partner'}{'\n'}
                3. When they accept, playback syncs automatically{'\n'}
                4. Pause, seek, or play — you both stay in lock-step
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
  back: { marginRight: 16 },
  backText: { fontSize: FontSize.xl, color: Colors.charcoal },
  title: {
    fontSize: FontSize.md,
    color: Colors.charcoal,
    fontFamily: FontFamily.bold,
    flex: 1,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.creamDark,
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  syncDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.placeholder },
  syncDotActive: { backgroundColor: Colors.success },
  syncText: { fontSize: FontSize.xs, color: Colors.charcoal, fontFamily: FontFamily.medium },
  content: { padding: 20, paddingBottom: 40 },
  sectionTitle: {
    fontSize: FontSize.md,
    color: Colors.charcoal,
    fontFamily: FontFamily.bold,
    marginBottom: 12,
    marginTop: 8,
  },
  urlRow: { marginBottom: 16 },
  urlInput: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: FontSize.sm,
    color: Colors.charcoal,
    fontFamily: FontFamily.regular,
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  startBtn: { marginBottom: 32 },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 32,
  },
  suggestionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    width: '46%',
    gap: 8,
  },
  suggestionEmoji: { fontSize: 32 },
  suggestionTitle: {
    fontSize: FontSize.sm,
    color: Colors.charcoal,
    fontFamily: FontFamily.medium,
    textAlign: 'center',
  },
  howItWorks: {
    backgroundColor: Colors.yellowPale,
    borderRadius: 20,
    padding: 20,
  },
  howTitle: {
    fontSize: FontSize.base,
    color: Colors.charcoal,
    fontFamily: FontFamily.bold,
    marginBottom: 10,
  },
  howText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
    lineHeight: 24,
  },
  sessionActive: {
    alignItems: 'center',
    paddingTop: 40,
    gap: 12,
  },
  sessionEmoji: { fontSize: 72, marginBottom: 8 },
  sessionTitle: {
    fontSize: FontSize.xl,
    color: Colors.charcoal,
    fontFamily: FontFamily.bold,
  },
  sessionSub: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 24,
  },
  syncControls: { gap: 12, marginTop: 16, width: '100%' },
});
