import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Pressable,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { addWeeks, addMonths, format } from 'date-fns';
import { Colors, Shadows } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { PartnerHeader } from '../../components/PartnerHeader';
import { DistanceMeterWidget } from '../../components/widgets/DistanceMeterWidget';
import { CountdownWidget } from '../../components/widgets/CountdownWidget';
import { PhotoWidget } from '../../components/widgets/PhotoWidget';
import { DrawingWidget } from '../../components/widgets/DrawingWidget';
import { DrawingCanvas } from '../../components/DrawingCanvas';
import { useCoupleStore } from '../../store/coupleStore';
import { haversineDistance } from '../../utils/distance';
import { getPartnerTime, getPartnerDate } from '../../utils/timeZone';
import { RootStackParamList } from '../../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const MOODS = [
  { emoji: '💭', label: 'Missing you' },
  { emoji: '☀️', label: 'Good morning' },
  { emoji: '🌙', label: 'Good night' },
  { emoji: '🤗', label: 'Need a hug' },
  { emoji: '😊', label: 'Happy' },
  { emoji: '💪', label: 'Thinking of you' },
];

const QUICK_ACTIONS = [
  { emoji: '🎬', label: 'Watch', route: 'WatchTogether' as const },
  { emoji: '🎵', label: 'Listen', route: 'ListenTogether' as const },
  { emoji: '🎮', label: 'Games', route: 'Games' as const },
  { emoji: '🎁', label: 'Gift', route: 'Shop' as const },
];

