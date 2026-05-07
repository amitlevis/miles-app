import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Shadows } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { Button } from '../../components/ui/Button';
import { useCoupleStore } from '../../store/coupleStore';

const MOODS = ['😊 Fun', '💕 Romantic', '😂 Silly', '🧘 Chill', '🎉 Special', '🌍 Adventurous'];

const DATE_IDEAS = [
  {
    emoji: '🎬',
    title: 'Synchronized Movie Night',
    desc: 'Pick a movie, start it at the same time, and watch together with a shared chat.',
    duration: '2 hrs',
    budget: 'Free',
    tags: ['Fun', 'Chill'],
  },
  {
    emoji: '🧑‍🍳',
    title: 'Cook the Same Recipe',
    desc: "Pick a dish, video call while you both cook, and eat 'together' over FaceTime.",
    duration: '1.5 hrs',
    budget: 'Ingredients',
    tags: ['Fun', 'Romantic'],
  },
  {
    emoji: '🌌',
    title: 'Stargazing Date',
    desc: 'Use the same stargazing app, point at the same stars, and narrate what you see to each other.',
    duration: '45 min',
    budget: 'Free',
    tags: ['Romantic', 'Chill'],
  },
  {
    emoji: '🎭',
    title: 'Online Escape Room',
    desc: 'Book a virtual escape room and solve puzzles together under pressure.',
    duration: '1 hr',
    budget: '$10–25',
    tags: ['Fun', 'Adventurous'],
  },
  {
    emoji: '🎨',
    title: 'Paint Along Together',
    desc: "Find a Bob Ross tutorial on YouTube, grab supplies, and create art on video call. Don't worry — it's supposed to look funny.",
    duration: '2 hrs',
    budget: 'Supplies',
    tags: ['Silly', 'Fun'],
  },
  {
    emoji: '📖',
    title: 'Book Club for Two',
    desc: 'Pick a short story or chapter, read it separately, then call to discuss. One book, two perspectives.',
    duration: '1 hr',
    budget: 'Free',
    tags: ['Chill', 'Romantic'],
  },
  {
    emoji: '🌅',
    title: 'Watch the Same Sunset',
    desc: 'Schedule it for golden hour in both your time zones (different days). Text each other your sky.',
    duration: '30 min',
    budget: 'Free',
    tags: ['Romantic', 'Special'],
  },
  {
    emoji: '🎤',
    title: 'Karaoke Night',
    desc: 'Find a free karaoke app, take turns performing for each other. No judgment zone.',
    duration: '1 hr',
    budget: 'Free',
    tags: ['Silly', 'Fun'],
  },
];

