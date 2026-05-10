import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';
import { FontFamily, FontSize, FontWeight } from '../constants/typography';
import { Avatar } from './ui/Avatar';
import { useCoupleStore } from '../store/coupleStore';
import { getPartnerTime } from '../utils/timeZone';

interface PartnerHeaderProps {
  onAvatarPress?: () => void;
  dark?: boolean;
}

export function PartnerHeader({ onAvatarPress, dark = false }: PartnerHeaderProps) {
  const { user, partner } = useCoupleStore();
  const [partnerTime, setPartnerTime] = useState('');

  useEffect(() => {
    if (!partner?.timeZone) return;
    const update = () => setPartnerTime(getPartnerTime(partner.timeZone));
    update();
    const interval = setInterval(update, 30_000);
    return () => clearInterval(interval);
  }, [partner?.timeZone]);

  if (!user || !partner) return null;

  return (
    <View style={[styles.container, dark && styles.containerDark]}>
      <View style={styles.side}>
        <TouchableOpacity onPress={onAvatarPress} activeOpacity={0.8}>
          <Avatar name={user.name} uri={user.avatar} size={40} online />
        </TouchableOpacity>
        <View>
          <Text style={[styles.roleLabel, dark && styles.mutedDark]}>you</Text>
          <Text style={[styles.name, dark && styles.nameDark]}>{user.name}</Text>
        </View>
      </View>

      <View style={styles.center}>
        <Text style={[styles.heart, dark && styles.heartDark]}>✦</Text>
      </View>

      <View style={[styles.side, styles.sideRight]}>
        <View style={styles.rightText}>
          <Text style={[styles.roleLabel, dark && styles.mutedDark, { textAlign: 'right' }]}>
            {partnerTime}
          </Text>
          <Text style={[styles.name, dark && styles.nameDark]}>{partner.name}</Text>
        </View>
        <TouchableOpacity onPress={onAvatarPress} activeOpacity={0.8}>
          <Avatar name={partner.name} uri={partner.avatar} size={40} online />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.cream,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  containerDark: {
    backgroundColor: 'transparent',
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  side: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  sideRight: { justifyContent: 'flex-end' },
  rightText: { alignItems: 'flex-end' },
  roleLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontFamily: FontFamily.regular,
    textTransform: 'lowercase',
    letterSpacing: 0.3,
  },
  name: {
    fontSize: FontSize.base,
    color: Colors.charcoal,
    fontFamily: FontFamily.semibold,
    fontWeight: FontWeight.semibold,
  },
  nameDark: { color: Colors.textOnDark },
  mutedDark: { color: Colors.textOnDarkMuted },
  center: { alignItems: 'center', paddingHorizontal: 8 },
  heart: { fontSize: 14, color: Colors.coral },
  heartDark: { color: 'rgba(255,122,92,0.7)' },
});
