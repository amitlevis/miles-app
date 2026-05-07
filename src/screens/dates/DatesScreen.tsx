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
import { CountdownWidget } from '../../components/widgets/CountdownWidget';
import { PartnerHeader } from '../../components/PartnerHeader';
import { Button } from '../../components/ui/Button';
import { useCoupleStore } from '../../store/coupleStore';
import { RootStackParamList } from '../../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const MILESTONES = [
  { emoji: '💫', label: 'First date', date: 'Mar 14, 2023' },
  { emoji: '❤️', label: "Said 'I love you'", date: 'May 1, 2023' },
  { emoji: '✈️', label: 'First visit', date: 'Jul 10, 2023' },
  { emoji: '🎂', label: "Haley's birthday", date: 'Oct 3' },
  { emoji: '🎄', label: 'Next reunion', date: 'Set date →', highlight: true },
];

const UPCOMING = [
  { emoji: '🍿', label: 'Movie night', date: 'Tonight, 9 PM', tag: 'Confirmed' },
  { emoji: '🧑‍🍳', label: 'Cook the same recipe', date: 'Sat, 7 PM', tag: 'Planned' },
  { emoji: '🎮', label: 'Games night', date: 'Sun, 6 PM', tag: 'Planned' },
];

export function DatesScreen() {
  const navigation = useNavigation<Nav>();
  const { partner, reunionDate, togetherMode, setReunionDate, setGoodbyeDate } = useCoupleStore();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const sampleReunion = reunionDate ?? new Date(Date.now() + 47 * 24 * 60 * 60 * 1000);

  return (
    <SafeAreaView style={styles.safe}>
      <PartnerHeader />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Dates & Calendar</Text>

        {/* Reunion countdown */}
        <View style={styles.countdownSection}>
          <CountdownWidget
            reunionDate={sampleReunion}
            togetherMode={togetherMode}
            partnerName={partner?.name ?? 'them'}
            size="large"
          />
          <View style={styles.countdownInfo}>
            <Text style={styles.reunionLabel}>
              {togetherMode ? 'Together right now ♥' : `Next reunion`}
            </Text>
            {!togetherMode && (
              <Text style={styles.reunionDate}>
                {sampleReunion.toLocaleDateString('en-US', {
                  weekday: 'long', month: 'long', day: 'numeric',
                })}
              </Text>
            )}
            <TouchableOpacity
              style={styles.editDateBtn}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.editDateText}>
                {togetherMode ? '🗺️ End together mode' : '✏️ Change date'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Date Planner CTA */}
        <TouchableOpacity
          style={[styles.plannerCta, Shadows.yellow]}
          onPress={() => navigation.navigate('DatePlanner')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#FFB830', '#FF7A5C']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.plannerCtaGradient}
          >
            <Text style={styles.plannerCtaEmoji}>✨</Text>
            <View>
              <Text style={styles.plannerCtaTitle}>Plan a date night</Text>
              <Text style={styles.plannerCtaSub}>AI picks based on your mood & time zones</Text>
            </View>
            <Text style={styles.plannerCtaArrow}>→</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Upcoming dates */}
        <Text style={styles.sectionTitle}>Upcoming</Text>
        <View style={styles.upcomingList}>
          {UPCOMING.map((u) => (
            <View key={u.label} style={[styles.upcomingRow, Shadows.small]}>
              <Text style={styles.upcomingEmoji}>{u.emoji}</Text>
              <View style={styles.upcomingInfo}>
                <Text style={styles.upcomingLabel}>{u.label}</Text>
                <Text style={styles.upcomingDate}>{u.date}</Text>
              </View>
              <View style={[styles.upcomingTag,
                u.tag === 'Confirmed' ? styles.tagConfirmed : styles.tagPlanned]}>
                <Text style={[styles.upcomingTagText,
                  u.tag === 'Confirmed' ? styles.tagTextConfirmed : styles.tagTextPlanned]}>
                  {u.tag}
                </Text>
              </View>
            </View>
          ))}
          <Button label="+ Plan new date" variant="secondary" onPress={() => navigation.navigate('DatePlanner')} />
        </View>

        {/* Milestones */}
        <Text style={styles.sectionTitle}>Milestones</Text>
        <View style={styles.milestoneList}>
          {MILESTONES.map((m) => (
            <TouchableOpacity
              key={m.label}
              style={[styles.milestoneRow, Shadows.small, m.highlight && styles.milestoneHighlight]}
              activeOpacity={0.8}
              onPress={m.highlight ? () => setShowDatePicker(true) : undefined}
            >
              <Text style={styles.milestoneEmoji}>{m.emoji}</Text>
              <View style={styles.milestoneInfo}>
                <Text style={[styles.milestoneLabel, m.highlight && { color: Colors.coral }]}>{m.label}</Text>
                <Text style={styles.milestoneDate}>{m.date}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Time Capsule */}
        <View style={styles.timeCapsule}>
          <Text style={styles.timeCapsuleEmoji}>⏳</Text>
          <Text style={styles.timeCapsuleTitle}>Time Capsule</Text>
          <Text style={styles.timeCapsuleSub}>
            Write messages & record videos to be opened on a future date. Sealed until then.
          </Text>
          <Button label="Create a Time Capsule" variant="secondary" onPress={() => {}} style={{ marginTop: 8 }} />
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.cream },
  content: { paddingBottom: 32 },
  pageTitle: {
    fontSize: FontSize['2xl'], color: Colors.charcoal,
    fontFamily: FontFamily.bold, paddingHorizontal: 20, paddingTop: 24, marginBottom: 24,
  },
  countdownSection: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 20, marginBottom: 24,
  },
  countdownInfo: { flex: 1, gap: 6 },
  reunionLabel: { fontSize: FontSize.sm, color: Colors.textMuted, fontFamily: FontFamily.medium },
  reunionDate: { fontSize: FontSize.base, color: Colors.charcoal, fontFamily: FontFamily.bold, lineHeight: 22 },
  editDateBtn: {
    backgroundColor: Colors.yellowPale, borderRadius: 100,
    paddingHorizontal: 14, paddingVertical: 7, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: Colors.yellow,
  },
  editDateText: { fontSize: FontSize.sm, color: Colors.charcoal, fontFamily: FontFamily.medium },
  plannerCta: { marginHorizontal: 20, borderRadius: 24, overflow: 'hidden', marginBottom: 28 },
  plannerCtaGradient: {
    flexDirection: 'row', alignItems: 'center', padding: 20, gap: 14,
  },
  plannerCtaEmoji: { fontSize: 32 },
  plannerCtaTitle: { fontSize: FontSize.base, color: Colors.white, fontFamily: FontFamily.bold },
  plannerCtaSub: { fontSize: FontSize.sm, color: Colors.white, fontFamily: FontFamily.regular, opacity: 0.9, marginTop: 2 },
  plannerCtaArrow: { fontSize: FontSize.lg, color: Colors.white, fontFamily: FontFamily.bold, marginLeft: 'auto' },
  sectionTitle: {
    fontSize: FontSize.md, color: Colors.charcoal,
    fontFamily: FontFamily.bold, paddingHorizontal: 20, marginBottom: 14,
  },
  upcomingList: { paddingHorizontal: 20, gap: 10, marginBottom: 28 },
  upcomingRow: {
    backgroundColor: Colors.white, borderRadius: 18,
    padding: 14, flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  upcomingEmoji: { fontSize: 28 },
  upcomingInfo: { flex: 1 },
  upcomingLabel: { fontSize: FontSize.base, color: Colors.charcoal, fontFamily: FontFamily.semibold },
  upcomingDate: { fontSize: FontSize.sm, color: Colors.textSecondary, fontFamily: FontFamily.regular, marginTop: 2 },
  upcomingTag: { borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4 },
  tagConfirmed: { backgroundColor: '#E8F5E9' },
  tagPlanned: { backgroundColor: Colors.yellowPale },
  upcomingTagText: { fontSize: FontSize.xs, fontFamily: FontFamily.medium },
  tagTextConfirmed: { color: Colors.success },
  tagTextPlanned: { color: Colors.charcoal },
  milestoneList: { paddingHorizontal: 20, gap: 10, marginBottom: 28 },
  milestoneRow: {
    backgroundColor: Colors.white, borderRadius: 18,
    padding: 14, flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  milestoneHighlight: { backgroundColor: '#FFF0EC', borderWidth: 1.5, borderColor: Colors.coralLight },
  milestoneEmoji: { fontSize: 24 },
  milestoneInfo: { flex: 1 },
  milestoneLabel: { fontSize: FontSize.base, color: Colors.charcoal, fontFamily: FontFamily.semibold },
  milestoneDate: { fontSize: FontSize.sm, color: Colors.textSecondary, fontFamily: FontFamily.regular, marginTop: 2 },
  timeCapsule: {
    marginHorizontal: 20, backgroundColor: Colors.creamDark,
    borderRadius: 24, padding: 24, alignItems: 'center', gap: 8,
  },
  timeCapsuleEmoji: { fontSize: 48 },
  timeCapsuleTitle: { fontSize: FontSize.lg, color: Colors.charcoal, fontFamily: FontFamily.bold },
  timeCapsuleSub: {
    fontSize: FontSize.sm, color: Colors.textSecondary, fontFamily: FontFamily.regular,
    textAlign: 'center', lineHeight: 20,
  },
});
