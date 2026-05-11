import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { addDays, format } from 'date-fns';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize, FontWeight } from '../../constants/typography';
import { useCoupleStore } from '../../store/coupleStore';

const MOODS = [
  { label: 'Fun', icon: '😊' },
  { label: 'Romantic', icon: '💕' },
  { label: 'Silly', icon: '😂' },
  { label: 'Chill', icon: '🧘' },
  { label: 'Special', icon: '🎉' },
  { label: 'Adventurous', icon: '🌍' },
];

const DATE_IDEAS = [
  {
    icon: '🎬',
    title: 'Synchronized Movie Night',
    desc: 'Pick a movie, start it at the same time, and watch together with a shared chat.',
    duration: '2 hrs',
    budget: 'Free',
    tags: ['Fun', 'Chill'],
  },
  {
    icon: '🧑‍🍳',
    title: 'Cook the Same Recipe',
    desc: "Pick a dish, video-call while you both cook, and eat 'together' over FaceTime.",
    duration: '1.5 hrs',
    budget: 'Ingredients',
    tags: ['Fun', 'Romantic'],
  },
  {
    icon: '🌌',
    title: 'Stargazing Date',
    desc: 'Use the same stargazing app, point at the same stars, and narrate the sky to each other.',
    duration: '45 min',
    budget: 'Free',
    tags: ['Romantic', 'Chill'],
  },
  {
    icon: '🎭',
    title: 'Online Escape Room',
    desc: 'Book a virtual escape room and solve puzzles together under pressure.',
    duration: '1 hr',
    budget: '$10–25',
    tags: ['Fun', 'Adventurous'],
  },
  {
    icon: '🎨',
    title: 'Paint Along Together',
    desc: "Find a Bob Ross tutorial, grab supplies, and create art on video call. It's supposed to look funny.",
    duration: '2 hrs',
    budget: 'Supplies',
    tags: ['Silly', 'Fun'],
  },
  {
    icon: '📖',
    title: 'Book Club for Two',
    desc: 'Pick a short story, read it separately, then call to discuss. One book, two perspectives.',
    duration: '1 hr',
    budget: 'Free',
    tags: ['Chill', 'Romantic'],
  },
  {
    icon: '🌅',
    title: 'Watch the Same Sunset',
    desc: 'Schedule for golden hour in both your time zones. Text each other your sky.',
    duration: '30 min',
    budget: 'Free',
    tags: ['Romantic', 'Special'],
  },
  {
    icon: '🎤',
    title: 'Karaoke Night',
    desc: 'Find a free karaoke app, take turns performing for each other. No judgment zone.',
    duration: '1 hr',
    budget: 'Free',
    tags: ['Silly', 'Fun'],
  },
];

type DateIdea = (typeof DATE_IDEAS)[0];

