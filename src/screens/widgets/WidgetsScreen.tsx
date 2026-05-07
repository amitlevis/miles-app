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
import { Colors, Shadows } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { DistanceMeterWidget } from '../../components/widgets/DistanceMeterWidget';
import { CountdownWidget } from '../../components/widgets/CountdownWidget';
import { PhotoWidget } from '../../components/widgets/PhotoWidget';
import { DrawingWidget } from '../../components/widgets/DrawingWidget';
import { useCoupleStore } from '../../store/coupleStore';
import { Button } from '../../components/ui/Button';
import { haversineDistance } from '../../utils/distance';

const THEMES = [
  { key: 'goldenHour', label: '☀️ Golden Hour', colors: ['#FFB830', '#FF7A5C'] as const },
  { key: 'midnight', label: '🌙 Midnight', colors: ['#1A1A2E', '#4A6FA5'] as const },
  { key: 'bloom', label: '🌸 Bloom', colors: ['#E8A0BF', '#C9B8E8'] as const },
  { key: 'drift', label: '🌊 Drift', colors: ['#4A9ABF', '#A8D5E2'] as const },
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

export function WidgetsScreen() {
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
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Widgets</Text>
        <Text style={styles.pageSubtitle}>
          Choose what appears on {partner?.name ?? 'your partner'}'s and your home & lock screens.
        </Text>

        {/* Live preview */}
        <View style={styles.previewSection}>
          <Text style={styles.previewLabel}>Preview</Text>
          <View style={styles.mockPhone}>
            <LinearGradient
              colors={['#1C1C2E', '#2C2C4E']}
              style={styles.mockPhoneInner}
            >
              <Text style={styles.mockTime}>9:41</Text>
              <Text style={styles.mockDate}>Wednesday, March 26</Text>
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
                  <PhotoWidget photoUri={null} partnerName={partner?.name ?? 'them'} size="small" />
                )}
                {config.drawingEnabled && (
                  <DrawingWidget partnerName={partner?.name ?? 'them'} size="small" />
                )}
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Widget toggles */}
        <Text style={styles.sectionTitle}>Active widgets</Text>
        <View style={styles.toggleList}>
          {[
            { key: 'distanceEnabled' as const, emoji: '🌍', label: 'Distance Meter', desc: 'Shows how far apart you are' },
            { key: 'countdownEnabled' as const, emoji: '📅', label: 'Countdown / Together Mode', desc: 'Days until your reunion' },
            { key: 'photoEnabled' as const, emoji: '📸', label: 'SnapPresence Photo', desc: "Partner's latest photo" },
            { key: 'drawingEnabled' as const, emoji: '✏️', label: 'SketchPresence Drawing', desc: "Partner's latest doodle" },
          ].map((w) => (
            <View key={w.key} style={[styles.toggleRow, Shadows.small]}>
              <Text style={styles.widgetEmoji}>{w.emoji}</Text>
              <View style={styles.widgetInfo}>
                <Text style={styles.widgetLabel}>{w.label}</Text>
                <Text style={styles.widgetDesc}>{w.desc}</Text>
              </View>
              <Switch
                value={config[w.key] as boolean}
                onValueChange={() => toggle(w.key)}
                trackColor={{ false: Colors.border, true: Colors.yellow }}
                thumbColor={Colors.white}
              />
            </View>
          ))}
        </View>

        {/* Placement */}
        <Text style={styles.sectionTitle}>Placement</Text>
        <View style={styles.toggleList}>
          <View style={[styles.toggleRow, Shadows.small]}>
            <Text style={styles.widgetEmoji}>🔒</Text>
            <View style={styles.widgetInfo}>
              <Text style={styles.widgetLabel}>Lock Screen</Text>
              <Text style={styles.widgetDesc}>Appear on the lock screen</Text>
            </View>
            <Switch
              value={config.lockScreen}
              onValueChange={() => toggle('lockScreen')}
              trackColor={{ false: Colors.border, true: Colors.yellow }}
              thumbColor={Colors.white}
            />
          </View>
          <View style={[styles.toggleRow, Shadows.small]}>
            <Text style={styles.widgetEmoji}>📱</Text>
            <View style={styles.widgetInfo}>
              <Text style={styles.widgetLabel}>Home Screen</Text>
              <Text style={styles.widgetDesc}>Appear on the home screen</Text>
            </View>
            <Switch
              value={config.homeScreen}
              onValueChange={() => toggle('homeScreen')}
              trackColor={{ false: Colors.border, true: Colors.yellow }}
              thumbColor={Colors.white}
            />
          </View>
        </View>

        {/* Theme picker */}
        <Text style={styles.sectionTitle}>Widget theme</Text>
        <View style={styles.themeGrid}>
          {THEMES.map((t) => (
            <TouchableOpacity
              key={t.key}
              onPress={() => setConfig((c) => ({ ...c, theme: t.key }))}
              activeOpacity={0.8}
              style={[
                styles.themeCard,
                config.theme === t.key && styles.themeCardActive,
                Shadows.small,
              ]}
            >
              <LinearGradient
                colors={[...t.colors]}
                style={styles.themePreview}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              />
              <Text style={styles.themeLabel}>{t.label}</Text>
              {config.theme === t.key && (
                <Text style={styles.themeCheck}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Button label="Save Widget Settings" onPress={() => {}} style={styles.saveBtn} />

        <View style={styles.iosNote}>
          <Text style={styles.iosNoteText}>
            📱 To add widgets: long-press your home screen → tap "+" → find Miles → choose your widget size.{'\n\n'}
            iOS 16+ and Android 12+ required for lock screen widgets.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.cream },
  content: { paddingBottom: 40 },
  pageTitle: {
    fontSize: FontSize['2xl'], color: Colors.charcoal,
    fontFamily: FontFamily.bold, paddingHorizontal: 20, paddingTop: 24, marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: FontSize.base, color: Colors.textSecondary,
    fontFamily: FontFamily.regular, paddingHorizontal: 20, marginBottom: 28, lineHeight: 22,
  },
  previewSection: { paddingHorizontal: 20, marginBottom: 32, alignItems: 'center' },
  previewLabel: {
    fontSize: FontSize.sm, color: Colors.textMuted,
    fontFamily: FontFamily.semibold, marginBottom: 12, alignSelf: 'flex-start',
    textTransform: 'uppercase', letterSpacing: 1,
  },
  mockPhone: {
    width: 220, borderRadius: 40, overflow: 'hidden',
    borderWidth: 6, borderColor: Colors.charcoal, ...Shadows.medium,
  },
  mockPhoneInner: { padding: 20, paddingTop: 32, paddingBottom: 40 },
  mockTime: {
    fontSize: 36, color: Colors.white, fontFamily: FontFamily.bold,
    textAlign: 'center', marginBottom: 4,
  },
  mockDate: {
    fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)',
    fontFamily: FontFamily.regular, textAlign: 'center', marginBottom: 20,
  },
  widgetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  sectionTitle: {
    fontSize: FontSize.md, color: Colors.charcoal,
    fontFamily: FontFamily.bold, paddingHorizontal: 20, marginBottom: 14,
  },
  toggleList: { paddingHorizontal: 20, gap: 10, marginBottom: 28 },
  toggleRow: {
    backgroundColor: Colors.white, borderRadius: 18,
    padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  widgetEmoji: { fontSize: 28 },
  widgetInfo: { flex: 1 },
  widgetLabel: { fontSize: FontSize.base, color: Colors.charcoal, fontFamily: FontFamily.semibold },
  widgetDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, fontFamily: FontFamily.regular, marginTop: 2 },
  themeGrid: {
    flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16,
    gap: 10, marginBottom: 28,
  },
  themeCard: {
    backgroundColor: Colors.white, borderRadius: 18, padding: 14,
    alignItems: 'center', width: '46%', gap: 8,
    borderWidth: 2, borderColor: 'transparent',
  },
  themeCardActive: { borderColor: Colors.yellow },
  themePreview: { width: '100%', height: 48, borderRadius: 10 },
  themeLabel: { fontSize: FontSize.sm, color: Colors.charcoal, fontFamily: FontFamily.medium },
  themeCheck: { fontSize: FontSize.base, color: Colors.yellow },
  saveBtn: { marginHorizontal: 20, marginBottom: 20 },
  iosNote: { marginHorizontal: 20, backgroundColor: Colors.creamDark, borderRadius: 16, padding: 16 },
  iosNoteText: {
    fontSize: FontSize.sm, color: Colors.textSecondary,
    fontFamily: FontFamily.regular, lineHeight: 20,
  },
});
