import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize, FontWeight } from '../../constants/typography';
import { DistanceMeterWidget } from '../../components/widgets/DistanceMeterWidget';
import { CountdownWidget } from '../../components/widgets/CountdownWidget';
import { PhotoWidget } from '../../components/widgets/PhotoWidget';
import { DrawingWidget } from '../../components/widgets/DrawingWidget';
import { useCoupleStore } from '../../store/coupleStore';
import { Button } from '../../components/ui/Button';
import { TogetherModeBanner } from '../../components/TogetherModeBanner';
import { haversineDistance } from '../../utils/distance';
import { useTheme } from '../../theme/ThemeContext';

const THEMES = [
  { key: 'goldenHour', label: 'Golden Hour', colors: ['#FFB830', '#FF7A5C'] as const },
  { key: 'midnight', label: 'Midnight', colors: ['#1A1A2E', '#4A6FA5'] as const },
  { key: 'bloom', label: 'Bloom', colors: ['#E8A0BF', '#C9B8E8'] as const },
  { key: 'drift', label: 'Drift', colors: ['#4A9ABF', '#A8D5E2'] as const },
];

interface WidgetConfig {
  distanceEnabled: boolean;
  countdownEnabled: boolean;
  photoEnabled: boolean;
  drawingEnabled: boolean;
  theme: string;
  lockScreen: boolean;
  homeScreen: boolean;
}

const WIDGET_OPTIONS = [
  {
    key: 'distanceEnabled' as const,
    label: 'Distance Meter',
    desc: 'Shows how far apart you are',
    accent: Colors.yellow,
  },
  {
    key: 'countdownEnabled' as const,
    label: 'Reunion Countdown',
    desc: 'Days until you\'re together',
    accent: Colors.coral,
  },
  {
    key: 'photoEnabled' as const,
    label: 'Latest Photo',
    desc: "Their most recent photo on your screen",
    accent: Colors.lavender,
  },
  {
    key: 'drawingEnabled' as const,
    label: 'Latest Doodle',
    desc: "Their most recent drawing on your screen",
    accent: '#4A9ABF',
  },
];