export function DatePlannerScreen() {
  const navigation = useNavigation();
  const { partner } = useCoupleStore();
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<DateIdea | null>(null);

  const toggleMood = (label: string) =>
    setSelectedMoods((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]
    );

  const getAISuggestion = async () => {
    setAiGenerating(true);
    await new Promise((r) => setTimeout(r, 1600));
    const filtered = DATE_IDEAS.filter(
      (d) =>
        selectedMoods.length === 0 ||
        d.tags.some((t) => selectedMoods.includes(t))
    );
    setAiSuggestion(filtered[Math.floor(Math.random() * filtered.length)]);
    setAiGenerating(false);
  };

  const filteredIdeas =
    selectedMoods.length === 0
      ? DATE_IDEAS
      : DATE_IDEAS.filter((d) =>
          d.tags.some((t) => selectedMoods.includes(t))
        );

  /**
   * "Add to calendar" — opens Google Calendar's event-create URL in the
   * browser, pre-filled with title/description. Works cross-platform without
   * needing native calendar permissions.
   */
  const handleAddToCalendar = async (idea: DateIdea) => {
    const start = addDays(new Date(), 1);
    start.setHours(19, 0, 0, 0); // 7pm tomorrow
    const end = new Date(start.getTime() + 90 * 60 * 1000);

    const fmt = (d: Date) => format(d, "yyyyMMdd'T'HHmmss");
    const url =
      'https://calendar.google.com/calendar/r/eventedit?' +
      'text=' +
      encodeURIComponent(`${idea.title} with ${partner?.name ?? 'partner'}`) +
      '&details=' +
      encodeURIComponent(idea.desc + '\n\n— via Miles') +
      '&dates=' +
      `${fmt(start)}/${fmt(end)}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert('Calendar', "Couldn't open your calendar app. Copy the date manually?");
        return;
      }
      await Linking.openURL(url);
    } catch (e: any) {
      Alert.alert("Couldn't open calendar", e.message ?? 'Try again.');
    }
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
          <Text style={styles.headerTitle}>Date Planner</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* AI planner card */}
        <View style={styles.aiCard}>
          <LinearGradient
            colors={['#1A1208', '#241A0A', '#1A1208']}
            style={styles.aiGradient}
          >
            <View style={styles.aiGlow} />

            <View style={styles.aiHeaderRow}>
              <View style={styles.aiSparkleCircle}>
                <Text style={styles.aiSparkle}>✨</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.aiTitle}>Miles AI Planner</Text>
                <Text style={styles.aiSub}>
                  Pick a vibe — we'll suggest the perfect date.
                </Text>
              </View>
            </View>

            <Text style={styles.filterLabel}>YOUR MOOD TODAY</Text>
            <View style={styles.moodPills}>
              {MOODS.map((m) => {
                const active = selectedMoods.includes(m.label);
                return (
                  <TouchableOpacity
                    key={m.label}
                    style={[styles.moodPill, active && styles.moodPillActive]}
                    onPress={() => toggleMood(m.label)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.moodPillIcon}>{m.icon}</Text>
                    <Text
                      style={[
                        styles.moodPillText,
                        active && styles.moodPillTextActive,
                      ]}
                    >
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              onPress={getAISuggestion}
              activeOpacity={0.88}
              disabled={aiGenerating}
              style={styles.aiBtnWrap}
            >
              <LinearGradient
                colors={['#FFD470', '#FFB830', '#FF8C42']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.aiBtnGradient}
              >
                {aiGenerating ? (
                  <ActivityIndicator color={Colors.dark} />
                ) : (
                  <Text style={styles.aiBtnText}>✨ Suggest a date</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* AI Suggestion result */}
        {aiSuggestion && (
          <View style={styles.suggestionCard}>
            <View style={styles.suggestionAccent} />
            <View style={styles.suggestionIconBox}>
              <Text style={styles.suggestionIcon}>{aiSuggestion.icon}</Text>
            </View>
            <Text style={styles.suggestionLabel}>SUGGESTED FOR YOU</Text>
            <Text style={styles.suggestionTitle}>{aiSuggestion.title}</Text>
            <Text style={styles.suggestionDesc}>{aiSuggestion.desc}</Text>
            <View style={styles.suggestionMeta}>
              <View style={styles.metaChip}>
                <Text style={styles.metaIcon}>⏱</Text>
                <Text style={styles.metaText}>{aiSuggestion.duration}</Text>
              </View>
              <View style={styles.metaChip}>
                <Text style={styles.metaIcon}>💰</Text>
                <Text style={styles.metaText}>{aiSuggestion.budget}</Text>
              </View>
            </View>
            <View style={styles.suggestionActions}>
              <TouchableOpacity
                style={styles.suggestionCalBtn}
                activeOpacity={0.85}
                onPress={() => handleAddToCalendar(aiSuggestion)}
              >
                <Text style={styles.suggestionCalText}>Add to calendar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.suggestionShuffleBtn}
                onPress={getAISuggestion}
                activeOpacity={0.8}
              >
                <Text style={styles.suggestionShuffleText}>↻</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Section heading */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All date ideas</Text>
          <Text style={styles.sectionCount}>
            {filteredIdeas.length} of {DATE_IDEAS.length}
          </Text>
        </View>

        {/* All ideas list */}
        <View style={styles.ideaList}>
          {filteredIdeas.map((idea) => (
            <View key={idea.title} style={styles.ideaCard}>
              <View style={styles.ideaIconBox}>
                <Text style={styles.ideaIcon}>{idea.icon}</Text>
              </View>
              <View style={styles.ideaInfo}>
                <Text style={styles.ideaTitle}>{idea.title}</Text>
                <Text style={styles.ideaDesc} numberOfLines={2}>
                  {idea.desc}
                </Text>
                <View style={styles.ideaMetaRow}>
                  <Text style={styles.ideaMetaText}>⏱ {idea.duration}</Text>
                  <View style={styles.ideaMetaDot} />
                  <Text style={styles.ideaMetaText}>💰 {idea.budget}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.addBtn}
                activeOpacity={0.8}
                onPress={() => handleAddToCalendar(idea)}
              >
                <Text style={styles.addBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

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

  content: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 },

  // AI card
  aiCard: {
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,184,48,0.18)',
    shadowColor: Colors.yellow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 10,
  },
  aiGradient: {
    padding: 22,
    position: 'relative',
  },
  aiGlow: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255,184,48,0.08)',
    top: -80,
    right: -60,
  },
  aiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },
  aiSparkleCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,184,48,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,184,48,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiSparkle: { fontSize: 20 },
  aiTitle: {
    fontSize: FontSize.md,
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },
  aiSub: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: FontFamily.regular,
    marginTop: 2,
  },

  filterLabel: {
    fontSize: 10,
    color: 'rgba(255,184,48,0.65)',
    fontFamily: FontFamily.semibold,
    fontWeight: FontWeight.semibold,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  moodPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  moodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  moodPillActive: {
    backgroundColor: 'rgba(255,184,48,0.18)',
    borderColor: 'rgba(255,184,48,0.4)',
  },
  moodPillIcon: { fontSize: 14 },
  moodPillText: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.55)',
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
  },
  moodPillTextActive: {
    color: Colors.yellow,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },

  aiBtnWrap: {
    borderRadius: 100,
    overflow: 'hidden',
    shadowColor: Colors.yellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.32,
    shadowRadius: 14,
    elevation: 6,
  },
  aiBtnGradient: { paddingVertical: 14, alignItems: 'center' },
  aiBtnText: {
    fontSize: FontSize.base,
    color: Colors.dark,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },

  // Suggestion result
  suggestionCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 10,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    shadowColor: '#2C2C2C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 5,
  },
  suggestionAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: Colors.yellow,
  },
  suggestionIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: Colors.creamDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  suggestionIcon: { fontSize: 32 },
  suggestionLabel: {
    fontSize: 9,
    color: Colors.yellow,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    letterSpacing: 2,
  },
  suggestionTitle: {
    fontSize: FontSize.lg,
    color: Colors.charcoal,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.black,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  suggestionDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 2,
  },
  suggestionMeta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.creamDark,
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metaIcon: { fontSize: 12 },
  metaText: {
    fontSize: FontSize.xs,
    color: Colors.charcoal,
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
  },

  suggestionActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 12,
  },
  suggestionCalBtn: {
    flex: 1,
    backgroundColor: Colors.yellow,
    borderRadius: 100,
    paddingVertical: 13,
    alignItems: 'center',
    shadowColor: Colors.yellow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  suggestionCalText: {
    fontSize: FontSize.sm,
    color: Colors.dark,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },
  suggestionShuffleBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.creamDark,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionShuffleText: {
    fontSize: 18,
    color: Colors.charcoal,
  },

  // Idea list
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
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

  ideaList: { gap: 10 },
  ideaCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#2C2C2C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  ideaIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.creamDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ideaIcon: { fontSize: 26 },
  ideaInfo: { flex: 1 },
  ideaTitle: {
    fontSize: FontSize.base,
    color: Colors.charcoal,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    marginBottom: 4,
  },
  ideaDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
    lineHeight: 18,
  },
  ideaMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  ideaMetaText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
  },
  ideaMetaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.textMuted,
    opacity: 0.5,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.yellow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  addBtnText: {
    fontSize: FontSize.lg,
    color: Colors.dark,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    lineHeight: 22,
  },
});