export function DatePlannerScreen() {
  const navigation = useNavigation();
  const { partner } = useCoupleStore();
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<typeof DATE_IDEAS[0] | null>(null);

  const toggleMood = (m: string) =>
    setSelectedMoods((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));

  const getAISuggestion = async () => {
    setAiGenerating(true);
    await new Promise((r) => setTimeout(r, 1800));
    const filtered = DATE_IDEAS.filter((d) =>
      selectedMoods.length === 0 || d.tags.some((t) => selectedMoods.some((m) => m.includes(t)))
    );
    setAiSuggestion(filtered[Math.floor(Math.random() * filtered.length)]);
    setAiGenerating(false);
  };

  const filteredIdeas =
    selectedMoods.length === 0
      ? DATE_IDEAS
      : DATE_IDEAS.filter((d) => d.tags.some((t) => selectedMoods.some((m) => m.includes(t))));

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Date Planner</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* AI planner */}
        <View style={[styles.aiSection, Shadows.yellow]}>
          <LinearGradient
            colors={['#FFB830', '#FFD470']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.aiGradient}
          >
            <Text style={styles.aiTitle}>✨ Miles Date Planner</Text>
            <Text style={styles.aiSub}>
              Tell Miles your mood and get the perfect date idea for you and {partner?.name ?? 'your partner'}.
            </Text>

            <Text style={styles.filterLabel}>Your mood today</Text>
            <View style={styles.moodPills}>
              {MOODS.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.moodPill, selectedMoods.includes(m) && styles.moodPillActive]}
                  onPress={() => toggleMood(m)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.moodPillText, selectedMoods.includes(m) && styles.moodPillTextActive]}>
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              label={aiGenerating ? '✨ Thinking...' : '✨ Suggest a date'}
              loading={aiGenerating}
              onPress={getAISuggestion}
              style={styles.aiBtn}
            />
          </LinearGradient>
        </View>

        {aiSuggestion && (
          <View style={[styles.aiResult, Shadows.small]}>
            <Text style={styles.aiResultEmoji}>{aiSuggestion.emoji}</Text>
            <Text style={styles.aiResultTitle}>{aiSuggestion.title}</Text>
            <Text style={styles.aiResultDesc}>{aiSuggestion.desc}</Text>
            <View style={styles.aiResultMeta}>
              <Text style={styles.metaItem}>⏱ {aiSuggestion.duration}</Text>
              <Text style={styles.metaItem}>💰 {aiSuggestion.budget}</Text>
            </View>
            <Button label="Add to calendar" variant="secondary" onPress={() => {}} size="sm" />
          </View>
        )}

        {/* Browse all */}
        <Text style={styles.sectionTitle}>All date ideas</Text>
        <View style={styles.ideaList}>
          {filteredIdeas.map((idea) => (
            <View key={idea.title} style={[styles.ideaCard, Shadows.small]}>
              <Text style={styles.ideaEmoji}>{idea.emoji}</Text>
              <View style={styles.ideaInfo}>
                <Text style={styles.ideaTitle}>{idea.title}</Text>
                <Text style={styles.ideaDesc} numberOfLines={2}>{idea.desc}</Text>
                <View style={styles.ideaMeta}>
                  <Text style={styles.ideaMetaText}>⏱ {idea.duration}</Text>
                  <Text style={styles.ideaMetaText}>💰 {idea.budget}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.addBtn}>
                <Text style={styles.addBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
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
  content: { padding: 20, paddingBottom: 40 },
  aiSection: { borderRadius: 24, overflow: 'hidden', marginBottom: 20 },
  aiGradient: { padding: 24 },
  aiTitle: { fontSize: FontSize.lg, color: Colors.charcoal, fontFamily: FontFamily.bold, marginBottom: 6 },
  aiSub: { fontSize: FontSize.sm, color: Colors.charcoal, fontFamily: FontFamily.regular, marginBottom: 20, opacity: 0.75 },
  filterLabel: { fontSize: FontSize.sm, color: Colors.charcoal, fontFamily: FontFamily.semibold, marginBottom: 10 },
  moodPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  moodPill: {
    backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 100,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  moodPillActive: { backgroundColor: Colors.white },
  moodPillText: { fontSize: FontSize.sm, color: Colors.charcoal, fontFamily: FontFamily.medium },
  moodPillTextActive: { fontFamily: FontFamily.bold },
  aiBtn: { backgroundColor: Colors.charcoal },
  aiResult: {
    backgroundColor: Colors.white, borderRadius: 24, padding: 24,
    alignItems: 'center', gap: 10, marginBottom: 28,
  },
  aiResultEmoji: { fontSize: 52 },
  aiResultTitle: { fontSize: FontSize.lg, color: Colors.charcoal, fontFamily: FontFamily.bold, textAlign: 'center' },
  aiResultDesc: {
    fontSize: FontSize.base, color: Colors.textSecondary,
    fontFamily: FontFamily.regular, textAlign: 'center', lineHeight: 22,
  },
  aiResultMeta: { flexDirection: 'row', gap: 16 },
  metaItem: { fontSize: FontSize.sm, color: Colors.textMuted, fontFamily: FontFamily.medium },
  sectionTitle: {
    fontSize: FontSize.md, color: Colors.charcoal,
    fontFamily: FontFamily.bold, marginBottom: 14,
  },
  ideaList: { gap: 12 },
  ideaCard: {
    backgroundColor: Colors.white, borderRadius: 20, padding: 16,
    flexDirection: 'row', gap: 14, alignItems: 'flex-start',
  },
  ideaEmoji: { fontSize: 32 },
  ideaInfo: { flex: 1 },
  ideaTitle: { fontSize: FontSize.base, color: Colors.charcoal, fontFamily: FontFamily.bold, marginBottom: 4 },
  ideaDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, fontFamily: FontFamily.regular, lineHeight: 20 },
  ideaMeta: { flexDirection: 'row', gap: 12, marginTop: 8 },
  ideaMetaText: { fontSize: FontSize.xs, color: Colors.textMuted, fontFamily: FontFamily.medium },
  addBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.yellowPale, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.yellow,
  },
  addBtnText: { fontSize: FontSize.lg, color: Colors.charcoal, fontFamily: FontFamily.bold },
});
