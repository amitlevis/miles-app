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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize, FontWeight } from '../../constants/typography';
import { CountdownWidget } from '../../components/widgets/CountdownWidget';
import { PartnerHeader } from '../../components/PartnerHeader';
import { Button } from '../../components/ui/Button';
import { useCoupleStore } from '../../store/coupleStore';
import { RootStackParamList } from '../../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const MILESTONES = [
  { icon: '◆', label: 'First date', date: 'Mar 14, 2023', done: true },
  { icon: '◆', label: "Said 'I love you'", date: 'May 1, 2023', done: true },
  { icon: '◆', label: 'First visit', date: 'Jul 10, 2023', done: true },
  { icon: '◇', label: "Haley's birthday", date: 'Oct 3', done: false },
  { icon: '◇', label: 'Next reunion', date: 'Set date →', done: false, highlight: true },
];

const UPCOMING = [
  { icon: '🍿', label: 'Movie night', date: 'Tonight, 9 PM', confirmed: true },
  { icon: '🧑‍🍳', label: 'Cook the same recipe', date: 'Sat, 7 PM', confirmed: false },
  { icon: '🎮', label: 'Games night', date: 'Sun, 6 PM', confirmed: false },
];

export function DatesScreen() {
  const navigation = useNavigation<Nav>();
  const { partner, reunionDate, togetherMode, setReunionDate } = useCoupleStore();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const sampleReunion = reunionDate ?? new Date(Date.now() + 47 * 24 * 60 * 60 * 1000);
  const daysUntil = Math.ceil(
    (sampleReunion.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <SafeAreaView style={styles.safe}>
      <PartnerHeader />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Reunion countdown hero */}
        <View style={styles.countdownHero}>
          <LinearGradient
            colors={['#1A1208', '#241A0A', '#1A1208']}
            style={styles.countdownHeroGradient}
          >
            {/* Glow */}
            <View style={styles.heroGlow} pointerEvents="none" />

            <Text style={styles.heroLabel}>
              {togetherMode ? 'together right now' : `until ${partner?.name ?? 'them'}`}
            </Text>

            {togetherMode ? (
              <Text style={styles.heroZero}>∞</Text>
            ) : (
              <View style={styles.heroDaysRow}>
                <Text style={styles.heroDaysNumber}>{daysUntil}</Text>
                <Text style={styles.heroDaysUnit}>days</Text>
              </View>
            )}

            {!togetherMode && (
              <Text style={styles.heroDate}>
                {sampleReunion.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            )}

            <TouchableOpacity
              style={styles.heroEditBtn}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.heroEditText}>
                {togetherMode ? 'end together mode' : 'change date'}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Date planner CTA */}
        <TouchableOpacity
          style={styles.plannerCta}
          onPress={() => navigation.navigate('DatePlanner')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#FFD470', '#FFB830', '#FF8C42']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.plannerCtaInner}
          >
            <View>
              <Text style={styles.plannerCtaTitle}>Plan a date night</Text>
              <Text style={styles.plannerCtaSub}>AI picks based on your mood & time zones</Text>
            </View>
            <View style={styles.plannerArrow}>
              <Text style={styles.plannerArrowText}>→</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Upcoming */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming</Text>
        </View>
        <View style={styles.upcomingList}>
          {UPCOMING.map((u) => (
            <View key={u.label} style={styles.upcomingRow}>
              <Text style={styles.upcomingIcon}>{u.icon}</Text>
              <View style={styles.upcomingInfo}>
                <Text style={styles.upcomingLabel}>{u.label}</Text>
                <Text style={styles.upcomingDate}>{u.date}</Text>
              </View>
              <View
                style={[
                  styles.statusPill,
                  u.confirmed ? styles.statusConfirmed : styles.statusPlanned,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    u.confirmed ? styles.statusTextConfirmed : styles.statusTextPlanned,
                  ]}
                >
                  {u.confirmed ? 'Confirmed' : 'Planned'}
                </Text>
              </View>
            </View>
          ))}
          <Button
            label="+ Plan new date"
            variant="secondary"
            onPress={() => navigation.navigate('DatePlanner')}
          />
        </View>

        {/* Milestones */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Milestones</Text>
        </View>
        <View style={styles.milestoneList}>
          {MILESTONES.map((m, i) => (
            <TouchableOpacity
              key={m.label}
              style={[
                styles.milestoneRow,
                m.highlight && styles.milestoneHighlight,
              ]}
              activeOpacity={m.highlight ? 0.8 : 1}
              onPress={m.highlight ? () => setShowDatePicker(true) : undefined}
            >
              {/* Timeline line */}
              {i < MILESTONES.length - 1 && (
                <View style={styles.timelineLine} />
              )}
              <View
                style={[
                  styles.milestoneDot,
                  m.done ? styles.milestoneDotDone : styles.milestoneDotPending,
                  m.highlight && styles.milestoneDotHighlight,
                ]}
              >
                {m.done && <View style={styles.milestoneDotInner} />}
              </View>
              <View style={styles.milestoneInfo}>
                <Text
                  style={[
                    styles.milestoneLabel,
                    m.highlight && { color: Colors.yellow },
                    !m.done && !m.highlight && { color: Colors.textMuted },
                  ]}
                >
                  {m.label}
                </Text>
                <Text
                  style={[
                    styles.milestoneDate,
                    m.highlight && { color: Colors.coral },
                  ]}
                >
                  {m.date}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Time capsule */}
        <View style={styles.timeCapsuleCard}>
          <LinearGradient
            colors={[Colors.creamDark, Colors.cream]}
            style={styles.timeCapsuleInner}
          >
            <Text style={styles.timeCapsuleGlyph}>⏳</Text>
            <View style={styles.timeCapsuleText}>
              <Text style={styles.timeCapsuleTitle}>Time Capsule</Text>
              <Text style={styles.timeCapsuleSub}>
                Seal messages & videos to be opened on a future date.
              </Text>
            </View>
            <Button label="Create" variant="secondary" size="sm" onPress={() => {}} />
          </LinearGradient>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.cream },
  content: { paddingBottom: 32 },

  // Hero countdown
  countdownHero: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.36,
    shadowRadius: 24,
    elevation: 14,
  },
  countdownHeroGradient: {
    paddingVertical: 40,
    paddingHorizontal: 28,
    alignItems: 'center',
    gap: 10,
    position: 'relative',
  },
  heroGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,184,48,0.08)',
    top: -40,
    left: '50%',
  },
  heroLabel: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.38)',
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  heroDaysRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  heroDaysNumber: {
    fontSize: 88,
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.black,
    letterSpacing: -5,
    lineHeight: 88,
  },
  heroDaysUnit: {
    fontSize: FontSize.lg,
    color: 'rgba(255,255,255,0.38)',
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
    marginBottom: 12,
  },
  heroZero: {
    fontSize: 88,
    color: Colors.yellow,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.black,
    lineHeight: 88,
  },
  heroDate: {
    fontSize: FontSize.base,
    color: 'rgba(255,255,255,0.55)',
    fontFamily: FontFamily.regular,
    textAlign: 'center',
  },
  heroEditBtn: {
    marginTop: 8,
    backgroundColor: 'rgba(255,184,48,0.12)',
    borderRadius: 100,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,184,48,0.25)',
  },
  heroEditText: {
    fontSize: FontSize.sm,
    color: Colors.yellow,
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
  },

  // Planner CTA
  plannerCta: {
    marginHorizontal: 16,
    marginBottom: 32,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: Colors.yellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.38,
    shadowRadius: 16,
    elevation: 8,
  },
  plannerCtaInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingVertical: 20,
  },
  plannerCtaTitle: {
    fontSize: FontSize.md,
    color: Colors.dark,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },
  plannerCtaSub: {
    fontSize: FontSize.sm,
    color: 'rgba(26,24,20,0.6)',
    fontFamily: FontFamily.regular,
    marginTop: 3,
  },
  plannerArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(26,24,20,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plannerArrowText: {
    fontSize: FontSize.lg,
    color: Colors.dark,
    fontWeight: FontWeight.bold,
  },

  sectionHeader: {
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

  // Upcoming
  upcomingList: { paddingHorizontal: 16, gap: 10, marginBottom: 36 },
  upcomingRow: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  upcomingIcon: { fontSize: 26 },
  upcomingInfo: { flex: 1 },
  upcomingLabel: {
    fontSize: FontSize.base,
    color: Colors.charcoal,
    fontFamily: FontFamily.semibold,
    fontWeight: FontWeight.semibold,
  },
  upcomingDate: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
    marginTop: 2,
  },
  statusPill: {
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  statusConfirmed: {
    backgroundColor: 'rgba(74,222,128,0.1)',
    borderColor: 'rgba(74,222,128,0.3)',
  },
  statusPlanned: {
    backgroundColor: Colors.yellowPale,
    borderColor: Colors.yellowLight,
  },
  statusText: { fontSize: FontSize.xs, fontFamily: FontFamily.medium, fontWeight: FontWeight.medium },
  statusTextConfirmed: { color: Colors.success },
  statusTextPlanned: { color: Colors.charcoal },

  // Milestones
  milestoneList: {
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 0,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 14,
    paddingLeft: 2,
    position: 'relative',
  },
  milestoneHighlight: {
    backgroundColor: '#1A1208',
    marginHorizontal: -20,
    paddingHorizontal: 20,
    borderRadius: 0,
  },
  timelineLine: {
    position: 'absolute',
    left: 12,
    top: 36,
    width: 1,
    height: 28,
    backgroundColor: Colors.border,
  },
  milestoneDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  milestoneDotDone: {
    borderColor: Colors.yellow,
    backgroundColor: 'rgba(255,184,48,0.1)',
  },
  milestoneDotPending: {
    borderColor: Colors.border,
    backgroundColor: Colors.cream,
  },
  milestoneDotHighlight: {
    borderColor: Colors.coral,
    backgroundColor: 'rgba(255,122,92,0.12)',
  },
  milestoneDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.yellow,
  },
  milestoneInfo: { flex: 1 },
  milestoneLabel: {
    fontSize: FontSize.base,
    color: Colors.charcoal,
    fontFamily: FontFamily.semibold,
    fontWeight: FontWeight.semibold,
  },
  milestoneDate: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
    marginTop: 2,
  },

  // Time capsule
  timeCapsuleCard: {
    marginHorizontal: 16,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeCapsuleInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 20,
  },
  timeCapsuleGlyph: { fontSize: 36 },
  timeCapsuleText: { flex: 1 },
  timeCapsuleTitle: {
    fontSize: FontSize.base,
    color: Colors.charcoal,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    marginBottom: 3,
  },
  timeCapsuleSub: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
    lineHeight: 18,
  },
});
