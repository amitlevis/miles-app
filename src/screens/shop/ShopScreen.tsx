import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Shadows } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { useCoupleStore } from '../../store/coupleStore';

const PLANS = [
  {
    key: 'free',
    name: 'Miles Basic',
    price: 'Free',
    emoji: '🌱',
    desc: 'Everything you need to get started',
    features: [
      { icon: '🧩', text: '1 home screen widget' },
      { icon: '💬', text: 'In-app messaging' },
      { icon: '🎮', text: '5 games to play together' },
      { icon: '💭', text: 'Emotion Pulse (send vibes)' },
    ],
    bg: Colors.creamDark,
    textColor: Colors.charcoal,
    borderColor: Colors.border,
  },
  {
    key: 'premium',
    name: 'Miles Premium',
    price: '$4.99',
    period: '/month',
    priceYear: '$39.99/year  (save 33%)',
    emoji: '⭐',
    desc: 'The full Miles experience — everything you need',
    features: [
      { icon: '🧩', text: 'All 4 widgets (distance, countdown, photo, doodle)' },
      { icon: '🎬', text: 'Watch movies & listen to music in sync' },
      { icon: '🎮', text: 'All 7 games unlocked' },
      { icon: '📅', text: 'Miles Date Planner with personalized ideas' },
      { icon: '😴', text: 'Sleep Together Mode — fall asleep "together"' },
      { icon: '🫙', text: 'Memory Jar — unlimited surprise messages' },
      { icon: '📔', text: "Couple's Journal — daily shared writing prompts" },
      { icon: '🗓️', text: 'Shared calendar with time zone intelligence' },
    ],
    bg: Colors.yellow,
    textColor: Colors.charcoal,
    borderColor: Colors.yellow,
    recommended: true,
  },
  {
    key: 'duo',
    name: 'Miles Duo',
    price: '$7.99',
    period: '/month',
    priceNote: '1 subscription covers both of you',
    emoji: '💑',
    desc: 'Everything in Premium, shared — one price for both partners',
    features: [
      { icon: '⭐', text: 'Everything in Premium' },
      { icon: '✈️', text: 'Miles Passport — track every reunion, earn badges' },
      { icon: '⏳', text: 'Time Capsule — seal messages to open later' },
      { icon: '🔥', text: 'Habit Streaks — build rituals together' },
      { icon: '🌸', text: 'Exclusive seasonal widget themes' },
      { icon: '💬', text: 'Priority support (real humans)' },
    ],
    bg: Colors.lavenderDark,
    textColor: Colors.white,
    borderColor: Colors.lavenderDark,
  },
];

const VIRTUAL_GIFTS = [
  {
    emoji: '💐',
    name: 'Flower Bouquet',
    price: '$0.99',
    desc: 'An animated bouquet blooms across their screen with your name.',
  },
  {
    emoji: '💌',
    name: 'Sealed Love Letter',
    price: '$0.99',
    desc: 'A digital letter with an animated wax seal — they tap to open it.',
  },
  {
    emoji: '✨',
    name: 'Sparkle Shower',
    price: '$1.99',
    desc: 'Gold confetti and sparkles fill their screen for 10 seconds.',
  },
  {
    emoji: '🎊',
    name: 'Anniversary Kit',
    price: '$4.99',
    desc: 'Balloons, confetti, a custom message card, and a digital toast — all animated.',
  },
  {
    emoji: '🌙',
    name: 'Good Night Pack',
    price: '$1.99',
    desc: 'A gentle starfield animation plays on their lock screen before they sleep.',
  },
  {
    emoji: '☀️',
    name: 'Good Morning Beam',
    price: '$0.99',
    desc: 'A warm sunrise animation lights up their screen with a personal note.',
  },
];

const REAL_GIFTS = [
  { emoji: '🌹', name: 'Flower Delivery', desc: 'Fresh flowers delivered to their door', price: 'From $35', partner: 'Teleflora' },
  { emoji: '🍫', name: 'Artisan Chocolate', desc: 'Premium chocolate box sent anywhere', price: 'From $25', partner: 'Goldbelly' },
  { emoji: '📮', name: 'Printed Postcard', desc: 'Your photo printed & mailed to them', price: '$2.99', partner: 'Miles Print' },
  { emoji: '🎁', name: 'Curated Gift Box', desc: 'Handpicked items delivered as a surprise', price: 'From $49', partner: 'Uncommon Goods' },
  { emoji: '✈️', name: 'Plan a Visit', desc: 'Search flights — start closing the distance', price: 'Best fares', partner: 'Skyscanner' },
];

