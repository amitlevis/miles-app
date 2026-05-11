import React, { useState, useEffect } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize, FontWeight } from '../../constants/typography';
import { useCoupleStore } from '../../store/coupleStore';
import { useEntitlements, useEntitlementsStore } from '../../store/entitlementsStore';
import {
  fetchOffering,
  purchasePackage,
  isConfigured,
} from '../../services/purchases';
import type { PurchasesPackage } from 'react-native-purchases';

type PlanKey = 'free' | 'premium' | 'duo';

const PLANS: Array<{
  key: PlanKey;
  icon: string;
  name: string;
  price: string;
  period?: string;
  priceNote?: string;
  desc: string;
  features: { icon: string; text: string }[];
  isPremium?: boolean;
  isDark?: boolean;
}> = [
  {
    key: 'free',
    icon: '🌱',
    name: 'Miles Basic',
    price: 'Free',
    desc: 'Everything you need to start.',
    features: [
      { icon: '🧩', text: '1 home screen widget' },
      { icon: '💬', text: 'In-app messaging' },
      { icon: '🎮', text: '5 games to play together' },
      { icon: '💭', text: 'Emotion Pulse — send vibes' },
    ],
  },
  {
    key: 'premium',
    icon: '⭐',
    name: 'Miles Premium',
    price: '$4.99',
    period: '/month',
    priceNote: '$39.99/year (save 33%)',
    desc: 'The full Miles experience.',
    isPremium: true,
    features: [
      { icon: '🧩', text: 'All 4 widgets (distance, countdown, photo, doodle)' },
      { icon: '🎬', text: 'Watch & listen in sync' },
      { icon: '🎮', text: 'All 7 games unlocked' },
      { icon: '✨', text: 'AI Date Planner with personalized ideas' },
      { icon: '😴', text: 'Sleep Together Mode' },
      { icon: '🫙', text: 'Memory Jar — unlimited notes' },
      { icon: '📔', text: "Couple's Journal — daily prompts" },
      { icon: '🗓️', text: 'Shared calendar with time-zone smarts' },
    ],
  },
  {
    key: 'duo',
    icon: '💑',
    name: 'Miles Duo',
    price: '$7.99',
    period: '/month',
    priceNote: 'Covers both partners',
    desc: 'Everything in Premium, shared.',
    isDark: true,
    features: [
      { icon: '⭐', text: 'Everything in Premium' },
      { icon: '✈️', text: 'Miles Passport — track reunions, earn badges' },
      { icon: '⏳', text: 'Time Capsule — seal messages for later' },
      { icon: '🔥', text: 'Habit Streaks — build rituals' },
      { icon: '🌸', text: 'Exclusive seasonal widget themes' },
      { icon: '💬', text: 'Priority support (real humans)' },
    ],
  },
];

const VIRTUAL_GIFTS = [
  {
    icon: '💐',
    name: 'Flower Bouquet',
    price: '$0.99',
    desc: 'An animated bouquet blooms across their screen.',
  },
  {
    icon: '💌',
    name: 'Sealed Love Letter',
    price: '$0.99',
    desc: 'A digital letter with an animated wax seal.',
  },
  {
    icon: '✨',
    name: 'Sparkle Shower',
    price: '$1.99',
    desc: 'Gold confetti fills their screen for 10 seconds.',
  },
  {
    icon: '🎊',
    name: 'Anniversary Kit',
    price: '$4.99',
    desc: 'Balloons, confetti, message card, and a digital toast.',
  },
  {
    icon: '🌙',
    name: 'Good Night Pack',
    price: '$1.99',
    desc: 'A gentle starfield plays on their lock screen.',
  },
  {
    icon: '☀️',
    name: 'Good Morning Beam',
    price: '$0.99',
    desc: 'A warm sunrise animation with a personal note.',
  },
];

