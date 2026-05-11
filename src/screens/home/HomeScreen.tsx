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
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { addWeeks, addMonths, format } from 'date-fns';
import { Colors, Shadows } from '../../constants/colors';
import { FontFamily, FontSize, FontWeight } from '../../constants/typography';
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
import { animateThemeTransition } from '../../theme/ThemeContext';
import { sendMood as sendMoodRemote } from '../../services/moods';
import { sendHeartbeat } from '../../services/heartbeats';
import {
  pickOrCapturePhoto,
  uploadAndSharePhoto,
  fetchLatestPhotoFromPartner,
} from '../../services/photos';
import { setTogetherStateRemote } from '../../services/togetherState';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

const MOODS = [
  { emoji: '💭', label: 'Missing you', color: Colors.lavender },
  { emoji: '☀️', label: 'Good morning', color: Colors.yellow },
  { emoji: '🌙', label: 'Good night', color: '#4A6FA5' },
  { emoji: '🤗', label: 'Need a hug', color: Colors.coral },
  { emoji: '😊', label: 'Happy', color: Colors.success },
  { emoji: '💪', label: 'Thinking of you', color: Colors.yellowDeep },
];

const RING_SIZE = 220;
const RING_CENTER = RING_SIZE / 2;
const RING_RADIUS = 78;

