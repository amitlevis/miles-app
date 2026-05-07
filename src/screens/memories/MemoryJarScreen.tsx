import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Shadows } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { Button } from '../../components/ui/Button';
import { useCoupleStore } from '../../store/coupleStore';

const MOCK_NOTES = [
  { id: '1', opened: false, preview: 'A little something for when you need it...' },
  { id: '2', opened: false, preview: 'I recorded something for you.' },
  { id: '3', opened: false, preview: 'For whenever you miss me...' },
];

export function MemoryJarScreen() {
  const navigation = useNavigation();
  const { partner } = useCoupleStore();
  const [notes, setNotes] = useState(MOCK_NOTES);
  const [writing, setWriting] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [openedNote, setOpenedNote] = useState<typeof MOCK_NOTES[0] | null>(null);

  const openNote = (note: typeof MOCK_NOTES[0]) => {
    setOpenedNote(note);
    setNotes((prev) => prev.map((n) => (n.id === note.id ? { ...n, opened: true } : n)));
  };

  const sendNote = () => {
    if (!noteText.trim()) return;
    setWriting(false);
    setNoteText('');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Memory Jar</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {openedNote ? (
          <View style={styles.openedNote}>
            <LinearGradient
              colors={['#FFD470', '#FFB830']}
              style={styles.openedNoteCard}
            >
              <Text style={styles.openedNoteEmoji}>💌</Text>
              <Text style={styles.openedNoteText}>
                {partner?.name} left this for you:{'\n\n'}
                "Wherever you are right now, I'm thinking of you. Every moment apart just makes me more grateful for every moment together. You are my favorite person."
              </Text>
              <Text style={styles.openedNoteDate}>Left 3 days ago</Text>
            </LinearGradient>
            <Button label="Close" variant="ghost" onPress={() => setOpenedNote(null)} />
          </View>
        ) : writing ? (
          <View style={styles.writeSection}>
            <Text style={styles.writeTitle}>Leave a surprise for {partner?.name}</Text>
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
            <View style={styles.writeActions}>
              <Button label="Cancel" variant="ghost" onPress={() => setWriting(false)} />
              <Button label="Send to jar ♥" onPress={sendNote} disabled={!noteText.trim()} />
            </View>
          </View>
        ) : (
          <>
            <LinearGradient
              colors={['#FFF8E7', '#FFD470']}
              style={styles.jarHero}
            >
              <Text style={styles.jarEmoji}>🫙</Text>
              <Text style={styles.jarTitle}>Memory Jar</Text>
              <Text style={styles.jarSub}>
                {partner?.name ?? 'Your partner'} left {notes.filter((n) => !n.opened).length} surprises for you.
                Open one whenever you need them.
              </Text>
            </LinearGradient>

            <Text style={styles.sectionTitle}>From {partner?.name}</Text>
            <View style={styles.noteList}>
              {notes.map((note) => (
                <TouchableOpacity
                  key={note.id}
                  style={[styles.noteCard, Shadows.small, note.opened && styles.noteCardOpened]}
                  onPress={() => !note.opened && openNote(note)}
                  activeOpacity={note.opened ? 1 : 0.8}
                >
                  <Text style={styles.noteCardEmoji}>{note.opened ? '💌' : '🎁'}</Text>
                  <View style={styles.noteCardInfo}>
                    <Text style={styles.noteCardTitle}>
                      {note.opened ? 'Opened' : 'A surprise is waiting...'}
                    </Text>
                    <Text style={styles.noteCardPreview}>
                      {note.opened ? 'Tap to read again' : 'Tap to open'}
                    </Text>
                  </View>
                  <Text style={styles.noteCardArrow}>{note.opened ? '' : '→'}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              label={`+ Leave a surprise for ${partner?.name ?? 'them'}`}
              variant="secondary"
              onPress={() => setWriting(true)}
              style={styles.addBtn}
            />

            <View style={styles.tipBox}>
              <Text style={styles.tipTitle}>💡 Tips for the jar</Text>
              <Text style={styles.tipText}>
                • Record a voice memo telling them your favorite memory together{'\n'}
                • Write about what you love most about them{'\n'}
                • Leave a playlist that reminds you of them{'\n'}
                • Write a letter to be opened on a hard day
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
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.white,
  },
  backText: { fontSize: FontSize.xl, color: Colors.charcoal },
  title: { fontSize: FontSize.md, color: Colors.charcoal, fontFamily: FontFamily.bold, flex: 1, textAlign: 'center' },
  content: { paddingBottom: 40 },
  jarHero: { padding: 32, alignItems: 'center', gap: 10 },
  jarEmoji: { fontSize: 72 },
  jarTitle: { fontSize: FontSize['2xl'], color: Colors.charcoal, fontFamily: FontFamily.bold },
  jarSub: {
    fontSize: FontSize.base, color: Colors.charcoal, fontFamily: FontFamily.regular,
    textAlign: 'center', lineHeight: 22, opacity: 0.75,
  },
  sectionTitle: {
    fontSize: FontSize.md, color: Colors.charcoal,
    fontFamily: FontFamily.bold, paddingHorizontal: 20, marginVertical: 16,
  },
  noteList: { paddingHorizontal: 20, gap: 12, marginBottom: 20 },
  noteCard: {
    backgroundColor: Colors.white, borderRadius: 20, padding: 18,
    flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  noteCardOpened: { backgroundColor: Colors.creamDark },
  noteCardEmoji: { fontSize: 32 },
  noteCardInfo: { flex: 1 },
  noteCardTitle: { fontSize: FontSize.base, color: Colors.charcoal, fontFamily: FontFamily.semibold },
  noteCardPreview: { fontSize: FontSize.sm, color: Colors.textSecondary, fontFamily: FontFamily.regular, marginTop: 2 },
  noteCardArrow: { fontSize: FontSize.lg, color: Colors.coral },
  addBtn: { marginHorizontal: 20, marginBottom: 20 },
  tipBox: { marginHorizontal: 20, backgroundColor: Colors.yellowPale, borderRadius: 20, padding: 20, gap: 10 },
  tipTitle: { fontSize: FontSize.base, color: Colors.charcoal, fontFamily: FontFamily.bold },
  tipText: {
    fontSize: FontSize.sm, color: Colors.textSecondary,
    fontFamily: FontFamily.regular, lineHeight: 24,
  },
  openedNote: { padding: 20, gap: 20 },
  openedNoteCard: { borderRadius: 28, padding: 32, alignItems: 'center', gap: 16 },
  openedNoteEmoji: { fontSize: 64 },
  openedNoteText: {
    fontSize: FontSize.base, color: Colors.charcoal, fontFamily: FontFamily.medium,
    textAlign: 'center', lineHeight: 26,
  },
  openedNoteDate: { fontSize: FontSize.sm, color: Colors.charcoal, fontFamily: FontFamily.regular, opacity: 0.6 },
  writeSection: { padding: 20, gap: 14 },
  writeTitle: { fontSize: FontSize.lg, color: Colors.charcoal, fontFamily: FontFamily.bold },
  writeSub: { fontSize: FontSize.sm, color: Colors.textSecondary, fontFamily: FontFamily.regular, lineHeight: 20 },
  noteInput: {
    backgroundColor: Colors.white, borderRadius: 20,
    padding: 20, fontSize: FontSize.base, color: Colors.charcoal,
    fontFamily: FontFamily.regular, lineHeight: 24, minHeight: 160,
    borderWidth: 1.5, borderColor: Colors.border, ...Shadows.small,
  },
  writeActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
});