const DATE_PRESETS = [
  { label: 'In 1 week', getDate: () => addWeeks(new Date(), 1) },
  { label: 'In 2 weeks', getDate: () => addWeeks(new Date(), 2) },
  { label: 'In 1 month', getDate: () => addMonths(new Date(), 1) },
  { label: 'In 3 months', getDate: () => addMonths(new Date(), 3) },
  { label: 'In 6 months', getDate: () => addMonths(new Date(), 6) },
];

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { user, partner, reunionDate, togetherMode, distanceMiles, setTogetherMode, setReunionDate } =
    useCoupleStore();

  const [partnerTime, setPartnerTime] = useState('');
  const [partnerDate, setPartnerDate] = useState('');
  const [moodSent, setMoodSent] = useState<string | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [hasDoodle, setHasDoodle] = useState(false);
  const [togetherSince] = useState(() => new Date());

  const [showDateModal, setShowDateModal] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [showDoodleModal, setShowDoodleModal] = useState(false);

  // Heartbeat animation
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const heartbeatLoop = useRef<Animated.CompositeAnimation | null>(null);
  const hapticTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const distance =
    distanceMiles ??
    (user?.location && partner?.location
      ? haversineDistance(user.location.lat, user.location.lng, partner.location.lat, partner.location.lng)
      : 5681);

  useEffect(() => {
    if (!partner?.timeZone) return;
    const update = () => {
      setPartnerTime(getPartnerTime(partner.timeZone));
      setPartnerDate(getPartnerDate(partner.timeZone));
    };
    update();
    const interval = setInterval(update, 30_000);
    return () => clearInterval(interval);
  }, [partner?.timeZone]);

  const sendMood = async (mood: (typeof MOODS)[0]) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMoodSent(mood.label);
    setTimeout(() => setMoodSent(null), 2500);
  };

  const startHeartbeat = async () => {
    heartbeatLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.35, duration: 200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 300, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.18, duration: 180, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 320, useNativeDriver: true }),
      ])
    );
    heartbeatLoop.current.start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    hapticTimer.current = setInterval(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 220);
    }, 1000);
  };

  const stopHeartbeat = () => {
    heartbeatLoop.current?.stop();
    Animated.timing(pulseAnim, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    if (hapticTimer.current) {
      clearInterval(hapticTimer.current);
      hapticTimer.current = null;
    }
  };

  const handlePickPhoto = async () => {
    setShowPhotoOptions(false);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) setPhotoUri(result.assets[0].uri);
  };

  const handleTakePhoto = async () => {
    setShowPhotoOptions(false);
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled && result.assets[0]) setPhotoUri(result.assets[0].uri);
  };

  if (!user || !partner) return null;

  // ── Together mode — full-screen cozy transformation ──────────────────────
  if (togetherMode) {
    return (
      <LinearGradient colors={['#EDE0FF', '#FFD6E8', '#FFF4D6']} locations={[0, 0.5, 1]} style={{ flex: 1 }}>
        <SafeAreaView style={styles.togetherSafe}>
          <View style={styles.togetherContent}>
            <View style={styles.togetherTop}>
              <Text style={styles.togetherBigEmoji}>🫶</Text>
              <Text style={styles.togetherNames}>
                {user.name} & {partner.name}
              </Text>
              <Text style={styles.togetherTagline}>You're together right now</Text>
              <View style={styles.togetherDateBadge}>
                <Text style={styles.togetherDateText}>Since {format(togetherSince, 'MMMM d')}</Text>
              </View>
            </View>

            <View style={styles.togetherCards}>
              <View style={[styles.togetherCard, Shadows.small]}>
                <Text style={styles.togetherCardLabel}>How are you feeling?</Text>
                <View style={styles.togetherEmojiRow}>
                  {['😍', '🥰', '😊', '💃', '🎉', '☺️'].map((e) => (
                    <TouchableOpacity
                      key={e}
                      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                      activeOpacity={0.7}
                    >
                      <Text style={{ fontSize: 30 }}>{e}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={[styles.togetherCard, Shadows.small]}>
                <Text style={styles.zeroMilesNumber}>0</Text>
                <Text style={styles.zeroMilesLabel}>miles apart</Text>
                <Text style={styles.zeroMilesSub}>The distance is zero ♥</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.endTogetherBtn}
              onPress={() => setTogetherMode(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.endTogetherText}>We're apart again</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // ── Normal home screen ────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <PartnerHeader />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Partner time */}
        <View style={styles.timeBanner}>
          <Text style={styles.timeBannerText}>
            {partner.name}'s time:{' '}
            <Text style={styles.timeBold}>{partnerTime}</Text>
          </Text>
          <Text style={styles.dateBannerText}>{partnerDate}</Text>
        </View>

        {/* Widget grid */}
        <View style={styles.widgetGrid}>
          <DistanceMeterWidget miles={distance} isApproaching={false} />
          <CountdownWidget
            reunionDate={reunionDate}
            togetherMode={togetherMode}
            partnerName={partner.name}
            onPress={() => setShowDateModal(true)}
          />
          <PhotoWidget
            photoUri={photoUri}
            partnerName={partner.name}
            tag="good morning"
            onSendPhoto={() => setShowPhotoOptions(true)}
          />
          <DrawingWidget
            partnerName={partner.name}
            existingDrawing={hasDoodle ? 'yes' : null}
            mode="view"
            onPress={() => setShowDoodleModal(true)}
          />
        </View>

        {/* Together toggle — centered & prominent */}
        <TouchableOpacity
          style={styles.togetherBanner}
          onPress={() => setTogetherMode(true)}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#EDE0FF', '#FFD6E8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.togetherBannerGradient}
          >
            <Text style={styles.togetherBannerEmoji}>🫶</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.togetherBannerTitle}>We're physically together</Text>
              <Text style={styles.togetherBannerSub}>Tap to enter together mode</Text>
            </View>
            <Text style={styles.togetherBannerArrow}>→</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Mood share */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Send a vibe</Text>
          {moodSent && (
            <View style={styles.moodSentBadge}>
              <Text style={styles.moodSentText}>Sent to {partner.name} ♥</Text>
            </View>
          )}
          <View style={styles.moodGrid}>
            {MOODS.map((m) => (
              <TouchableOpacity
                key={m.label}
                style={[styles.moodBtn, moodSent === m.label && styles.moodBtnActive]}
                onPress={() => sendMood(m)}
                activeOpacity={0.7}
              >
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                <Text style={styles.moodLabel}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Do something together</Text>
          <View style={styles.quickActions}>
            {QUICK_ACTIONS.map((a) => (
              <TouchableOpacity
                key={a.route}
                style={styles.quickAction}
                onPress={() => navigation.navigate(a.route)}
                activeOpacity={0.8}
              >
                <View style={styles.quickActionIcon}>
                  <Text style={styles.quickActionEmoji}>{a.emoji}</Text>
                </View>
                <Text style={styles.quickActionLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Heartbeat */}
        <View style={[styles.heartbeatCard, Shadows.small]}>
          <View style={styles.heartbeatRow}>
            <Animated.Text style={[styles.heartbeatEmoji, { transform: [{ scale: pulseAnim }] }]}>
              💓
            </Animated.Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.heartbeatTitle}>Send your heartbeat</Text>
              <Text style={styles.heartbeatSub}>{partner.name} feels it as a vibration</Text>
            </View>
          </View>
          <Pressable style={styles.heartbeatBtn} onPressIn={startHeartbeat} onPressOut={stopHeartbeat}>
            <Text style={styles.heartbeatBtnText}>Hold to send 💓</Text>
          </Pressable>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ── Date picker modal ── */}
      <Modal visible={showDateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Set your reunion date 📅</Text>
            <Text style={styles.modalSub}>When are you next seeing {partner.name}?</Text>
            <View style={styles.datePresetList}>
              {DATE_PRESETS.map((p) => (
                <TouchableOpacity
                  key={p.label}
                  style={styles.datePresetRow}
                  onPress={() => {
                    setReunionDate(p.getDate());
                    setShowDateModal(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.datePresetLabel}>{p.label}</Text>
                  <Text style={styles.datePresetValue}>{format(p.getDate(), 'MMM d, yyyy')}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowDateModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Photo options modal ── */}
      <Modal visible={showPhotoOptions} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Send a photo 📸</Text>
            <Text style={styles.modalSub}>It'll appear on {partner.name}'s home screen</Text>
            <TouchableOpacity style={styles.photoOption} onPress={handleTakePhoto} activeOpacity={0.8}>
              <Text style={styles.photoOptionEmoji}>📷</Text>
              <Text style={styles.photoOptionText}>Take a photo now</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoOption} onPress={handlePickPhoto} activeOpacity={0.8}>
              <Text style={styles.photoOptionEmoji}>🖼️</Text>
              <Text style={styles.photoOptionText}>Choose from library</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowPhotoOptions(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Drawing canvas modal ── */}
      <Modal visible={showDoodleModal} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white }}>
          <DrawingCanvas
            partnerName={partner.name}
            onSend={(paths) => {
              setHasDoodle(paths.length > 0);
              setShowDoodleModal(false);
            }}
            onClose={() => setShowDoodleModal(false)}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.cream },
  scroll: { flex: 1 },
  content: { paddingBottom: 32 },

  // ── Together mode ─────────────────────────────────────────────────────────
  togetherSafe: { flex: 1 },
  togetherContent: { flex: 1, paddingHorizontal: 28, paddingTop: 40, paddingBottom: 36, justifyContent: 'space-between' },
  togetherTop: { alignItems: 'center', gap: 10 },
  togetherBigEmoji: { fontSize: 80, marginBottom: 4 },
  togetherNames: { fontSize: 32, color: Colors.charcoal, fontFamily: FontFamily.bold, textAlign: 'center' },
  togetherTagline: { fontSize: FontSize.lg, color: Colors.textSecondary, fontFamily: FontFamily.regular },
  togetherDateBadge: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginTop: 4,
  },
  togetherDateText: { fontSize: FontSize.sm, color: Colors.charcoal, fontFamily: FontFamily.medium },
  togetherCards: { gap: 14 },
  togetherCard: {
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  togetherCardLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, fontFamily: FontFamily.medium },
  togetherEmojiRow: { flexDirection: 'row', gap: 14 },
  zeroMilesNumber: { fontSize: 52, color: Colors.charcoal, fontFamily: FontFamily.bold, lineHeight: 58 },
  zeroMilesLabel: { fontSize: FontSize.lg, color: Colors.charcoal, fontFamily: FontFamily.semibold },
  zeroMilesSub: { fontSize: FontSize.sm, color: Colors.textSecondary, fontFamily: FontFamily.regular },
  endTogetherBtn: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(44,44,44,0.15)',
  },
  endTogetherText: { fontSize: FontSize.base, color: Colors.charcoal, fontFamily: FontFamily.semibold },

  // ── Normal screen ─────────────────────────────────────────────────────────
  timeBanner: {
    backgroundColor: Colors.yellowPale,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.yellowLight,
  },
  timeBannerText: { fontSize: FontSize.sm, color: Colors.charcoal, fontFamily: FontFamily.regular },
  timeBold: { fontFamily: FontFamily.bold },
  dateBannerText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontFamily: FontFamily.regular },

  widgetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    padding: 20,
  },

  togetherBanner: { marginHorizontal: 20, marginBottom: 24, borderRadius: 22, overflow: 'hidden', ...Shadows.small },
  togetherBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    gap: 14,
  },
  togetherBannerEmoji: { fontSize: 30 },
  togetherBannerTitle: { fontSize: FontSize.base, color: Colors.charcoal, fontFamily: FontFamily.bold },
  togetherBannerSub: { fontSize: FontSize.sm, color: Colors.charcoal, fontFamily: FontFamily.regular, opacity: 0.7, marginTop: 2 },
  togetherBannerArrow: { fontSize: FontSize.lg, color: Colors.charcoal, opacity: 0.5 },

  section: { paddingHorizontal: 20, marginBottom: 28 },
  sectionTitle: { fontSize: FontSize.md, color: Colors.charcoal, fontFamily: FontFamily.bold, marginBottom: 14 },

  moodSentBadge: {
    backgroundColor: Colors.yellowPale,
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  moodSentText: { fontSize: FontSize.sm, color: Colors.charcoal, fontFamily: FontFamily.medium },
  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  moodBtn: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  moodBtnActive: { backgroundColor: Colors.yellowPale, borderColor: Colors.yellow },
  moodEmoji: { fontSize: 18 },
  moodLabel: { fontSize: FontSize.sm, color: Colors.charcoal, fontFamily: FontFamily.medium },

  quickActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  quickAction: { alignItems: 'center', flex: 1 },
  quickActionIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    ...Shadows.small,
  },
  quickActionEmoji: { fontSize: 28 },
  quickActionLabel: { fontSize: FontSize.sm, color: Colors.charcoal, fontFamily: FontFamily.medium },

  heartbeatCard: {
    marginHorizontal: 20,
    backgroundColor: '#FFF0EC',
    borderRadius: 24,
    padding: 20,
    gap: 16,
    borderWidth: 1.5,
    borderColor: Colors.coralLight,
  },
  heartbeatRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  heartbeatEmoji: { fontSize: 38 },
  heartbeatTitle: { fontSize: FontSize.base, color: Colors.charcoal, fontFamily: FontFamily.semibold },
  heartbeatSub: { fontSize: FontSize.sm, color: Colors.textSecondary, fontFamily: FontFamily.regular, marginTop: 2 },
  heartbeatBtn: {
    backgroundColor: Colors.coral,
    borderRadius: 100,
    paddingVertical: 14,
    alignItems: 'center',
    ...Shadows.small,
  },
  heartbeatBtnText: { fontSize: FontSize.base, color: Colors.white, fontFamily: FontFamily.semibold },

  // ── Modals ────────────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: FontSize.xl, color: Colors.charcoal, fontFamily: FontFamily.bold, marginBottom: 6 },
  modalSub: { fontSize: FontSize.sm, color: Colors.textSecondary, fontFamily: FontFamily.regular, marginBottom: 24 },

  datePresetList: { gap: 10, marginBottom: 16 },
  datePresetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.creamDark,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  datePresetLabel: { fontSize: FontSize.base, color: Colors.charcoal, fontFamily: FontFamily.semibold },
  datePresetValue: { fontSize: FontSize.sm, color: Colors.textSecondary, fontFamily: FontFamily.regular },

  photoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: Colors.creamDark,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  photoOptionEmoji: { fontSize: 28 },
  photoOptionText: { fontSize: FontSize.base, color: Colors.charcoal, fontFamily: FontFamily.semibold },

  modalCancelBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginTop: 4,
  },
  modalCancelText: { fontSize: FontSize.base, color: Colors.textSecondary, fontFamily: FontFamily.medium },
});