const QUICK_ACTIONS = [
  { emoji: '🎬', label: 'Watch', route: 'WatchTogether' as const, color: '#FF7A5C' },
  { emoji: '🎵', label: 'Listen', route: 'ListenTogether' as const, color: Colors.lavenderDark },
  { emoji: '🎮', label: 'Games', route: 'Games' as const, color: '#4A9ABF' },
  { emoji: '🎁', label: 'Gift', route: 'Shop' as const, color: Colors.yellow },
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
  const { user, partner, coupleId, reunionDate, togetherMode, distanceMiles, setTogetherMode, setReunionDate } =
    useCoupleStore();

  const [partnerTime, setPartnerTime] = useState('');
  const [partnerDate, setPartnerDate] = useState('');
  const [moodSent, setMoodSent] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<(typeof MOODS)[0] | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [hasDoodle, setHasDoodle] = useState(false);
  const [togetherSince] = useState(() => new Date());

  const [showDateModal, setShowDateModal] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [showDoodleModal, setShowDoodleModal] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const moodGlow = useRef(new Animated.Value(0)).current;
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
    setSelectedMood(mood);
    setMoodSent(mood.label);
    moodGlow.setValue(0);
    Animated.timing(moodGlow, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    setTimeout(() => setMoodSent(null), 3000);

    // Fire-and-forget remote send (the UI already optimistically updated).
    if (coupleId && user?.id) {
      sendMoodRemote({
        coupleId,
        senderId: user.id,
        mood: mood.label,
        emoji: mood.emoji,
      }).catch((err) => console.warn('[mood] send failed:', err.message));
    }
  };

  const startHeartbeat = async () => {
    heartbeatLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.4, duration: 180, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 280, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.22, duration: 160, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 300, useNativeDriver: true }),
      ])
    );
    heartbeatLoop.current.start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // First pulse goes to the partner immediately
    if (coupleId && user?.id) {
      sendHeartbeat({ coupleId, senderId: user.id }).catch(() => {});
    }

    hapticTimer.current = setInterval(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 200);
      // Subsequent pulses (rate-limited inside sendHeartbeat)
      if (coupleId && user?.id) {
        sendHeartbeat({ coupleId, senderId: user.id }).catch(() => {});
      }
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

  const sharePhoto = async (useCamera: boolean) => {
    setShowPhotoOptions(false);
    const localUri = await pickOrCapturePhoto(useCamera);
    if (!localUri) return;
    // Show the local photo immediately so the user gets instant feedback.
    setPhotoUri(localUri);
    if (!coupleId || !user?.id) return;
    try {
      const { displayUrl } = await uploadAndSharePhoto({
        coupleId,
        senderId: user.id,
        localUri,
        tag: 'good_morning',
      });
      // Replace the local URI with the signed URL once upload completes.
      setPhotoUri(displayUrl);
    } catch (err: any) {
      console.warn('[photo] upload failed:', err.message);
    }
  };

  const handlePickPhoto = () => sharePhoto(false);
  const handleTakePhoto = () => sharePhoto(true);

  // On mount, fetch the latest photo from the partner so it appears on launch.
  useEffect(() => {
    if (!coupleId || !user?.id) return;
    fetchLatestPhotoFromPartner({ coupleId, selfId: user.id })
      .then((result) => {
        if (result) setPhotoUri(result.displayUrl);
      })
      .catch((err) => console.warn('[photo] fetch latest failed:', err.message));
  }, [coupleId, user?.id]);

  if (!user || !partner) return null;

  // ── Together mode ──────────────────────────────────────────────────────────
  if (togetherMode) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.obsidian }}>
        <LinearGradient
          colors={['#1A0F08', '#2D1810', '#1A0F08']}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        {/* Warm glow */}
        <View style={styles.togetherGlow} pointerEvents="none" />

        <SafeAreaView style={styles.togetherSafe}>
          <View style={styles.togetherContent}>
            <View style={styles.togetherTop}>
              <Text style={styles.togetherNames}>
                {user.name}{'\n'}& {partner.name}
              </Text>
              <View style={styles.zeroMilesRow}>
                <Text style={styles.zeroNumber}>0</Text>
                <Text style={styles.zeroUnit}>miles apart</Text>
              </View>
              <Text style={styles.togetherTagline}>The distance is zero ♥</Text>
              <View style={styles.togetherDateChip}>
                <Text style={styles.togetherDateText}>Since {format(togetherSince, 'MMMM d')}</Text>
              </View>
            </View>

            <View style={styles.togetherCard}>
              <Text style={styles.togetherCardLabel}>How are you feeling?</Text>
              <View style={styles.togetherEmojiRow}>
                {['😍', '🥰', '😊', '💃', '🎉', '☺️'].map((e) => (
                  <TouchableOpacity
                    key={e}
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.togetherEmoji}>{e}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.endTogetherBtn}
              onPress={() => {
                animateThemeTransition();
                setTogetherMode(false);
                if (coupleId && user?.id) {
                  setTogetherStateRemote({
                    coupleId,
                    selfId: user.id,
                    active: false,
                  }).catch((err) =>
                    console.warn('[together] sync failed:', err.message)
                  );
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.endTogetherText}>We're apart again</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ── Normal home screen ─────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <PartnerHeader />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Partner time strip */}
        <View style={styles.timeBanner}>
          <LinearGradient
            colors={[Colors.dark, Colors.darkCard]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.timeBannerInner}
          >
            <View>
              <Text style={styles.timeBannerLabel}>{partner.name}'s time</Text>
              <Text style={styles.timeBannerTime}>{partnerTime}</Text>
            </View>
            <View style={styles.timeBannerRight}>
              <Text style={styles.timeBannerDate}>{partnerDate}</Text>
              <View style={styles.onlineDot} />
            </View>
          </LinearGradient>
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

        {/* Together banner */}
        <TouchableOpacity
          style={styles.togetherBannerWrap}
          onPress={() => {
            animateThemeTransition();
            setTogetherMode(true);
            if (coupleId && user?.id) {
              setTogetherStateRemote({
                coupleId,
                selfId: user.id,
                active: true,
              }).catch((err) => console.warn('[together] sync failed:', err.message));
            }
          }}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#2D1F10', '#1F1510']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.togetherBanner}
          >
            <Text style={styles.togetherBannerEmoji}>🫶</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.togetherBannerTitle}>We're physically together</Text>
              <Text style={styles.togetherBannerSub}>Tap to enter together mode</Text>
            </View>
            <Text style={styles.togetherBannerArrow}>→</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Mood ring */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Send a vibe</Text>
            {moodSent && (
              <Animated.Text style={[styles.moodSentBadge, { opacity: moodGlow }]}>
                sent to {partner.name} ♥
              </Animated.Text>
            )}
          </View>

          <View style={styles.moodRingContainer}>
            {/* Center orb */}
            <View style={styles.moodCenterOrb}>
              <Text style={styles.moodCenterEmoji}>
                {selectedMood ? selectedMood.emoji : '♥'}
              </Text>
            </View>

            {/* Mood buttons in circle */}
            {MOODS.map((mood, i) => {
              const angle = (i / MOODS.length) * 2 * Math.PI - Math.PI / 2;
              const x = RING_CENTER + Math.cos(angle) * RING_RADIUS - 28;
              const y = RING_CENTER + Math.sin(angle) * RING_RADIUS - 28;
              const isActive = selectedMood?.label === mood.label;
              return (
                <TouchableOpacity
                  key={mood.label}
                  style={[
                    styles.moodOrbBtn,
                    { left: x, top: y },
                    isActive && { borderColor: mood.color, backgroundColor: `${mood.color}18` },
                  ]}
                  onPress={() => sendMood(mood)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.moodOrbEmoji}>{mood.emoji}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.moodHint}>Tap an emoji to send your vibe</Text>
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
                <View style={[styles.quickActionCard, { borderColor: `${a.color}30` }]}>
                  <Text style={styles.quickActionEmoji}>{a.emoji}</Text>
                </View>
                <Text style={styles.quickActionLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Heartbeat */}
        <View style={styles.heartbeatCard}>
          <LinearGradient
            colors={['#2A100A', '#1F0C08']}
            style={styles.heartbeatGradient}
          >
            <View style={styles.heartbeatRow}>
              <Animated.Text
                style={[styles.heartbeatGlyph, { transform: [{ scale: pulseAnim }] }]}
              >
                💓
              </Animated.Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.heartbeatTitle}>Send your heartbeat</Text>
                <Text style={styles.heartbeatSub}>
                  {partner.name} feels it as a vibration
                </Text>
              </View>
            </View>
            <Pressable
              style={styles.heartbeatBtn}
              onPressIn={startHeartbeat}
              onPressOut={stopHeartbeat}
            >
              <Text style={styles.heartbeatBtnText}>Hold to send 💓</Text>
            </Pressable>
          </LinearGradient>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Date picker modal */}
      <Modal visible={showDateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Set reunion date</Text>
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
                  <Text style={styles.datePresetValue}>
                    {format(p.getDate(), 'MMM d, yyyy')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setShowDateModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Photo options modal */}
      <Modal visible={showPhotoOptions} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Send a photo</Text>
            <Text style={styles.modalSub}>It'll appear on {partner.name}'s home screen</Text>
            <TouchableOpacity
              style={styles.photoOption}
              onPress={handleTakePhoto}
              activeOpacity={0.8}
            >
              <Text style={styles.photoOptionEmoji}>📷</Text>
              <Text style={styles.photoOptionText}>Take a photo now</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.photoOption}
              onPress={handlePickPhoto}
              activeOpacity={0.8}
            >
              <Text style={styles.photoOptionEmoji}>🖼️</Text>
              <Text style={styles.photoOptionText}>Choose from library</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setShowPhotoOptions(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Drawing modal */}
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

  // ── Together mode ──────────────────────────────────────────────────────────
  togetherGlow: {
    position: 'absolute',
    top: -100,
    left: -50,
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: 'rgba(255,184,48,0.06)',
  },
  togetherSafe: { flex: 1 },
  togetherContent: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 52,
    paddingBottom: 44,
    justifyContent: 'space-between',
  },
  togetherTop: { alignItems: 'center', gap: 16 },
  togetherNames: {
    fontSize: FontSize['3xl'],
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.black,
    textAlign: 'center',
    lineHeight: FontSize['3xl'] * 1.2,
    letterSpacing: -1,
  },
  zeroMilesRow: { alignItems: 'center', gap: 4 },
  zeroNumber: {
    fontSize: FontSize['5xl'],
    color: Colors.yellow,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.black,
    letterSpacing: -4,
    lineHeight: FontSize['5xl'] * 1.0,
  },
  zeroUnit: {
    fontSize: FontSize.lg,
    color: 'rgba(255,255,255,0.55)',
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
  },
  togetherTagline: {
    fontSize: FontSize.md,
    color: 'rgba(255,255,255,0.4)',
    fontFamily: FontFamily.regular,
  },
  togetherDateChip: {
    backgroundColor: 'rgba(255,184,48,0.12)',
    borderRadius: 100,
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(255,184,48,0.22)',
  },
  togetherDateText: {
    fontSize: FontSize.sm,
    color: Colors.yellow,
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
  },
  togetherCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  togetherCardLabel: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.45)',
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
  },
  togetherEmojiRow: { flexDirection: 'row', gap: 16 },
  togetherEmoji: { fontSize: 32 },
  endTogetherBtn: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 100,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  endTogetherText: {
    fontSize: FontSize.base,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: FontFamily.semibold,
    fontWeight: FontWeight.semibold,
  },

  // ── Normal screen ──────────────────────────────────────────────────────────
  timeBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 8,
  },
  timeBannerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  timeBannerLabel: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.38)',
    fontFamily: FontFamily.regular,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  timeBannerTime: {
    fontSize: FontSize.xl,
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5,
  },
  timeBannerRight: { alignItems: 'flex-end', gap: 6 },
  timeBannerDate: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.42)',
    fontFamily: FontFamily.regular,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },

  widgetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },

  togetherBannerWrap: {
    marginHorizontal: 16,
    marginBottom: 28,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,184,48,0.14)',
    shadowColor: Colors.yellow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 5,
  },
  togetherBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    gap: 14,
  },
  togetherBannerEmoji: { fontSize: 28 },
  togetherBannerTitle: {
    fontSize: FontSize.base,
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },
  togetherBannerSub: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.42)',
    fontFamily: FontFamily.regular,
    marginTop: 2,
  },
  togetherBannerArrow: {
    fontSize: FontSize.lg,
    color: 'rgba(255,184,48,0.5)',
  },

  section: { paddingHorizontal: 16, marginBottom: 32 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: FontSize.base,
    color: Colors.charcoal,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  moodSentBadge: {
    fontSize: FontSize.xs,
    color: Colors.coral,
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
  },

  // Mood ring
  moodRingContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignSelf: 'center',
    position: 'relative',
  },
  moodCenterOrb: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.dark,
    borderWidth: 1.5,
    borderColor: 'rgba(255,184,48,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    left: RING_CENTER - 30,
    top: RING_CENTER - 30,
    shadowColor: Colors.yellow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  moodCenterEmoji: { fontSize: 26 },
  moodOrbBtn: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2C2C2C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  moodOrbEmoji: { fontSize: 24 },
  moodHint: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontFamily: FontFamily.regular,
    textAlign: 'center',
    marginTop: 8,
  },

  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  quickAction: { alignItems: 'center', flex: 1 },
  quickActionCard: {
    width: (width - 32 - 30) / 4,
    height: (width - 32 - 30) / 4,
    borderRadius: 22,
    backgroundColor: Colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 8,
  },
  quickActionEmoji: { fontSize: 26 },
  quickActionLabel: {
    fontSize: FontSize.xs,
    color: Colors.charcoal,
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
  },

  heartbeatCard: {
    marginHorizontal: 16,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,122,92,0.2)',
    shadowColor: Colors.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  heartbeatGradient: { padding: 22, gap: 16 },
  heartbeatRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  heartbeatGlyph: { fontSize: 44 },
  heartbeatTitle: {
    fontSize: FontSize.base,
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },
  heartbeatSub: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.45)',
    fontFamily: FontFamily.regular,
    marginTop: 2,
  },
  heartbeatBtn: {
    backgroundColor: Colors.coral,
    borderRadius: 100,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: Colors.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
  heartbeatBtnText: {
    fontSize: FontSize.base,
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },

  // ── Modals ─────────────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.cream,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 24,
    paddingBottom: 44,
    paddingTop: 14,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 22,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    color: Colors.charcoal,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  modalSub: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
    marginBottom: 24,
    lineHeight: 20,
  },
  datePresetList: { gap: 10, marginBottom: 16 },
  datePresetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  datePresetLabel: {
    fontSize: FontSize.base,
    color: Colors.charcoal,
    fontFamily: FontFamily.semibold,
    fontWeight: FontWeight.semibold,
  },
  datePresetValue: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
  },
  photoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  photoOptionEmoji: { fontSize: 26 },
  photoOptionText: {
    fontSize: FontSize.base,
    color: Colors.charcoal,
    fontFamily: FontFamily.semibold,
    fontWeight: FontWeight.semibold,
  },
  modalCancelBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginTop: 4,
    backgroundColor: Colors.white,
  },
  modalCancelText: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
  },
});