export function WidgetsScreen() {
  const theme = useTheme();
  const { user, partner, reunionDate, togetherMode } = useCoupleStore();
  const [config, setConfig] = useState<WidgetConfig>({
    distanceEnabled: true,
    countdownEnabled: true,
    photoEnabled: true,
    drawingEnabled: false,
    theme: 'goldenHour',
    lockScreen: true,
    homeScreen: true,
  });

  const distance =
    user?.location && partner?.location
      ? haversineDistance(
          user.location.lat, user.location.lng,
          partner.location.lat, partner.location.lng
        )
      : 5681;

  const toggle = (key: keyof WidgetConfig) =>
    setConfig((c) => ({ ...c, [key]: !c[key] }));

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <TogetherModeBanner />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Widgets</Text>
          <Text style={styles.pageSubtitle}>
            What appears on yours & {partner?.name ?? 'your partner'}'s lock and home screens.
          </Text>
        </View>

        {/* Phone mockup preview */}
        <View style={styles.previewSection}>
          <Text style={styles.previewLabel}>Live Preview</Text>
          <View style={styles.phoneMockup}>
            <LinearGradient
              colors={['#0F0E0C', '#1A1814', '#0F0E0C']}
              style={styles.phoneScreen}
            >
              {/* Notch */}
              <View style={styles.phoneNotch} />
              {/* Status bar */}
              <View style={styles.statusRow}>
                <Text style={styles.statusTime}>9:41</Text>
                <Text style={styles.statusIcons}>●●●</Text>
              </View>
              <Text style={styles.phoneDateText}>Wednesday, March 26</Text>

              <View style={styles.widgetRow}>
                {config.distanceEnabled && (
                  <DistanceMeterWidget miles={distance} size="small" />
                )}
                {config.countdownEnabled && (
                  <CountdownWidget
                    reunionDate={reunionDate}
                    togetherMode={togetherMode}
                    partnerName={partner?.name ?? 'them'}
                    size="small"
                  />
                )}
                {config.photoEnabled && (
                  <PhotoWidget
                    photoUri={null}
                    partnerName={partner?.name ?? 'them'}
                    size="small"
                  />
                )}
                {config.drawingEnabled && (
                  <DrawingWidget
                    partnerName={partner?.name ?? 'them'}
                    size="small"
                  />
                )}
              </View>

              {/* Slide to unlock */}
              <View style={styles.unlockBar}>
                <Text style={styles.unlockText}>slide to unlock</Text>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Widget toggles */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Widgets</Text>
        </View>
        <View style={styles.toggleList}>
          {WIDGET_OPTIONS.map((w) => (
            <View key={w.key} style={styles.toggleRow}>
              <View
                style={[
                  styles.toggleAccentBar,
                  { backgroundColor: w.accent },
                ]}
              />
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleLabel}>{w.label}</Text>
                <Text style={styles.toggleDesc}>{w.desc}</Text>
              </View>
              <Switch
                value={config[w.key] as boolean}
                onValueChange={() => toggle(w.key)}
                trackColor={{ false: Colors.border, true: `${Colors.yellow}55` }}
                thumbColor={
                  config[w.key] ? Colors.yellow : Colors.creamDark
                }
                ios_backgroundColor={Colors.border}
              />
            </View>
          ))}
        </View>

        {/* Placement */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Placement</Text>
        </View>
        <View style={styles.toggleList}>
          {[
            { key: 'lockScreen' as const, label: 'Lock Screen', desc: 'Appear on the lock screen' },
            { key: 'homeScreen' as const, label: 'Home Screen', desc: 'Appear on the home screen' },
          ].map((p) => (
            <View key={p.key} style={styles.toggleRow}>
              <View style={[styles.toggleAccentBar, { backgroundColor: Colors.lavenderDark }]} />
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleLabel}>{p.label}</Text>
                <Text style={styles.toggleDesc}>{p.desc}</Text>
              </View>
              <Switch
                value={config[p.key]}
                onValueChange={() => toggle(p.key)}
                trackColor={{ false: Colors.border, true: `${Colors.yellow}55` }}
                thumbColor={config[p.key] ? Colors.yellow : Colors.creamDark}
                ios_backgroundColor={Colors.border}
              />
            </View>
          ))}
        </View>

        {/* Theme picker */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Widget Theme</Text>
        </View>
        <View style={styles.themeGrid}>
          {THEMES.map((t) => {
            const isActive = config.theme === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                onPress={() => setConfig((c) => ({ ...c, theme: t.key }))}
                activeOpacity={0.8}
                style={[styles.themeCard, isActive && styles.themeCardActive]}
              >
                <LinearGradient
                  colors={[...t.colors]}
                  style={styles.themePreview}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <Text style={[styles.themeLabel, isActive && styles.themeLabelActive]}>
                  {t.label}
                </Text>
                {isActive && (
                  <View style={styles.themeCheckDot} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <Button
          label="Save Widget Settings"
          onPress={() => {}}
          style={styles.saveBtn}
        />

        <View style={styles.iosNote}>
          <Text style={styles.iosNoteTitle}>How to add widgets</Text>
          <Text style={styles.iosNoteText}>
            Long-press your home screen → tap "+" → find Miles → choose your widget size.{'\n\n'}
            iOS 16+ and Android 12+ required for lock screen widgets.
          </Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.cream },
  content: { paddingBottom: 32 },

  pageHeader: { paddingHorizontal: 20, paddingTop: 28, marginBottom: 28 },
  pageTitle: {
    fontSize: FontSize['3xl'],
    color: Colors.charcoal,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.black,
    letterSpacing: -1.5,
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
    lineHeight: 22,
  },

  // Phone mockup
  previewSection: {
    paddingHorizontal: 20,
    marginBottom: 36,
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  phoneMockup: {
    width: 200,
    borderRadius: 38,
    overflow: 'hidden',
    borderWidth: 5,
    borderColor: Colors.dark,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.48,
    shadowRadius: 28,
    elevation: 18,
  },
  phoneScreen: {
    paddingTop: 14,
    paddingBottom: 32,
    paddingHorizontal: 14,
    gap: 6,
  },
  phoneNotch: {
    width: 60,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignSelf: 'center',
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  statusTime: {
    fontSize: 22,
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },
  statusIcons: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 2,
  },
  phoneDateText: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.38)',
    fontFamily: FontFamily.regular,
    marginBottom: 14,
  },
  widgetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  unlockBar: {
    marginTop: 18,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 7,
    alignItems: 'center',
  },
  unlockText: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.3)',
    fontFamily: FontFamily.regular,
    letterSpacing: 0.5,
  },

  sectionHeader: { paddingHorizontal: 20, marginBottom: 14 },
  sectionTitle: {
    fontSize: FontSize.base,
    color: Colors.charcoal,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  toggleList: { paddingHorizontal: 16, gap: 10, marginBottom: 32 },
  toggleRow: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    paddingVertical: 16,
    paddingRight: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  toggleAccentBar: {
    width: 4,
    height: '100%',
    alignSelf: 'stretch',
  },
  toggleInfo: { flex: 1 },
  toggleLabel: {
    fontSize: FontSize.base,
    color: Colors.charcoal,
    fontFamily: FontFamily.semibold,
    fontWeight: FontWeight.semibold,
  },
  toggleDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
    marginTop: 2,
  },

  // Theme grid
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 28,
  },
  themeCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 14,
    width: '47%',
    gap: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    shadowColor: '#2C2C2C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  themeCardActive: {
    borderColor: Colors.yellow,
    backgroundColor: Colors.yellowPale,
  },
  themePreview: {
    width: '100%',
    height: 44,
    borderRadius: 10,
  },
  themeLabel: {
    fontSize: FontSize.sm,
    color: Colors.charcoal,
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
  },
  themeLabelActive: {
    color: Colors.charcoal,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },
  themeCheckDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.yellow,
  },

  saveBtn: { marginHorizontal: 16, marginBottom: 20 },

  iosNote: {
    marginHorizontal: 16,
    backgroundColor: Colors.creamDark,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iosNoteTitle: {
    fontSize: FontSize.sm,
    color: Colors.charcoal,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  iosNoteText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
    lineHeight: 20,
  },
});
