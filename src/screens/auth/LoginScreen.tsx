import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize, FontWeight } from '../../constants/typography';
import { supabase } from '../../lib/supabase';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Login'> };
type Mode = 'signup' | 'signin';

export function LoginScreen({ navigation }: Props) {
  const [mode, setMode] = useState<Mode>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(32)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const isSignUp = mode === 'signup';
  const canSubmit = isSignUp
    ? name.trim().length > 0 && email.trim().length > 0 && password.length >= 6
    : email.trim().length > 0 && password.length >= 6;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: name.trim() } },
        });
        if (signUpError) setError(signUpError.message);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) {
          setError(
            signInError.message === 'Invalid login credentials'
              ? 'Incorrect email or password.'
              : signInError.message
          );
        }
      }
    } catch (e) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#0B0A09', '#16120D', '#231A0F', '#0B0A09']}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Ambient glow */}
      <View style={styles.glow} pointerEvents="none">
        <LinearGradient
          colors={['rgba(255,184,48,0.16)', 'transparent']}
          style={{ flex: 1, borderRadius: 600 }}
        />
      </View>

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.kav}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>

            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              <Text style={styles.title}>
                {isSignUp ? 'Create your\naccount' : 'Welcome\nback'}
              </Text>
              <Text style={styles.subtitle}>
                {isSignUp
                  ? "You'll invite your partner after signing up."
                  : 'Sign in to reconnect with your partner.'}
              </Text>

              {/* Mode toggle */}
              <View style={styles.toggle}>
                <TouchableOpacity
                  style={[styles.toggleBtn, isSignUp && styles.toggleBtnActive]}
                  onPress={() => {
                    setMode('signup');
                    setError('');
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.toggleText, isSignUp && styles.toggleTextActive]}>
                    Sign Up
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, !isSignUp && styles.toggleBtnActive]}
                  onPress={() => {
                    setMode('signin');
                    setError('');
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.toggleText, !isSignUp && styles.toggleTextActive]}>
                    Sign In
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.form}>
                {isSignUp && (
                  <View style={styles.field}>
                    <Text style={styles.fieldLabel}>Your name</Text>
                    <TextInput
                      value={name}
                      onChangeText={setName}
                      placeholder="What should we call you?"
                      placeholderTextColor="rgba(255,255,255,0.25)"
                      style={styles.input}
                      autoFocus={isSignUp}
                      autoCorrect={false}
                    />
                  </View>
                )}

                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Email</Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    style={styles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus={!isSignUp}
                  />
                </View>

                <View style={styles.field}>
                  <View style={styles.fieldLabelRow}>
                    <Text style={styles.fieldLabel}>Password</Text>
                    {isSignUp && (
                      <Text style={styles.fieldHint}>min 6 characters</Text>
                    )}
                  </View>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder={isSignUp ? 'Choose a password' : 'Your password'}
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    style={styles.input}
                    secureTextEntry
                  />
                </View>
              </View>

              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorIcon}>!</Text>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Submit button (gradient) */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!canSubmit || loading}
                activeOpacity={0.88}
                style={[
                  styles.submitWrap,
                  (!canSubmit || loading) && styles.submitDisabled,
                ]}
              >
                <LinearGradient
                  colors={['#FFD470', '#FFB830', '#FF8C42']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitGradient}
                >
                  {loading ? (
                    <ActivityIndicator color={Colors.dark} />
                  ) : (
                    <Text style={styles.submitText}>
                      {isSignUp ? 'Create account →' : 'Sign in →'}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <Text style={styles.terms}>
                By continuing you agree to our{'\n'}Terms of Service and Privacy Policy.
              </Text>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B0A09' },
  safe: { flex: 1 },
  kav: { flex: 1 },
  glow: {
    position: 'absolute',
    top: -200,
    left: -150,
    width: 600,
    height: 600,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 12,
    paddingBottom: 40,
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 4,
    marginBottom: 24,
  },
  backText: {
    fontSize: FontSize.base,
    color: 'rgba(255,255,255,0.55)',
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
  },
  title: {
    fontSize: FontSize['3xl'],
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.black,
    letterSpacing: -1.5,
    lineHeight: FontSize['3xl'] * 1.1,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: FontSize.base,
    color: 'rgba(255,255,255,0.45)',
    fontFamily: FontFamily.regular,
    lineHeight: 22,
    marginBottom: 32,
  },

  toggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: 'rgba(255,184,48,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,184,48,0.3)',
  },
  toggleText: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.45)',
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
  },
  toggleTextActive: {
    color: Colors.yellow,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },

  form: { gap: 16, marginBottom: 20 },
  field: { gap: 8 },
  fieldLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  fieldLabel: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.55)',
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  fieldHint: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.3)',
    fontFamily: FontFamily.regular,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: FontSize.base,
    color: Colors.white,
    fontFamily: FontFamily.regular,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(248,113,113,0.1)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.3)',
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

  submitWrap: {
    borderRadius: 100,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 20,
    shadowColor: Colors.yellow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.42,
    shadowRadius: 18,
    elevation: 10,
  },
  submitDisabled: { opacity: 0.4 },
  submitGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  submitText: {
    fontSize: FontSize.md,
    color: Colors.dark,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.2,
  },

  terms: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.25)',
    fontFamily: FontFamily.regular,
    textAlign: 'center',
    lineHeight: 18,
  },
});