const REAL_GIFTS = [
  {
    icon: '🌹',
    name: 'Flower Delivery',
    desc: 'Fresh flowers delivered to their door',
    price: 'From $35',
    partner: 'Teleflora',
  },
  {
    icon: '🍫',
    name: 'Artisan Chocolate',
    desc: 'Premium chocolate box sent anywhere',
    price: 'From $25',
    partner: 'Goldbelly',
  },
  {
    icon: '📮',
    name: 'Printed Postcard',
    desc: 'Your photo printed & mailed to them',
    price: '$2.99',
    partner: 'Miles Print',
  },
  {
    icon: '🎁',
    name: 'Curated Gift Box',
    desc: 'Handpicked items delivered as a surprise',
    price: 'From $49',
    partner: 'Uncommon Goods',
  },
  {
    icon: '✈️',
    name: 'Plan a Visit',
    desc: 'Search flights — start closing the distance',
    price: 'Best fares',
    partner: 'Skyscanner',
  },
];

export function ShopScreen() {
  const navigation = useNavigation();
  const { partner } = useCoupleStore();
  const entitlements = useEntitlements();
  const restoreEntitlements = useEntitlementsStore((s) => s.restore);
  const applyEntitlements = useEntitlementsStore((s) => s.apply);

  // Derive current plan from real entitlements
  const currentPlan: PlanKey = entitlements.duo
    ? 'duo'
    : entitlements.premium
      ? 'premium'
      : 'free';

  const [activeTab, setActiveTab] = useState<'plans' | 'gifts' | 'real'>('plans');
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [purchasing, setPurchasing] = useState<PlanKey | null>(null);

  // Load available packages from RevenueCat (no-op if not configured)
  useEffect(() => {
    fetchOffering()
      .then((pkgs) => {
        if (pkgs) setPackages(pkgs);
      })
      .catch(() => {});
  }, []);

  const findPackage = (planKey: PlanKey): PurchasesPackage | undefined => {
    return packages.find((p) =>
      planKey === 'premium'
        ? p.identifier.includes('premium')
        : planKey === 'duo'
          ? p.identifier.includes('duo')
          : false
    );
  };

  const handleGetPlan = async (planKey: PlanKey) => {
    if (planKey === 'free') return;

    if (!isConfigured()) {
      Alert.alert(
        'Coming soon',
        'In-app subscriptions are being set up. We\'ll launch the App Store flow here once it\'s ready.',
        [{ text: 'Got it', style: 'default' }]
      );
      return;
    }

    const pkg = findPackage(planKey);
    if (!pkg) {
      Alert.alert(
        'Not available',
        `Couldn't find the ${planKey} subscription. Try again in a moment.`
      );
      return;
    }

    setPurchasing(planKey);
    try {
      const newEntitlements = await purchasePackage(pkg);
      applyEntitlements(newEntitlements);
      Alert.alert(
        '✦ Welcome to Premium',
        'Your subscription is active. All unlocked features are now available.'
      );
    } catch (e: any) {
      if (e?.userCancelled) {
        // user cancelled — silent
      } else {
        Alert.alert(
          'Purchase failed',
          e?.message ?? 'Something went wrong. Please try again.'
        );
      }
    } finally {
      setPurchasing(null);
    }
  };

  const handleRestore = async () => {
    try {
      await restoreEntitlements();
      Alert.alert(
        'Restored',
        'If you previously purchased Premium or Duo, it\'s now active on this device.'
      );
    } catch (e: any) {
      Alert.alert("Couldn't restore", e?.message ?? 'Try again.');
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
          <Text style={styles.headerTitle}>Miles Shop</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Tab switcher */}
        <View style={styles.tabsRow}>
          {(
            [
              { key: 'plans' as const, icon: '⭐', label: 'Plans' },
              { key: 'gifts' as const, icon: '🎁', label: 'Virtual' },
              { key: 'real' as const, icon: '📦', label: 'Real Gifts' },
            ]
          ).map((t) => {
            const active = activeTab === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                style={[styles.tab, active && styles.tabActive]}
                onPress={() => setActiveTab(t.key)}
                activeOpacity={0.8}
              >
                <Text style={styles.tabIcon}>{t.icon}</Text>
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Plans ─────────────────────────────────────────────────── */}
        {activeTab === 'plans' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Choose your plan</Text>
              <Text style={styles.sectionSubtitle}>
                Upgrade anytime. Cancel anytime.
              </Text>
            </View>

            {PLANS.map((plan) => {
              const isActive = currentPlan === plan.key;

              if (plan.isPremium) {
                return (
                  <View key={plan.key} style={styles.premiumCardWrap}>
                    <View style={styles.recommendedBadge}>
                      <Text style={styles.recommendedText}>★ MOST POPULAR</Text>
                    </View>

                    <LinearGradient
                      colors={['#FFD470', '#FFB830', '#FF8C42']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.premiumCard}
                    >
                      <View style={styles.planHeader}>
                        <View style={styles.planHeaderLeft}>
                          <Text style={styles.planIcon}>{plan.icon}</Text>
                          <Text style={styles.planNameDark}>{plan.name}</Text>
                          <Text style={styles.planDescDark}>{plan.desc}</Text>
                        </View>
                        <View style={styles.planPriceWrap}>
                          <View style={styles.planPriceRow}>
                            <Text style={styles.planPriceDark}>{plan.price}</Text>
                            {plan.period && (
                              <Text style={styles.planPeriodDark}>{plan.period}</Text>
                            )}
                          </View>
                          {plan.priceNote && (
                            <Text style={styles.planPriceNoteDark}>{plan.priceNote}</Text>
                          )}
                        </View>
                      </View>

                      <View style={styles.featuresList}>
                        {plan.features.map((f) => (
                          <View key={f.text} style={styles.featureRow}>
                            <Text style={styles.featureIconDark}>{f.icon}</Text>
                            <Text style={styles.featureTextDark}>{f.text}</Text>
                          </View>
                        ))}
                      </View>

                      {isActive ? (
                        <View style={styles.currentBadgeDark}>
                          <Text style={styles.currentBadgeTextDark}>
                            ✓ Your current plan
                          </Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.getBtnDark}
                          onPress={() => handleGetPlan(plan.key)}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.getBtnTextDark}>
                            Get Premium →
                          </Text>
                        </TouchableOpacity>
                      )}
                    </LinearGradient>
                  </View>
                );
              }

              if (plan.isDark) {
                return (
                  <View key={plan.key} style={styles.darkCard}>
                    <View style={styles.planHeader}>
                      <View style={styles.planHeaderLeft}>
                        <Text style={styles.planIcon}>{plan.icon}</Text>
                        <Text style={styles.planNameLight}>{plan.name}</Text>
                        <Text style={styles.planDescLight}>{plan.desc}</Text>
                      </View>
                      <View style={styles.planPriceWrap}>
                        <View style={styles.planPriceRow}>
                          <Text style={styles.planPriceLight}>{plan.price}</Text>
                          {plan.period && (
                            <Text style={styles.planPeriodLight}>{plan.period}</Text>
                          )}
                        </View>
                        {plan.priceNote && (
                          <Text style={styles.planPriceNoteLight}>
                            {plan.priceNote}
                          </Text>
                        )}
                      </View>
                    </View>

                    <View style={styles.featuresList}>
                      {plan.features.map((f) => (
                        <View key={f.text} style={styles.featureRow}>
                          <Text style={styles.featureIconLight}>{f.icon}</Text>
                          <Text style={styles.featureTextLight}>{f.text}</Text>
                        </View>
                      ))}
                    </View>

                    {isActive ? (
                      <View style={styles.currentBadgeLight}>
                        <Text style={styles.currentBadgeTextLight}>
                          ✓ Your current plan
                        </Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.getBtnLight}
                        onPress={() => handleGetPlan(plan.key)}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.getBtnTextLight}>Get Duo →</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              }

              // Free / basic card
              return (
                <View key={plan.key} style={styles.basicCard}>
                  <View style={styles.planHeader}>
                    <View style={styles.planHeaderLeft}>
                      <Text style={styles.planIcon}>{plan.icon}</Text>
                      <Text style={styles.planName}>{plan.name}</Text>
                      <Text style={styles.planDesc}>{plan.desc}</Text>
                    </View>
                    <View style={styles.planPriceWrap}>
                      <Text style={styles.planPrice}>{plan.price}</Text>
                    </View>
                  </View>

                  <View style={styles.featuresList}>
                    {plan.features.map((f) => (
                      <View key={f.text} style={styles.featureRow}>
                        <Text style={styles.featureIcon}>{f.icon}</Text>
                        <Text style={styles.featureText}>{f.text}</Text>
                      </View>
                    ))}
                  </View>

                  {isActive ? (
                    <View style={styles.currentBadgeBasic}>
                      <Text style={styles.currentBadgeTextBasic}>
                        ✓ Your current plan
                      </Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.getBtnBasic}
                      onPress={() => setCurrentPlan('free')}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.getBtnTextBasic}>Switch to Basic</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}

            {/* Miles Coach add-on */}
            <View style={styles.coachCard}>
              <View style={styles.coachIconCircle}>
                <Text style={styles.coachIcon}>🤝</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.coachTopRow}>
                  <Text style={styles.coachTitle}>Miles Coach</Text>
                  <View style={styles.coachPriceChip}>
                    <Text style={styles.coachPriceText}>+$2.99/mo</Text>
                  </View>
                </View>
                <Text style={styles.coachSub}>
                  AI-powered conversation starters, conflict support, and personalized advice — built for LDR couples.
                </Text>
                <TouchableOpacity
                  style={styles.coachAddBtn}
                  onPress={() =>
                    Alert.alert('Miles Coach', 'Coming soon in the next update!')
                  }
                  activeOpacity={0.85}
                >
                  <Text style={styles.coachAddBtnText}>Add Coach</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Restore purchases */}
            <TouchableOpacity
              style={styles.restoreLink}
              onPress={handleRestore}
              activeOpacity={0.7}
            >
              <Text style={styles.restoreLinkText}>Restore purchases</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Virtual gifts ─────────────────────────────────────────── */}
        {activeTab === 'gifts' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Send {partner?.name ?? 'them'} something
              </Text>
              <Text style={styles.sectionSubtitle}>
                Triggers a full-screen animation on their phone with your message.
              </Text>
            </View>

            <View style={styles.giftGrid}>
              {VIRTUAL_GIFTS.map((g) => (
                <TouchableOpacity
                  key={g.name}
                  style={styles.giftCard}
                  activeOpacity={0.85}
                  onPress={() =>
                    Alert.alert(
                      `Send ${g.name}?`,
                      `${g.desc}\n\nCost: ${g.price}`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: `Send for ${g.price}`,
                          onPress: () =>
                            Alert.alert(
                              '💝 Sent!',
                              `${partner?.name ?? 'They'} just got your ${g.name}!`
                            ),
                        },
                      ]
                    )
                  }
                >
                  <View style={styles.giftIconBox}>
                    <Text style={styles.giftIcon}>{g.icon}</Text>
                  </View>
                  <Text style={styles.giftName}>{g.name}</Text>
                  <Text style={styles.giftDesc} numberOfLines={2}>
                    {g.desc}
                  </Text>
                  <View style={styles.giftFooter}>
                    <Text style={styles.giftPrice}>{g.price}</Text>
                    <View style={styles.giftSendBtn}>
                      <Text style={styles.giftSendText}>Send</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── Real gifts ────────────────────────────────────────────── */}
        {activeTab === 'real' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Real-world gifts</Text>
              <Text style={styles.sectionSubtitle}>
                Delivered to {partner?.name ?? 'them'} — wherever they are.
              </Text>
            </View>

            <View style={styles.comingSoonBanner}>
              <Text style={styles.comingSoonGlyph}>🚧</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.comingSoonTitle}>Coming in v1.1</Text>
                <Text style={styles.comingSoonSub}>
                  Real-world delivery integrations are in progress.
                </Text>
              </View>
            </View>

            <View style={styles.realList}>
              {REAL_GIFTS.map((g) => (
                <View key={g.name} style={styles.realCard}>
                  <View style={styles.realIconBox}>
                    <Text style={styles.realIcon}>{g.icon}</Text>
                  </View>
                  <View style={styles.realInfo}>
                    <Text style={styles.realName}>{g.name}</Text>
                    <Text style={styles.realDesc}>{g.desc}</Text>
                    <Text style={styles.realPartner}>via {g.partner}</Text>
                  </View>
                  <View style={styles.realRight}>
                    <Text style={styles.realPrice}>{g.price}</Text>
                    <View style={styles.realSoonChip}>
                      <Text style={styles.realSoonText}>Soon</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

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

  content: { paddingBottom: 40 },

  // Tabs
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 100,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabActive: {
    backgroundColor: Colors.dark,
    borderColor: Colors.dark,
  },
  tabIcon: { fontSize: 13 },
  tabText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
  },
  tabTextActive: {
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },

  // Section
  section: { paddingHorizontal: 16, gap: 16, paddingTop: 16 },
  sectionHeader: { paddingHorizontal: 4 },
  sectionTitle: {
    fontSize: FontSize.xl,
    color: Colors.charcoal,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.black,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
    lineHeight: 20,
  },

  // Plan card shared
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  planHeaderLeft: { flex: 1, paddingRight: 12 },
  planIcon: { fontSize: 28, marginBottom: 8 },
  planPriceWrap: { alignItems: 'flex-end' },
  planPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
  featuresList: { gap: 11, marginBottom: 18 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 11 },

  // Basic (Free) plan
  basicCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#2C2C2C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  planName: {
    fontSize: FontSize.lg,
    color: Colors.charcoal,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.3,
  },
  planDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
    marginTop: 4,
  },
  planPrice: {
    fontSize: FontSize['2xl'],
    color: Colors.charcoal,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.black,
    letterSpacing: -1,
  },
  featureIcon: { fontSize: 16, marginTop: 1 },
  featureText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.charcoal,
    fontFamily: FontFamily.regular,
    lineHeight: 19,
  },
  currentBadgeBasic: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 100,
    paddingVertical: 13,
    alignItems: 'center',
  },
  currentBadgeTextBasic: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontFamily: FontFamily.semibold,
    fontWeight: FontWeight.semibold,
  },
  getBtnBasic: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 100,
    paddingVertical: 14,
    alignItems: 'center',
  },
  getBtnTextBasic: {
    fontSize: FontSize.base,
    color: Colors.charcoal,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },

  // Premium (gold gradient) plan
  premiumCardWrap: {
    position: 'relative',
    marginTop: 14,
    shadowColor: Colors.yellow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.36,
    shadowRadius: 22,
    elevation: 14,
  },
  recommendedBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    zIndex: 10,
    backgroundColor: Colors.coral,
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 6,
    shadowColor: Colors.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  recommendedText: {
    fontSize: 10,
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    letterSpacing: 1.2,
  },
  premiumCard: {
    borderRadius: 28,
    padding: 24,
    paddingTop: 28,
  },
  planNameDark: {
    fontSize: FontSize.xl,
    color: Colors.dark,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.black,
    letterSpacing: -0.5,
  },
  planDescDark: {
    fontSize: FontSize.sm,
    color: 'rgba(26,24,20,0.7)',
    fontFamily: FontFamily.regular,
    marginTop: 4,
  },
  planPriceDark: {
    fontSize: FontSize['3xl'],
    color: Colors.dark,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.black,
    letterSpacing: -1.5,
  },
  planPeriodDark: {
    fontSize: FontSize.sm,
    color: 'rgba(26,24,20,0.7)',
    fontFamily: FontFamily.semibold,
    fontWeight: FontWeight.semibold,
  },
  planPriceNoteDark: {
    fontSize: FontSize.xs,
    color: 'rgba(26,24,20,0.6)',
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
    marginTop: 4,
  },
  featureIconDark: { fontSize: 14, marginTop: 2 },
  featureTextDark: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.dark,
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
    lineHeight: 20,
  },
  currentBadgeDark: {
    backgroundColor: 'rgba(26,24,20,0.12)',
    borderRadius: 100,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(26,24,20,0.18)',
  },
  currentBadgeTextDark: {
    fontSize: FontSize.sm,
    color: Colors.dark,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },
  getBtnDark: {
    backgroundColor: Colors.dark,
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  getBtnTextDark: {
    fontSize: FontSize.base,
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },

  // Dark Duo plan
  darkCard: {
    backgroundColor: Colors.dark,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.36,
    shadowRadius: 20,
    elevation: 12,
  },
  planNameLight: {
    fontSize: FontSize.xl,
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.black,
    letterSpacing: -0.5,
  },
  planDescLight: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.55)',
    fontFamily: FontFamily.regular,
    marginTop: 4,
  },
  planPriceLight: {
    fontSize: FontSize['3xl'],
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.black,
    letterSpacing: -1.5,
  },
  planPeriodLight: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: FontFamily.semibold,
    fontWeight: FontWeight.semibold,
  },
  planPriceNoteLight: {
    fontSize: FontSize.xs,
    color: Colors.yellow,
    fontFamily: FontFamily.semibold,
    fontWeight: FontWeight.semibold,
    marginTop: 4,
  },
  featureIconLight: { fontSize: 14, marginTop: 2 },
  featureTextLight: {
    flex: 1,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.72)',
    fontFamily: FontFamily.regular,
    lineHeight: 20,
  },
  currentBadgeLight: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 100,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  currentBadgeTextLight: {
    fontSize: FontSize.sm,
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },
  getBtnLight: {
    backgroundColor: Colors.yellow,
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.yellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.36,
    shadowRadius: 12,
    elevation: 8,
  },
  getBtnTextLight: {
    fontSize: FontSize.base,
    color: Colors.dark,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },

  // Coach card
  coachCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 22,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(155,138,196,0.3)',
    shadowColor: Colors.lavenderDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 5,
  },
  coachIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(155,138,196,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(155,138,196,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachIcon: { fontSize: 24 },
  coachTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  coachTitle: {
    fontSize: FontSize.base,
    color: Colors.charcoal,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },
  coachPriceChip: {
    backgroundColor: 'rgba(155,138,196,0.15)',
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(155,138,196,0.32)',
  },
  coachPriceText: {
    fontSize: 10,
    color: Colors.lavenderDark,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },
  coachSub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
    lineHeight: 18,
    marginBottom: 10,
  },
  coachAddBtn: {
    backgroundColor: Colors.lavenderDark,
    borderRadius: 100,
    paddingVertical: 9,
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 18,
  },
  coachAddBtnText: {
    fontSize: FontSize.sm,
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },

  restoreLink: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  restoreLinkText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
    textDecorationLine: 'underline',
  },

  // Virtual gifts
  giftGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  giftCard: {
    backgroundColor: Colors.white,
    borderRadius: 22,
    padding: 16,
    width: '47%',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#2C2C2C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  giftIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.creamDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  giftIcon: { fontSize: 28 },
  giftName: {
    fontSize: FontSize.sm,
    color: Colors.charcoal,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },
  giftDesc: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
    lineHeight: 16,
  },
  giftFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  giftPrice: {
    fontSize: FontSize.sm,
    color: Colors.charcoal,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },
  giftSendBtn: {
    backgroundColor: Colors.yellow,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  giftSendText: {
    fontSize: FontSize.xs,
    color: Colors.dark,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },

  // Real gifts
  comingSoonBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.creamDark,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  comingSoonGlyph: { fontSize: 26 },
  comingSoonTitle: {
    fontSize: FontSize.sm,
    color: Colors.charcoal,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },
  comingSoonSub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
    marginTop: 2,
    lineHeight: 17,
  },
  realList: { gap: 10 },
  realCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    opacity: 0.85,
    shadowColor: '#2C2C2C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  realIconBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: Colors.creamDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  realIcon: { fontSize: 26 },
  realInfo: { flex: 1 },
  realName: {
    fontSize: FontSize.base,
    color: Colors.charcoal,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },
  realDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
    marginTop: 2,
  },
  realPartner: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontFamily: FontFamily.regular,
    marginTop: 4,
  },
  realRight: { alignItems: 'flex-end', gap: 6 },
  realPrice: {
    fontSize: FontSize.sm,
    color: Colors.charcoal,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },
  realSoonChip: {
    backgroundColor: Colors.creamDark,
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  realSoonText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
  },
});
