import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Share,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Colors, Shadows } from '../../constants/colors';
import { FontFamily, FontSize } from '../../constants/typography';
import { Button } from '../../components/ui/Button';
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

  useEffect(() => {
    generateCode();
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

      // Fetch partner profile
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

  // Check if partner has used our code
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
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.emoji}>💌</Text>
        <Text style={styles.title}>Connect with your partner</Text>
        <Text style={styles.subtitle}>
          Share your code with them, or enter theirs to link your accounts.
        </Text>

        {/* Your invite code */}
        <View style={styles.codeSection}>
          <Text style={styles.sectionLabel}>Your invite code</Text>
          {codeLoading ? (
            <View style={[styles.codeBox, styles.codeBoxLoading]}>
              <ActivityIndicator color={Colors.yellow} />
            </View>
          ) : (
            <TouchableOpacity style={styles.codeBox} onPress={handleShare} activeOpacity={0.8}>
              <Text style={styles.code}>{displayCode}</Text>
              <Text style={styles.tapToShare}>Tap to share ↗</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Check if partner joined */}
        <Button
          label={checking ? 'Checking...' : 'Check if partner joined ↺'}
          variant="ghost"
          size="sm"
          loading={checking}
          onPress={handleCheckStatus}
          style={styles.checkBtn}
        />

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or enter their code</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.inputSection}>
          <TextInput
            value={partnerCode}
            onChangeText={(t) => { setPartnerCode(t); setError(''); }}
            placeholder="MILES-XXXXXX"
            placeholderTextColor={Colors.placeholder}
            style={styles.input}
            autoCapitalize="characters"
            autoCorrect={false}
          />
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Button
          label="Connect ♥"
          size="lg"
          onPress={handleConnect}
          loading={linking}
          disabled={!partnerCode.trim()}
          style={styles.btn}
        />

        <View style={styles.guarantee}>
          <Text style={styles.guaranteeText}>
            🔒 Your connection is private and encrypted. Only you two can see each other's data.
          </Text>
        </View>

        <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.cream },
  content: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 48, paddingBottom: 40, alignItems: 'center' },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: {
    fontSize: FontSize['2xl'],
    color: Colors.charcoal,
    fontFamily: FontFamily.bold,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  codeSection: { width: '100%', gap: 10, marginBottom: 16 },
  sectionLabel: { fontSize: FontSize.sm, color: Colors.charcoal, fontFamily: FontFamily.semibold },
  codeBox: {
    backgroundColor: Colors.yellowPale,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.yellow,
    ...Shadows.yellow,
  },
  codeBoxLoading: { paddingVertical: 32 },
  code: {
    fontSize: FontSize['2xl'],
    color: Colors.charcoal,
    fontFamily: FontFamily.bold,
    letterSpacing: 3,
  },
  tapToShare: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontFamily: FontFamily.medium,
    marginTop: 8,
  },
  checkBtn: { marginBottom: 24 },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
    gap: 12,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontSize: FontSize.sm, color: Colors.textMuted, fontFamily: FontFamily.regular },
  inputSection: { width: '100%', marginBottom: 16 },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: FontSize.base,
    color: Colors.charcoal,
    fontFamily: FontFamily.medium,
    borderWidth: 1.5,
    borderColor: Colors.border,
    textAlign: 'center',
    letterSpacing: 2,
    ...Shadows.small,
  },
  errorBox: {
    backgroundColor: '#FFF0F0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFCCCC',
    width: '100%',
  },
  errorText: {
    fontSize: FontSize.sm,
    color: '#CC3333',
    fontFamily: FontFamily.medium,
    textAlign: 'center',
  },
  btn: { width: '100%', marginBottom: 24 },
  guarantee: {
    backgroundColor: Colors.creamDark,
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 32,
  },
  guaranteeText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
    textAlign: 'center',
    lineHeight: 20,
  },
  signOutBtn: { paddingVertical: 8 },
  signOutText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontFamily: FontFamily.regular,
    textDecorationLine: 'underline',
  },
});
