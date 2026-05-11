import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize, FontWeight } from '../../constants/typography';
import { Button } from '../../components/ui/Button';
import { useCoupleStore } from '../../store/coupleStore';
import {
  fetchPartnerNotes,
  leaveNote,
  markNoteOpened,
  type MemoryJarNote,
} from '../../services/notes';
import { formatDistanceToNow } from 'date-fns';

type Note = MemoryJarNote;

export function MemoryJarScreen() {
  const navigation = useNavigation();
  const { partner, coupleId, user } = useCoupleStore();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [writing, setWriting] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [openedNote, setOpenedNote] = useState<Note | null>(null);
  const [error, setError] = useState<string | null>(null);
  const revealAnim = useRef(new Animated.Value(0)).current;

  const loadNotes = useCallback(async () => {
    if (!coupleId || !user?.id) return;
    setLoading(true);
    try {
      const data = await fetchPartnerNotes({ coupleId, selfId: user.id });
      setNotes(data);
    } catch (e: any) {
      setError(e.message ?? 'Could not load notes.');
    } finally {
      setLoading(false);
    }
  }, [coupleId, user?.id]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const openNote = async (note: Note) => {
    revealAnim.setValue(0);
    setOpenedNote(note);
    Animated.timing(revealAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();

    if (!note.opened_at) {
      try {
        const updated = await markNoteOpened(note.id);
        setNotes((prev) =>
          prev.map((n) => (n.id === note.id ? updated : n))
        );
      } catch (e) {
        // Non-fatal; the user already sees the note.
        console.warn('[notes] mark opened failed');
      }
    }
  };

  const sendNote = async () => {
    if (!noteText.trim() || !coupleId || !user?.id) return;
    setSending(true);
    setError(null);
    try {
      await leaveNote({ coupleId, senderId: user.id, body: noteText });
      setWriting(false);
      setNoteText('');
    } catch (e: any) {
      setError(e.message ?? 'Could not send. Try again.');
    } finally {
      setSending(false);
    }
  };

  const unopened = notes.filter((n) => !n.opened_at).length;

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
        <Text style={styles.headerTitle}>Memory Jar</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {openedNote ? (
          /* ── Opened note view ─────────────────────────────────────────────── */
          <Animated.View
            style={[styles.openedWrap, { opacity: revealAnim }]}
          >
            <LinearGradient
              colors={['#1A1208', '#241A0A']}
              style={styles.openedCard}
            >
              <View style={styles.openedGlow} />
              <Text style={styles.openedLetter}>💌</Text>
              <Text style={styles.openedFrom}>
                from {partner?.name ?? 'them'}
              </Text>
              <Text style={styles.openedBody}>
                {openedNote.body}
              </Text>
              <View style={styles.openedDivider} />
              <Text style={styles.openedTimestamp}>
                left {formatDistanceToNow(new Date(openedNote.created_at))} ago
              </Text>
            </LinearGradient>
            <Button
              label="Close"
              variant="ghost"
              onPress={() => setOpenedNote(null)}
              style={{ alignSelf: 'center', marginTop: 8 }}
            />
          </Animated.View>
        ) : writing ? (
          /* ── Writing view ────────────────────────────────────────────────── */
          <View style={styles.writeSection}>
            <Text style={styles.writeTitle}>
              Leave a surprise for {partner?.name}
            </Text>
            <Text style={styles.writeSub}>
              They can open it whenever they need a boost. Write from your heart.
            </Text>
            <TextInput
              value={noteText}
              onChangeText={setNoteText}
              placeholder="Write something beautiful..."
              placeholderTextColor={Colors.placeholder}
              style={styles.noteInput}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              autoFocus
            />
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}
            <View style={styles.writeActions}>
              <Button
                label="Cancel"
                variant="ghost"
                onPress={() => setWriting(false)}
              />
              <Button
                label="Send to jar ♥"
                onPress={sendNote}
                disabled={!noteText.trim() || sending}
                loading={sending}
              />
            </View>
          </View>
        ) : (
          /* ── Main jar view ──────────────────────────────────────────────── */
          <>
            {/* Jar hero */}
            <View style={styles.jarHero}>
              <LinearGradient
                colors={['#1A1208', '#2A1E0A', '#1A1208']}
                style={styles.jarHeroGradient}
              >
                <View style={styles.jarGlow} />
                <Text style={styles.jarGlyph}>🫙</Text>
                <Text style={styles.jarTitle}>Memory Jar</Text>
                {unopened > 0 ? (
                  <View style={styles.jarCountChip}>
                    <Text style={styles.jarCountText}>
                      {unopened} surprise{unopened !== 1 ? 's' : ''} waiting
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.jarEmpty}>All opened ♥</Text>
                )}
                <Text style={styles.jarSub}>
                  From {partner?.name ?? 'your partner'} — open whenever you need them.
                </Text>
              </LinearGradient>
            </View>

            {/* Notes from partner */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>From {partner?.name}</Text>
              <Text style={styles.sectionCount}>
                {notes.length} note{notes.length !== 1 ? 's' : ''}
              </Text>
            </View>

            {loading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator color={Colors.yellow} />
              </View>
            ) : notes.length === 0 ? (
              <View style={styles.emptyJarCard}>
                <Text style={styles.emptyJarGlyph}>🌱</Text>
                <Text style={styles.emptyJarTitle}>
                  Nothing here yet
                </Text>
                <Text style={styles.emptyJarSub}>
                  When {partner?.name ?? 'they'} leaves you a surprise, it'll appear here.
                </Text>
              </View>
            ) : (
              <View style={styles.noteList}>
                {notes.map((note) => {
                  const opened = !!note.opened_at;
                  return (
                    <TouchableOpacity
                      key={note.id}
                      style={[styles.noteCard, opened && styles.noteCardOpened]}
                      onPress={() => openNote(note)}
                      activeOpacity={0.8}
                    >
                      <View
                        style={[
                          styles.noteIconWrap,
                          opened
                            ? styles.noteIconWrapOpened
                            : styles.noteIconWrapSealed,
                        ]}
                      >
                        <Text style={styles.noteIcon}>
                          {opened ? '💌' : '🎁'}
                        </Text>
                      </View>
                      <View style={styles.noteInfo}>
                        <Text style={styles.noteTitle}>
                          {opened
                            ? `Opened ${formatDistanceToNow(new Date(note.opened_at!))} ago`
                            : 'A surprise is waiting...'}
                        </Text>
                        <Text style={styles.notePreview} numberOfLines={1}>
                          {opened ? note.body : 'Tap to open'}
                        </Text>
                      </View>
                      {!opened && (
                        <View style={styles.openChip}>
                          <Text style={styles.openChipText}>Open</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Add note CTA */}
            <TouchableOpacity
              style={styles.addNoteBtn}
              onPress={() => setWriting(true)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#2A1A0A', '#1E1208']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.addNoteBtnInner}
              >
                <View style={styles.addNotePlusCircle}>
                  <Text style={styles.addNotePlusIcon}>+</Text>
                </View>
                <View>
                  <Text style={styles.addNoteTitle}>
                    Leave a surprise
                  </Text>
                  <Text style={styles.addNoteSub}>
                    For {partner?.name ?? 'them'} to open anytime
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Tips */}
            <View style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>Ideas for the jar</Text>
              <View style={styles.tipsList}>
                {[
                  'A voice memo of your favourite memory together',
                  'Write what you love most about them',
                  'A playlist that reminds you of them',
                  'A letter for a hard day',
                ].map((tip, i) => (
                  <View key={i} style={styles.tipRow}>
                    <View style={styles.tipDot} />
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.cream },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.cream,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
  backIcon: {
    fontSize: FontSize.lg,
    color: Colors.charcoal,
  },
  headerTitle: {
    fontSize: FontSize.md,
    color: Colors.charcoal,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },

  content: { paddingBottom: 40 },

  // ── Jar hero ────────────────────────────────────────────────────────────────
  jarHero: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 28,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.36,
    shadowRadius: 24,
    elevation: 14,
  },
  jarHeroGradient: {
    paddingVertical: 40,
    paddingHorizontal: 28,
    alignItems: 'center',
    gap: 12,
  },
  jarGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,184,48,0.08)',
    top: -40,
  },
  jarGlyph: { fontSize: 72, marginBottom: 4 },
  jarTitle: {
    fontSize: FontSize['2xl'],
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.black,
    letterSpacing: -1,
  },
  jarCountChip: {
    backgroundColor: 'rgba(255,184,48,0.15)',
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,184,48,0.25)',
  },
  jarCountText: {
    fontSize: FontSize.sm,
    color: Colors.yellow,
    fontFamily: FontFamily.semibold,
    fontWeight: FontWeight.semibold,
  },
  jarEmpty: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.38)',
    fontFamily: FontFamily.regular,
  },
  jarSub: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.38)',
    fontFamily: FontFamily.regular,
    textAlign: 'center',
    lineHeight: 20,
  },

  // ── Notes list ───────────────────────────────────────────────────────────────
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

  loadingWrap: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyJarCard: {
    marginHorizontal: 16,
    backgroundColor: Colors.creamDark,
    borderRadius: 22,
    padding: 28,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  emptyJarGlyph: { fontSize: 48 },
  emptyJarTitle: {
    fontSize: FontSize.base,
    color: Colors.charcoal,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },
  emptyJarSub: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorText: {
    fontSize: FontSize.sm,
    color: Colors.error,
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
  },
  noteList: { paddingHorizontal: 16, gap: 10, marginBottom: 20 },
  noteCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
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
  noteCardOpened: {
    backgroundColor: Colors.creamDark,
    borderColor: Colors.border,
  },
  noteIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  noteIconWrapSealed: {
    backgroundColor: 'rgba(255,184,48,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,184,48,0.22)',
  },
  noteIconWrapOpened: {
    backgroundColor: Colors.creamDark,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  noteIcon: { fontSize: 22 },
  noteInfo: { flex: 1 },
  noteTitle: {
    fontSize: FontSize.base,
    color: Colors.charcoal,
    fontFamily: FontFamily.semibold,
    fontWeight: FontWeight.semibold,
  },
  notePreview: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
    marginTop: 3,
    lineHeight: 18,
  },
  openChip: {
    backgroundColor: Colors.yellow,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  openChipText: {
    fontSize: FontSize.xs,
    color: Colors.dark,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },

  // ── Add note CTA ─────────────────────────────────────────────────────────────
  addNoteBtn: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,184,48,0.18)',
    shadowColor: Colors.yellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 5,
  },
  addNoteBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  addNotePlusCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,184,48,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,184,48,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addNotePlusIcon: {
    fontSize: 24,
    color: Colors.yellow,
    fontWeight: FontWeight.regular,
  },
  addNoteTitle: {
    fontSize: FontSize.base,
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },
  addNoteSub: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.42)',
    fontFamily: FontFamily.regular,
    marginTop: 2,
  },

  // ── Tips ──────────────────────────────────────────────────────────────────────
  tipsCard: {
    marginHorizontal: 16,
    backgroundColor: Colors.creamDark,
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tipsTitle: {
    fontSize: FontSize.base,
    color: Colors.charcoal,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    marginBottom: 16,
  },
  tipsList: { gap: 12 },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.yellow,
    marginTop: 5,
    flexShrink: 0,
  },
  tipText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
    lineHeight: 20,
    flex: 1,
  },

  // ── Opened note ──────────────────────────────────────────────────────────────
  openedWrap: { padding: 16, gap: 16 },
  openedCard: {
    borderRadius: 32,
    padding: 36,
    alignItems: 'center',
    gap: 14,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,184,48,0.12)',
  },
  openedGlow: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255,184,48,0.06)',
    top: -60,
  },
  openedLetter: { fontSize: 72, marginBottom: 4 },
  openedFrom: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.38)',
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  openedBody: {
    fontSize: FontSize.base,
    color: Colors.textOnDark,
    fontFamily: FontFamily.regular,
    textAlign: 'center',
    lineHeight: 26,
    fontStyle: 'italic',
  },
  openedDivider: {
    width: 32,
    height: 1,
    backgroundColor: 'rgba(255,184,48,0.25)',
    marginVertical: 4,
  },
  openedTimestamp: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.28)',
    fontFamily: FontFamily.regular,
  },

  // ── Write mode ──────────────────────────────────────────────────────────────
  writeSection: { padding: 20, gap: 14 },
  writeTitle: {
    fontSize: FontSize.xl,
    color: Colors.charcoal,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5,
  },
  writeSub: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
    lineHeight: 20,
  },
  noteInput: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    fontSize: FontSize.base,
    color: Colors.charcoal,
    fontFamily: FontFamily.regular,
    lineHeight: 24,
    minHeight: 180,
    borderWidth: 1.5,
    borderColor: Colors.border,
    shadowColor: '#2C2C2C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  writeActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
});
