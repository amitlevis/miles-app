import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';
import { FontFamily, FontSize } from '../constants/typography';
import { Avatar } from './ui/Avatar';
import { useCoupleStore } from '../store/coupleStore';
import { getPartnerTime } from '../utils/timeZone';

interface PartnerHeaderProps {
  onAvatarPress?: () => void;
}

export function PartnerHeader({ onAvatarPress }: PartnerHeaderProps) {
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
    <View style={styles.container}>
      <View style={styles.side}>
        <TouchableOpacity onPress={onAvatarPress}>
          <Avatar name={user.name} uri={user.avatar} size={40} online />
        </TouchableOpacity>
        <View style={styles.info}>
          <Text style={styles.you}>You</Text>
          <Text style={styles.name}>{user.name}</Text>
        </View>
      </View>

      <View style={styles.center}>
        <Text style={styles.heart}>♥</Text>
      </View>

      <View style={[styles.side, styles.sideRight]}>
        <View style={[styles.info, styles.infoRight]}>
          <Text style={styles.partnerTime}>{partnerTime}</Text>
          <Text style={styles.name}>{partner.name}</Text>
        </View>
        <TouchableOpacity onPress={onAvatarPress}>
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
    paddingVertical: 12,
    backgroundColor: Colors.cream,
  },
  side: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  sideRight: {
    justifyContent: 'flex-end',
  },
  info: { flexDirection: 'column' },
  infoRight: { alignItems: 'flex-end' },
  you: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontFamily: FontFamily.regular,
  },
  name: {
    fontSize: FontSize.base,
    color: Colors.charcoal,
    fontFamily: FontFamily.semibold,
  },
  partnerTime: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontFamily: FontFamily.regular,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heart: {
    fontSize: 20,
    color: Colors.coral,
  },
});
