import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Share,
  ScrollView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize, FontWeight } from '../../constants/typography';
import { useCoupleStore } from '../../store/coupleStore';
import { supabase } from '../../lib/supabase';

export function CoupleLinkScreen() {
  const [inviteCode, setInviteCode] = useState('');
  const [partnerCode, setPartnerCode] = useState('');
  const [codeLoading, setCodeLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const { linkPartner } = useCoupleStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(32)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    generateCode();
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();

    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2400, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.5, duration: 2400, useNativeDriver: true }),
      ])
    );
    glowLoop.start();
    return () => glowLoop.stop();
  }, []);

  const generateCode = async () => {
    setCodeLoading(true);
    try {
      const { data, error: rpcError } = await supabase.rpc('generate_invite_code');
      if (rpcError) throw rpcError;
      setInviteCode(data as string);
    } catch (e) {
      setInviteCode('ERROR');
    } finally {
      setCodeLoading(false);
    }
  };

  const displayCode = inviteCode ? `MILES-${inviteCode}` : '';

  const handleShare = async () => {
    if (!displayCode) return;
    await Share.share({
      message: `Join me on Miles! Use my code ${displayCode} to connect with me. Download Miles and let's close the distance together ♥`,
    });
  };

  const handleConnect = async () => {
    const raw = partnerCode.trim().toUpperCase().replace('MILES-', '');
    if (!raw) return;
    setLinking(true);
    setError('');

    try {
      const { data, error: rpcError } = await supabase.rpc('use_invite_code', { p_code: raw });
      if (rpcError) throw rpcError;

      const result = data as { success?: boolean; error?: string; couple_id?: string };
      if (result.error) {
        setError(result.error);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: couple } = await supabase
        .from('couples')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .single();

      if (couple) {
        const partnerId = couple.user1_id === user.id ? couple.user2_id : couple.user1_id;
        const { data: partnerProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', partnerId)
          .single();

        if (partnerProfile) {
          linkPartner({
            id: partnerProfile.id,
            name: partnerProfile.name,
            avatar: partnerProfile.avatar_url,
            timeZone: 'UTC',
            location: null,
          });
        }
      }
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong. Try again.');
    } finally {
      setLinking(false);
    }
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: couple } = await supabase
        .from('couples')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .maybeSingle();

      if (couple) {
        const partnerId = couple.user1_id === user.id ? couple.user2_id : couple.user1_id;
        const { data: partnerProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', partnerId)
          .single();

        if (partnerProfile) {
          linkPartner({
            id: partnerProfile.id,
            name: partnerProfile.name,
            avatar: partnerProfile.avatar_url,
            timeZone: 'UTC',
            location: null,
          });
          return;
        }
      }
      setError("Your partner hasn't joined yet. Share your code with them!");
    } catch (e) {
      setError('Check failed. Try again.');
    } finally {
      setChecking(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#0B0A09', '#16120D', '#231A0F', '#0B0A09']}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Ambient glow */}
      <Animated.View
        style={[styles.glow, { opacity: glowAnim }]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={['rgba(255,184,48,0.22)', 'rgba(255,122,92,0.1)', 'transparent']}
          style={{ flex: 1, borderRadius: 600 }}
        />
      </Animated.View>

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              width: '100%',
              alignItems: 'center',
            }}
          >
            {/* Header */}
            <View style={styles.iconCircle}>
              <Text style={styles.iconGlyph}>💌</Text>
            </View>

            <Text style={styles.title}>Connect with{'\n'}your partner</Text>
            <Text style={styles.subtitle}>
              Share your code or enter theirs.{'\n'}You'll be linked instantly.
            </Text>

            {/* Your invite code card */}
            <View style={styles.codeCard}>
              <Text style={styles.codeLabel}>your invite code</Text>

              {codeLoading ? (
                <View style={styles.codeLoadingWrap}>
                  <ActivityIndicator color={Colors.yellow} />
                </View>
              ) : (
                <Text style={styles.code}>{displayCode}</Text>
              )}

              <View style={styles.codeActions}>
                <TouchableOpacity
                  style={styles.shareBtn}
                  onPress={handleShare}
                  activeOpacity={0.85}
                  disabled={codeLoading}
                >
                  <Text style={styles.shareBtnText}>Share code ↗</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.checkBtn}
                  onPress={handleCheckStatus}
                  activeOpacity={0.8}
                  disabled={checking}
                >
                  {checking ? (
                    <ActivityIndicator size="small" color={Colors.yellow} />
                  ) : (
                    <Text style={styles.checkBtnText}>↺ Check status</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR ENTER THEIR CODE</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Partner code input */}
            <TextInput
              value={partnerCode}
              onChangeText={(t) => {
                setPartnerCode(t);
                setError('');
              }}
              placeholder="MILES-XXXXXX"
              placeholderTextColor="rgba(255,255,255,0.25)"
              style={styles.input}
              autoCapitalize="characters"
              autoCorrect={false}
            />

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorIcon}>!</Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Connect button */}
            <TouchableOpacity
              onPress={handleConnect}
              disabled={!partnerCode.trim() || linking}
              activeOpacity={0.88}
              style={[
                styles.connectWrap,
                (!partnerCode.trim() || linking) && styles.connectDisabled,
              ]}
            >
              <LinearGradient
                colors={['#FFD470', '#FFB830', '#FF8C42']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.connectGradient}
              >
                {linking ? (
                  <ActivityIndicator color={Colors.dark} />
                ) : (
                  <Text style={styles.connectText}>Connect ♥</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Privacy callout */}
            <View style={styles.privacyCard}>
              <Text style={styles.privacyIcon}>🔒</Text>
              <Text style={styles.privacyText}>
                Your connection is private and encrypted.{'\n'}
                Only you two can see each other's data.
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleSignOut}
              style={styles.signOutBtn}
              activeOpacity={0.6}
            >
              <Text style={styles.signOutText}>Sign out</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B0A09' },
  safe: { flex: 1 },
  glow: {
    position: 'absolute',
    top: -200,
    left: -150,
    width: 600,
    height: 600,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },

  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,184,48,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,184,48,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconGlyph: { fontSize: 38 },
  title: {
    fontSize: FontSize['2xl'],
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.black,
    letterSpacing: -1,
    textAlign: 'center',
    lineHeight: FontSize['2xl'] * 1.15,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: FontSize.base,
    color: 'rgba(255,255,255,0.45)',
    fontFamily: FontFamily.regular,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },

  codeCard: {
    width: '100%',
    backgroundColor: 'rgba(255,184,48,0.07)',
    borderRadius: 28,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,184,48,0.22)',
    gap: 16,
    marginBottom: 28,
    shadowColor: Colors.yellow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 6,
  },
  codeLabel: {
    fontSize: FontSize.xs,
    color: 'rgba(255,184,48,0.65)',
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 1.8,
  },
  codeLoadingWrap: {
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  code: {
    fontSize: 30,
    color: Colors.yellow,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.black,
    letterSpacing: 3,
  },
  codeActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 4,
  },
  shareBtn: {
    flex: 1,
    backgroundColor: Colors.yellow,
    borderRadius: 100,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: Colors.yellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  shareBtnText: {
    fontSize: FontSize.sm,
    color: Colors.dark,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },
  checkBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 100,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  checkBtnText: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 18,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.35)',
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
    letterSpacing: 1.5,
  },

  input: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: FontSize.md,
    color: Colors.white,
    fontFamily: FontFamily.semibold,
    fontWeight: FontWeight.semibold,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    textAlign: 'center',
    letterSpacing: 2.5,
    marginBottom: 16,
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(248,113,113,0.1)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.3)',
    width: '100%',
  },
  errorIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(248,113,113,0.3)',
    color: Colors.error,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.error,
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
  },

  connectWrap: {
    width: '100%',
    borderRadius: 100,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: Colors.yellow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.42,
    shadowRadius: 18,
    elevation: 10,
  },
  connectDisabled: { opacity: 0.4 },
  connectGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  connectText: {
    fontSize: FontSize.md,
    color: Colors.dark,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.2,
  },

  privacyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    width: '100%',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  privacyIcon: { fontSize: 20 },
  privacyText: {
    flex: 1,
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: FontFamily.regular,
    lineHeight: 18,
  },

  signOutBtn: { paddingVertical: 8 },
  signOutText: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.3)',
    fontFamily: FontFamily.regular,
    textDecorationLine: 'underline',
  },
});
