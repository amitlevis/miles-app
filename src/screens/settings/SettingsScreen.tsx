/**
 * Settings — profile edit, reunion-date editor, notification prefs,
 * logout, unlink partner.
 *
 * Reachable from PartnerHeader's gear icon (added in this phase).
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { addMonths, addWeeks, format } from 'date-fns';
import { Colors } from '../../constants/colors';
import { FontFamily, FontSize, FontWeight } from '../../constants/typography';
import { useCoupleStore } from '../../store/coupleStore';
import { supabase } from '../../lib/supabase';
import { Avatar } from '../../components/ui/Avatar';

const REUNION_PRESETS = [
  { label: 'In 1 week', date: () => addWeeks(new Date(), 1) },
  { label: 'In 2 weeks', date: () => addWeeks(new Date(), 2) },
  { label: 'In 1 month', date: () => addMonths(new Date(), 1) },
  { label: 'In 3 months', date: () => addMonths(new Date(), 3) },
  { label: 'In 6 months', date: () => addMonths(new Date(), 6) },
];

export function SettingsScreen() {
  const navigation = useNavigation();
  const { user, partner, coupleId, reunionDate, setReunionDate, setUser, logout } =
    useCoupleStore();

  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [savingName, setSavingName] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [notif, setNotif] = useState({
    mood: true,
    heartbeat: true,
    photo: true,
    note: true,
  });
  const [showDateModal, setShowDateModal] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  const saveName = async () => {
    if (!user?.id || !name.trim() || name.trim() === user.name) {
      setEditingName(false);
      return;
    }
    setSavingName(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name: name.trim() })
        .eq('id', user.id);
      if (error) throw error;
      setUser({ ...user, name: name.trim() });
      setEditingName(false);
    } catch (e: any) {
      Alert.alert("Couldn't update name", e.message ?? 'Try again.');
    } finally {
      setSavingName(false);
    }
  };

  const setNewReunion = async (newDate: Date) => {
    if (!coupleId) return;
    try {
      const { error } = await supabase
        .from('couples')
        .update({ reunion_date: newDate.toISOString() })
        .eq('id', coupleId);
      if (error) throw error;
      setReunionDate(newDate);
      setShowDateModal(false);
    } catch (e: any) {
      Alert.alert("Couldn't save", e.message ?? 'Try again.');
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign out?', 'You can sign back in any time.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          logout();
        },
      },
    ]);
  };

  const handleUnlink = () => {
    if (!coupleId) return;
    Alert.alert(
      'Unlink from partner?',
      `This removes the connection between you and ${partner?.name ?? 'your partner'}. ` +
        'All shared moods, photos, and notes will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unlink',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('couples')
                .delete()
                .eq('id', coupleId);
              if (error) throw error;
              logout();
            } catch (e: any) {
              Alert.alert("Couldn't unlink", e.message ?? 'Try again.');
            }
          },
        },
      ]
    );
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
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile section */}
        <Text style={styles.sectionLabel}>YOUR PROFILE</Text>
        <View style={styles.card}>
          <View style={styles.profileRow}>
            <Avatar
              name={user?.name ?? '?'}
              uri={user?.avatar}
              size={64}
              online
            />
            <View style={styles.profileText}>
              {editingName ? (
                <View style={styles.inlineEdit}>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    style={styles.inlineInput}
                    autoFocus
                    placeholder="Your name"
                    placeholderTextColor={Colors.placeholder}
                  />
                  {savingName ? (
                    <ActivityIndicator size="small" color={Colors.yellow} />
                  ) : (
                    <TouchableOpacity
                      onPress={saveName}
                      style={styles.saveLink}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.saveLinkText}>Save</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setEditingName(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.profileName}>{user?.name ?? '—'}</Text>
                  <Text style={styles.tapToEdit}>Tap to edit name</Text>
                </TouchableOpacity>
              )}
              {email && <Text style={styles.profileEmail}>{email}</Text>}
            </View>
          </View>
        </View>

        {/* Couple section */}
        <Text style={styles.sectionLabel}>COUPLE</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Partner</Text>
            <Text style={styles.rowValue}>{partner?.name ?? '—'}</Text>
          </View>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.row}
            onPress={() => setShowDateModal(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.rowLabel}>Reunion date</Text>
            <View style={styles.rowAction}>
              <Text style={styles.rowValueAction}>
                {reunionDate ? format(reunionDate, 'MMM d, yyyy') : 'Set date'}
              </Text>
              <Text style={styles.rowArrow}>›</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.row}
            onPress={handleUnlink}
            activeOpacity={0.7}
          >
            <Text style={[styles.rowLabel, styles.dangerText]}>
              Unlink from partner
            </Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Notifications */}
        <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>
        <View style={styles.card}>
          {(
            [
              { key: 'mood' as const, label: 'Moods', desc: 'When they send a vibe' },
              { key: 'heartbeat' as const, label: 'Heartbeats', desc: 'When they send a pulse' },
              { key: 'photo' as const, label: 'Photos', desc: 'When they share a photo' },
              { key: 'note' as const, label: 'Memory Jar', desc: 'When a new note is left for you' },
            ]
          ).map((p, i, arr) => (
            <React.Fragment key={p.key}>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowLabel}>{p.label}</Text>
                  <Text style={styles.rowDesc}>{p.desc}</Text>
                </View>
                <Switch
                  value={notif[p.key]}
                  onValueChange={(v) => setNotif((n) => ({ ...n, [p.key]: v }))}
                  trackColor={{ false: Colors.border, true: `${Colors.yellow}66` }}
                  thumbColor={notif[p.key] ? Colors.yellow : Colors.creamDark}
                  ios_backgroundColor={Colors.border}
                />
              </View>
              {i < arr.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>
        <Text style={styles.noteText}>
          Push notifications require system permission. They'll start arriving
          once you grant access on the home screen.
        </Text>

        {/* Account */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.row}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Text style={[styles.rowLabel, styles.dangerText]}>Sign out</Text>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>Miles · v1.0.0</Text>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ── Reunion date modal ─────────────────────────────────────────── */}
      <Modal visible={showDateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Reunion date</Text>
            <Text style={styles.modalSub}>
              When are you next seeing {partner?.name ?? 'them'}?
            </Text>
            <View style={styles.presetList}>
              {REUNION_PRESETS.map((p) => (
                <TouchableOpacity
                  key={p.label}
                  style={styles.presetRow}
                  onPress={() => setNewReunion(p.date())}
                  activeOpacity={0.8}
                >
                  <Text style={styles.presetLabel}>{p.label}</Text>
                  <Text style={styles.presetValue}>
                    {format(p.date(), 'MMM d, yyyy')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowDateModal(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.cream },
  content: { paddingBottom: 40 },

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

  sectionLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    letterSpacing: 1.2,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 10,
  },

  card: {
    marginHorizontal: 16,
    backgroundColor: Colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    shadowColor: '#2C2C2C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  // Profile
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
  },
  profileText: { flex: 1 },
  profileName: {
    fontSize: FontSize.lg,
    color: Colors.charcoal,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.3,
  },
  tapToEdit: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontFamily: FontFamily.regular,
    marginTop: 2,
  },
  profileEmail: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
    marginTop: 6,
  },
  inlineEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inlineInput: {
    flex: 1,
    fontSize: FontSize.lg,
    color: Colors.charcoal,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.yellow,
    paddingVertical: 4,
  },
  saveLink: { paddingHorizontal: 10, paddingVertical: 4 },
  saveLinkText: {
    fontSize: FontSize.sm,
    color: Colors.yellow,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },

  // Rows
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    minHeight: 52,
    gap: 12,
  },
  rowLabel: {
    fontSize: FontSize.base,
    color: Colors.charcoal,
    fontFamily: FontFamily.semibold,
    fontWeight: FontWeight.semibold,
  },
  rowDesc: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontFamily: FontFamily.regular,
    marginTop: 2,
  },
  rowValue: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
  },
  rowAction: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowValueAction: {
    fontSize: FontSize.sm,
    color: Colors.yellow,
    fontFamily: FontFamily.semibold,
    fontWeight: FontWeight.semibold,
  },
  rowArrow: {
    fontSize: FontSize.lg,
    color: Colors.textMuted,
  },
  dangerText: { color: Colors.error },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 18,
  },

  noteText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontFamily: FontFamily.regular,
    lineHeight: 17,
    paddingHorizontal: 22,
    paddingTop: 8,
  },
  versionText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontFamily: FontFamily.regular,
    textAlign: 'center',
    marginTop: 28,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.cream,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 22,
    paddingBottom: 36,
    paddingTop: 12,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 18,
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
    marginBottom: 18,
  },
  presetList: { gap: 8, marginBottom: 14 },
  presetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  presetLabel: {
    fontSize: FontSize.base,
    color: Colors.charcoal,
    fontFamily: FontFamily.semibold,
    fontWeight: FontWeight.semibold,
  },
  presetValue: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
  },
  cancelBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginTop: 4,
  },
  cancelText: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    fontFamily: FontFamily.medium,
    fontWeight: FontWeight.medium,
  },
});