export function ShopScreen() {
  const navigation = useNavigation();
  const { partner } = useCoupleStore();
  const [currentPlan, setCurrentPlan] = useState('free');
  const [activeTab, setActiveTab] = useState<'plans' | 'gifts' | 'real'>('plans');

  const handleGetPlan = (planKey: string) => {
    setCurrentPlan(planKey);
    Alert.alert(
      '✅ Plan selected',
      'In the final app this connects to the App Store subscription flow. For now your plan is saved locally.',
      [{ text: 'Got it', style: 'default' }]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Miles Shop</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Tabs */}
        <View style={styles.tabs}>
          {(['plans', 'gifts', 'real'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tab, activeTab === t && styles.tabActive]}
              onPress={() => setActiveTab(t)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>
                {t === 'plans' ? '⭐ Plans' : t === 'gifts' ? '🎁 Virtual' : '📦 Real Gifts'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Plans ── */}
        {activeTab === 'plans' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose your plan</Text>
            <Text style={styles.sectionSub}>Upgrade anytime. Cancel anytime.</Text>
            {PLANS.map((plan) => {
              const isActive = currentPlan === plan.key;
              return (
                <View
                  key={plan.key}
                  style={[
                    styles.planCard,
                    { backgroundColor: plan.bg, borderColor: plan.borderColor },
                    isActive && styles.planCardSelected,
                    Shadows.small,
                  ]}
                >
                  {plan.recommended && (
                    <View style={styles.recommendedBadge}>
                      <Text style={styles.recommendedText}>⭐ Most popular</Text>
                    </View>
                  )}
                  <View style={styles.planTopRow}>
                    <View>
                      <Text style={[styles.planEmoji]}>{plan.emoji}</Text>
                      <Text style={[styles.planName, { color: plan.textColor }]}>{plan.name}</Text>
                      <Text style={[styles.planDesc, { color: plan.textColor, opacity: 0.7 }]}>{plan.desc}</Text>
                    </View>
                    <View style={styles.planPriceBlock}>
                      <Text style={[styles.planPrice, { color: plan.textColor }]}>{plan.price}</Text>
                      {plan.period && (
                        <Text style={[styles.planPeriod, { color: plan.textColor, opacity: 0.65 }]}>{plan.period}</Text>
                      )}
                      {plan.priceYear && (
                        <Text style={[styles.planPriceAlt, { color: plan.textColor, opacity: 0.55 }]}>{plan.priceYear}</Text>
                      )}
                      {plan.priceNote && (
                        <Text style={[styles.planPriceAlt, { color: plan.textColor, opacity: 0.55 }]}>{plan.priceNote}</Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.planFeatures}>
                    {plan.features.map((f) => (
                      <View key={f.text} style={styles.featureRow}>
                        <Text style={styles.featureIcon}>{f.icon}</Text>
                        <Text style={[styles.featureText, { color: plan.textColor }]}>{f.text}</Text>
                      </View>
                    ))}
                  </View>

                  {isActive ? (
                    <View style={[styles.currentBadge, { borderColor: plan.textColor + '40' }]}>
                      <Text style={[styles.currentBadgeText, { color: plan.textColor }]}>✓ Your current plan</Text>
                    </View>
                  ) : plan.key !== 'free' ? (
                    <TouchableOpacity
                      style={[styles.getBtn, { borderColor: plan.textColor }]}
                      onPress={() => handleGetPlan(plan.key)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.getBtnText, { color: plan.textColor }]}>Get {plan.name} →</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.getBtn, { borderColor: plan.textColor }]}
                      onPress={() => setCurrentPlan('free')}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.getBtnText, { color: plan.textColor }]}>Switch to Basic</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}

            {/* Miles Coach add-on */}
            <View style={[styles.coachCard, Shadows.small]}>
              <Text style={styles.coachEmoji}>🤝</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.coachTitle}>Miles Relationship Coach</Text>
                <Text style={styles.coachSub}>
                  Add-on · $2.99/month{'\n'}
                  Conversation starters, conflict support, and personalized advice — built for LDR couples.
                </Text>
              </View>
              <TouchableOpacity style={styles.coachBtn} onPress={() => Alert.alert('Miles Coach', 'Coming soon in the next update!')}>
                <Text style={styles.coachBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Virtual Gifts ── */}
        {activeTab === 'gifts' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Virtual gifts for {partner?.name ?? 'them'}</Text>
            <Text style={styles.sectionSub}>
              Sent instantly — triggers a full-screen animation on their phone with your message.
            </Text>
            <View style={styles.giftGrid}>
              {VIRTUAL_GIFTS.map((g) => (
                <TouchableOpacity
                  key={g.name}
                  style={[styles.giftCard, Shadows.small]}
                  activeOpacity={0.85}
                  onPress={() =>
                    Alert.alert(
                      `Send ${g.name}?`,
                      `${g.desc}\n\nCost: ${g.price}`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: `Send for ${g.price}`, onPress: () => Alert.alert('💝 Sent!', `${partner?.name ?? 'Them'} just got your ${g.name}!`) },
                      ]
                    )
                  }
                >
                  <Text style={styles.giftEmoji}>{g.emoji}</Text>
                  <Text style={styles.giftName}>{g.name}</Text>
                  <Text style={styles.giftDesc}>{g.desc}</Text>
                  <View style={styles.giftFooter}>
                    <Text style={styles.giftPrice}>{g.price}</Text>
                    <View style={styles.giftBtn}>
                      <Text style={styles.giftBtnText}>Send</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── Real Gifts ── */}
        {activeTab === 'real' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Real-world gifts</Text>
            <Text style={styles.sectionSub}>
              Delivered to {partner?.name ?? 'them'} — wherever they are in the world.
            </Text>
            <View style={[styles.comingSoonBanner, Shadows.small]}>
              <Text style={styles.comingSoonEmoji}>🚧</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.comingSoonTitle}>Coming in v1.1</Text>
                <Text style={styles.comingSoonSub}>Real-world delivery integrations are in progress. Browse what's coming below.</Text>
              </View>
            </View>
            <View style={styles.realList}>
              {REAL_GIFTS.map((g) => (
                <View key={g.name} style={[styles.realCard, Shadows.small]}>
                  <Text style={styles.realEmoji}>{g.emoji}</Text>
                  <View style={styles.realInfo}>
                    <Text style={styles.realName}>{g.name}</Text>
                    <Text style={styles.realDesc}>{g.desc}</Text>
                    <Text style={styles.realPartner}>via {g.partner}</Text>
                  </View>
                  <View style={styles.realRight}>
                    <Text style={styles.realPrice}>{g.price}</Text>
                    <View style={styles.comingSoonPill}>
                      <Text style={styles.comingSoonPillText}>Soon</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.cream },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  backText: { fontSize: FontSize.xl, color: Colors.charcoal },
  title: { flex: 1, fontSize: FontSize.md, color: Colors.charcoal, fontFamily: FontFamily.bold, textAlign: 'center' },
  content: { paddingBottom: 40 },

  tabs: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 16, gap: 8 },
  tab: {
    flex: 1, paddingVertical: 10, borderRadius: 100,
    backgroundColor: Colors.white, alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.border,
  },
  tabActive: { backgroundColor: Colors.yellow, borderColor: Colors.yellow },
  tabText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontFamily: FontFamily.medium },
  tabTextActive: { color: Colors.charcoal, fontFamily: FontFamily.bold },

  section: { paddingHorizontal: 20, gap: 14 },
  sectionTitle: { fontSize: FontSize.lg, color: Colors.charcoal, fontFamily: FontFamily.bold },
  sectionSub: { fontSize: FontSize.sm, color: Colors.textSecondary, fontFamily: FontFamily.regular, marginTop: -6 },

  planCard: {
    borderRadius: 24,
    padding: 22,
    borderWidth: 2,
    position: 'relative',
    gap: 16,
  },
  planCardSelected: { borderWidth: 2.5, borderColor: Colors.coral },
  recommendedBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    backgroundColor: Colors.coral,
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  recommendedText: { fontSize: FontSize.xs, color: Colors.white, fontFamily: FontFamily.bold },
  planTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 8 },
  planEmoji: { fontSize: 28, marginBottom: 6 },
  planName: { fontSize: FontSize.lg, fontFamily: FontFamily.bold },
  planDesc: { fontSize: FontSize.sm, fontFamily: FontFamily.regular, marginTop: 2, maxWidth: 180 },
  planPriceBlock: { alignItems: 'flex-end' },
  planPrice: { fontSize: 28, fontFamily: FontFamily.bold },
  planPeriod: { fontSize: FontSize.sm, fontFamily: FontFamily.regular, textAlign: 'right' },
  planPriceAlt: { fontSize: FontSize.xs, fontFamily: FontFamily.regular, textAlign: 'right', marginTop: 2 },
  planFeatures: { gap: 10 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  featureIcon: { fontSize: 16, marginTop: 1 },
  featureText: { fontSize: FontSize.sm, fontFamily: FontFamily.regular, flex: 1, lineHeight: 20 },
  currentBadge: {
    borderWidth: 1.5,
    borderRadius: 100,
    paddingVertical: 12,
    alignItems: 'center',
  },
  currentBadgeText: { fontSize: FontSize.sm, fontFamily: FontFamily.semibold },
  getBtn: {
    borderWidth: 2,
    borderRadius: 100,
    paddingVertical: 14,
    alignItems: 'center',
  },
  getBtnText: { fontSize: FontSize.base, fontFamily: FontFamily.bold },

  coachCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.lavender,
  },
  coachEmoji: { fontSize: 32 },
  coachTitle: { fontSize: FontSize.base, color: Colors.charcoal, fontFamily: FontFamily.bold },
  coachSub: { fontSize: FontSize.xs, color: Colors.textSecondary, fontFamily: FontFamily.regular, marginTop: 4, lineHeight: 18 },
  coachBtn: {
    backgroundColor: Colors.lavender,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  coachBtnText: { fontSize: FontSize.sm, color: Colors.charcoal, fontFamily: FontFamily.semibold },

  giftGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  giftCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    width: '47%',
    gap: 8,
  },
  giftEmoji: { fontSize: 38 },
  giftName: { fontSize: FontSize.sm, color: Colors.charcoal, fontFamily: FontFamily.bold },
  giftDesc: { fontSize: FontSize.xs, color: Colors.textSecondary, fontFamily: FontFamily.regular, lineHeight: 16, flex: 1 },
  giftFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  giftPrice: { fontSize: FontSize.sm, color: Colors.textSecondary, fontFamily: FontFamily.semibold },
  giftBtn: {
    backgroundColor: Colors.yellow,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  giftBtnText: { fontSize: FontSize.xs, color: Colors.charcoal, fontFamily: FontFamily.bold },

  comingSoonBanner: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  comingSoonEmoji: { fontSize: 28 },
  comingSoonTitle: { fontSize: FontSize.base, color: Colors.charcoal, fontFamily: FontFamily.bold },
  comingSoonSub: { fontSize: FontSize.xs, color: Colors.textSecondary, fontFamily: FontFamily.regular, marginTop: 2, lineHeight: 17 },

  realList: { gap: 12 },
  realCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    opacity: 0.75,
  },
  realEmoji: { fontSize: 34 },
  realInfo: { flex: 1 },
  realName: { fontSize: FontSize.base, color: Colors.charcoal, fontFamily: FontFamily.bold },
  realDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, fontFamily: FontFamily.regular, marginTop: 2 },
  realPartner: { fontSize: FontSize.xs, color: Colors.textMuted, fontFamily: FontFamily.regular, marginTop: 4 },
  realRight: { alignItems: 'flex-end', gap: 8 },
  realPrice: { fontSize: FontSize.sm, color: Colors.charcoal, fontFamily: FontFamily.semibold },
  comingSoonPill: {
    backgroundColor: Colors.creamDark,
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  comingSoonPillText: { fontSize: FontSize.xs, color: Colors.textMuted, fontFamily: FontFamily.medium },
});
